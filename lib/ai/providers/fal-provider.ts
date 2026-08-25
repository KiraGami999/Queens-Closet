import {
  TryOnProviderError,
  type TryOnGenerationHandle,
  type TryOnGenerationInput,
  type TryOnStatusResult,
  type VirtualTryOnProvider,
} from "@/lib/ai/virtual-try-on-provider";

const FAL_MODEL_ID = "fal-ai/fashn/tryon/v1.6";
const FAL_QUEUE_BASE = `https://queue.fal.run/${FAL_MODEL_ID}`;

type FalSubmitResponse = {
  request_id: string;
  status?: string;
};

type FalStatusResponse = {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  error?: string;
};

type FalResultResponse = {
  images?: Array<{ url: string }>;
  image?: { url: string };
};

function getFalKey(): string {
  // When AI_PROVIDER=fal, AI_API_KEY holds the fal.ai key.
  const apiKey = process.env.AI_API_KEY ?? process.env.FAL_KEY;
  if (!apiKey) {
    throw new TryOnProviderError({
      code: "AUTH_ERROR",
      userMessage:
        "Virtual try-on is not configured yet. Please contact support.",
      providerDetail: "AI_API_KEY (or FAL_KEY) is not set for fal provider.",
    });
  }
  return apiKey;
}

async function falFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Key ${getFalKey()}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (cause) {
    throw new TryOnProviderError({
      code: "PROVIDER_UNAVAILABLE",
      userMessage:
        "We couldn't reach the try-on service. Please try again shortly.",
      providerDetail: cause instanceof Error ? cause.message : String(cause),
    });
  }

  if (response.status === 401 || response.status === 403) {
    throw new TryOnProviderError({
      code: "AUTH_ERROR",
      userMessage:
        "Virtual try-on is not configured correctly. Please contact support.",
      providerDetail: `fal.ai responded ${response.status}`,
    });
  }

  if (response.status === 429) {
    throw new TryOnProviderError({
      code: "RATE_LIMITED",
      userMessage:
        "We're generating a lot of looks right now. Please try again in a moment.",
      providerDetail: "fal.ai rate limit exceeded",
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new TryOnProviderError({
      code: "UNKNOWN",
      userMessage:
        "We couldn't generate this look. Please try another photo or garment image.",
      providerDetail: `fal.ai responded ${response.status}: ${body}`,
    });
  }

  return (await response.json()) as T;
}

/**
 * fal.ai host of FASHN try-on models.
 * Docs: https://fal.ai/models/fal-ai/fashn/tryon/v1.6
 *
 * Set AI_PROVIDER=fal and AI_API_KEY=<fal key> to use this provider.
 */
export class FalProvider implements VirtualTryOnProvider {
  readonly name = "fal";

  async createGeneration(
    input: TryOnGenerationInput
  ): Promise<TryOnGenerationHandle> {
    const data = await falFetch<FalSubmitResponse>(FAL_QUEUE_BASE, {
      method: "POST",
      body: JSON.stringify({
        model_image: input.personImageUrl,
        garment_image: input.garmentImageUrl,
        ...(input.description
          ? { garment_description: input.description }
          : {}),
        ...(input.garmentCategory
          ? { category: input.garmentCategory.toLowerCase() }
          : {}),
      }),
    });

    if (!data.request_id) {
      throw new TryOnProviderError({
        code: "INVALID_INPUT",
        userMessage:
          "We couldn't start this generation. Please check your photos and try again.",
        providerDetail: "fal.ai submit returned no request_id",
      });
    }

    return { providerJobId: data.request_id };
  }

  async getStatus(providerJobId: string): Promise<TryOnStatusResult> {
    const statusUrl = `${FAL_QUEUE_BASE}/requests/${providerJobId}/status`;
    const status = await falFetch<FalStatusResponse>(statusUrl);

    if (status.status === "FAILED") {
      return {
        status: "failed",
        providerErrorDetail: status.error ?? "Unknown fal.ai failure",
      };
    }

    if (status.status === "IN_QUEUE") {
      return { status: "in_queue" };
    }

    if (status.status === "IN_PROGRESS") {
      return { status: "processing" };
    }

    if (status.status === "COMPLETED") {
      const resultUrl = `${FAL_QUEUE_BASE}/requests/${providerJobId}`;
      const result = await falFetch<FalResultResponse>(resultUrl);
      const imageUrl = result.images?.[0]?.url ?? result.image?.url;

      if (!imageUrl) {
        return {
          status: "failed",
          providerErrorDetail: "fal.ai completed with no image url",
        };
      }

      return { status: "completed", resultUrl: imageUrl };
    }

    return { status: "processing" };
  }
}
