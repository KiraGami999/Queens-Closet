import { FalProvider } from "@/lib/ai/providers/fal-provider";
import { FashnProvider } from "@/lib/ai/providers/fashn-provider";
import { MockProvider } from "@/lib/ai/providers/mock-provider";
import type { VirtualTryOnProvider } from "@/lib/ai/virtual-try-on-provider";

/**
 * Provider registry. Queens Closet never talks to a vendor SDK from the UI —
 * VirtualTryOnService selects one of these via AI_PROVIDER.
 *
 * Supported:
 * - mock  — free local stand-in (default while no paid key is available)
 * - fashn — FASHN cloud API (AI_API_KEY = FASHN key)
 * - fal   — fal.ai hosted try-on (AI_API_KEY = fal key)
 */
const providers: Record<string, () => VirtualTryOnProvider> = {
  mock: () => new MockProvider(),
  fashn: () => new FashnProvider(),
  fal: () => new FalProvider(),
};

/**
 * Resolves the active VirtualTryOnProvider from the `AI_PROVIDER` env var.
 * Swapping providers is a one-line env change — no UI or service code needs
 * to know which vendor is behind this interface.
 */
export function getVirtualTryOnProvider(): VirtualTryOnProvider {
  const providerName = process.env.AI_PROVIDER?.toLowerCase() || "mock";
  const factory = providers[providerName];

  if (!factory) {
    throw new Error(
      `Unknown AI_PROVIDER "${providerName}". Supported providers: ${Object.keys(providers).join(", ")}.`
    );
  }

  return factory();
}

export * from "@/lib/ai/virtual-try-on-provider";
export * from "@/lib/ai/virtual-try-on-service";
