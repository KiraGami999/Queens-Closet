import { getVirtualTryOnProvider } from "@/lib/ai";
import type {
  TryOnGenerationHandle,
  TryOnGenerationInput,
  TryOnStatusResult,
} from "@/lib/ai/virtual-try-on-provider";

/**
 * Application-facing virtual try-on service.
 *
 * Queens Closet → VirtualTryOnService → FASHN | fal.ai | mock | future
 *
 * UI and domain services call this layer only. Swapping providers is an
 * `AI_PROVIDER` env change — never a UI rewrite.
 */
export async function createVirtualTryOnGeneration(
  input: TryOnGenerationInput
): Promise<TryOnGenerationHandle> {
  return getVirtualTryOnProvider().createGeneration(input);
}

export async function getVirtualTryOnGenerationStatus(
  providerJobId: string
): Promise<TryOnStatusResult> {
  return getVirtualTryOnProvider().getStatus(providerJobId);
}

export async function cancelVirtualTryOnGeneration(
  providerJobId: string
): Promise<void> {
  const provider = getVirtualTryOnProvider();
  if (!provider.cancel) {
    return;
  }
  await provider.cancel(providerJobId);
}

export function getActiveTryOnProviderName(): string {
  return getVirtualTryOnProvider().name;
}
