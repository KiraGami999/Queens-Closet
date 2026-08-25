import {
  TryOnProviderError,
  type TryOnGenerationHandle,
  type TryOnGenerationInput,
  type TryOnProviderStatus,
  type TryOnStatusResult,
  type VirtualTryOnProvider,
} from "@/lib/ai/virtual-try-on-provider";

const FASHN_BASE_URL = "https://api.fashn.ai/v1";
const FASHN_MODEL_NAME = "tryon-max";

type FashnRunResponse = {
  id: string;
  error: string | null;
};

type FashnStatusResponse = {
  id: string;
  status: TryOnProviderStatus;
  output: string[] | null;
  error: string | null;
};

function getApiKey(): string {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new TryOnProviderError({
      code: "AUTH_ERROR",
      userMessage:
        "Virtual try-on is not configured yet. Please contact support.",
      providerDetail: "AI_API_KEY is not set.",
    });
  }
  return apiKey;
}

async function fashnFetch<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${FASHN_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
        ...init.headers,
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
      providerDetail: `FASHN responded ${response.status}`,
    });
  }

  if (response.status === 429) {
    throw new TryOnProviderError({
      code: "RATE_LIMITED",
      userMessage:
        "We're generating a lot of looks right now. Please try again in a moment.",
      providerDetail: "FASHN rate limit exceeded",
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new TryOnProviderError({
      code: "UNKNOWN",
      userMessage:
        "We couldn't generate this look. Please try another photo or garment image.",
      providerDetail: `FASHN responded ${response.status}: ${body}`,
    });
  }

  return (await response.json()) as T;
}

/**
 * FASHN AI implementation of VirtualTryOnProvider.
 * Docs: https://docs.fashn.ai/api-reference/tryon-max
 */
export class FashnProvider implements VirtualTryOnProvider {
  readonly name = "fashn";

  async createGeneration(
    input: TryOnGenerationInput
  ): Promise<TryOnGenerationHandle> {
    const data = await fashnFetch<FashnRunResponse>("/run", {
      method: "POST",
      body: JSON.stringify({
        model_name: FASHN_MODEL_NAME,
        inputs: {
          model_image: input.personImageUrl,
          product_image: input.garmentImageUrl,
        },
      }),
    });

    if (data.error || !data.id) {
      throw new TryOnProviderError({
        code: "INVALID_INPUT",
        userMessage:
          "We couldn't start this generation. Please check your photos and try again.",
        providerDetail: data.error ?? "FASHN /run returned no id",
      });
    }

    return { providerJobId: data.id };
  }

  async getStatus(providerJobId: string): Promise<TryOnStatusResult> {
    const data = await fashnFetch<FashnStatusResponse>(
      `/status/${providerJobId}`,
      { method: "GET" }
    );

    if (data.status === "failed") {
      return {
        status: "failed",
        providerErrorDetail: data.error ?? "Unknown provider failure",
      };
    }

    if (data.status === "completed") {
      const resultUrl = data.output?.[0];
      if (!resultUrl) {
        return {
          status: "failed",
          providerErrorDetail: "FASHN reported completed with no output",
        };
      }
      return { status: "completed", resultUrl };
    }

    return { status: data.status };
  }
}
