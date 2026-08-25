import { FashnProvider } from "@/lib/ai/providers/fashn-provider";
import type { VirtualTryOnProvider } from "@/lib/ai/virtual-try-on-provider";

const providers: Record<string, () => VirtualTryOnProvider> = {
  fashn: () => new FashnProvider(),
};

/**
 * Resolves the active VirtualTryOnProvider from the `AI_PROVIDER` env var.
 * Swapping providers is a one-line env change — no UI or service code needs
 * to know which vendor is behind this interface.
 */
export function getVirtualTryOnProvider(): VirtualTryOnProvider {
  const providerName = process.env.AI_PROVIDER?.toLowerCase() || "fashn";
  const factory = providers[providerName];

  if (!factory) {
    throw new Error(
      `Unknown AI_PROVIDER "${providerName}". Supported providers: ${Object.keys(providers).join(", ")}.`
    );
  }

  return factory();
}

export * from "@/lib/ai/virtual-try-on-provider";
