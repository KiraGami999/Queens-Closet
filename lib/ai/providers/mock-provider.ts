import {
  type TryOnGenerationHandle,
  type TryOnGenerationInput,
  type TryOnStatusResult,
  type VirtualTryOnProvider,
} from "@/lib/ai/virtual-try-on-provider";

type MockJobPayload = {
  personImageUrl: string;
  garmentImageUrl: string;
  readyAt: number;
};

const MOCK_DELAY_MS = 2_000;

function encodeJob(payload: MockJobPayload): string {
  return `mock_${Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")}`;
}

function decodeJob(providerJobId: string): MockJobPayload | null {
  if (!providerJobId.startsWith("mock_")) {
    return null;
  }
  try {
    const raw = Buffer.from(providerJobId.slice("mock_".length), "base64url").toString(
      "utf8"
    );
    return JSON.parse(raw) as MockJobPayload;
  } catch {
    return null;
  }
}

/**
 * Zero-cost provider for local/dev and unpaid environments.
 * Simulates queue latency, then returns the person image as a stand-in
 * "generated look" so the rest of the product flow can be built and demoed.
 */
export class MockProvider implements VirtualTryOnProvider {
  readonly name = "mock";

  async createGeneration(
    input: TryOnGenerationInput
  ): Promise<TryOnGenerationHandle> {
    return {
      providerJobId: encodeJob({
        personImageUrl: input.personImageUrl,
        garmentImageUrl: input.garmentImageUrl,
        readyAt: Date.now() + MOCK_DELAY_MS,
      }),
    };
  }

  async getStatus(providerJobId: string): Promise<TryOnStatusResult> {
    const payload = decodeJob(providerJobId);
    if (!payload) {
      return {
        status: "failed",
        providerErrorDetail: "Invalid mock job id",
      };
    }

    if (Date.now() < payload.readyAt) {
      return { status: "processing" };
    }

    // Stand-in result: person photo until a real AI provider is configured.
    return {
      status: "completed",
      resultUrl: payload.personImageUrl,
    };
  }
}
