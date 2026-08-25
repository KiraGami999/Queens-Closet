/**
 * Provider-agnostic virtual try-on abstraction. Every AI call in the app
 * must go through this interface — never call a provider SDK/API directly
 * from a route handler or service. This lets the provider be swapped
 * (e.g. FASHN -> another vendor) without any UI or service-layer changes.
 */

export type TryOnProviderStatus =
  | "starting"
  | "in_queue"
  | "processing"
  | "completed"
  | "failed";

/**
 * Canonical AI input — every provider receives the same shape:
 * person image + garment image + garment type + optional description.
 */
export type TryOnGenerationInput = {
  /** Publicly fetchable URL or data URI of the person/model photo. */
  personImageUrl: string;
  /** Publicly fetchable URL or data URI of the garment photo. */
  garmentImageUrl: string;
  /** App-level garment category / type (TOP, DRESS, etc.). */
  garmentCategory: string;
  /** Optional styling instructions for providers that support prompts. */
  description?: string;
};

export type TryOnGenerationHandle = {
  providerJobId: string;
};

export type TryOnStatusResult = {
  status: TryOnProviderStatus;
  /** Present once status is "completed". */
  resultUrl?: string;
  /** Present once status is "failed". Safe to log; not shown to end users. */
  providerErrorDetail?: string;
};

/**
 * Normalized error for all provider failures. Route handlers/services catch
 * this and surface `userMessage` to the client — provider internals
 * (`providerDetail`) must only ever be logged server-side, never returned
 * in an API response.
 */
export class TryOnProviderError extends Error {
  readonly code:
    | "INVALID_INPUT"
    | "AUTH_ERROR"
    | "RATE_LIMITED"
    | "PROVIDER_UNAVAILABLE"
    | "GENERATION_FAILED"
    | "UNKNOWN";
  readonly userMessage: string;
  readonly providerDetail?: string;

  constructor(params: {
    code: TryOnProviderError["code"];
    userMessage: string;
    providerDetail?: string;
  }) {
    super(params.userMessage);
    this.name = "TryOnProviderError";
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.providerDetail = params.providerDetail;
  }
}

export interface VirtualTryOnProvider {
  readonly name: string;

  /** Submits a new generation request. Resolves once the provider has
   * accepted the job (not once it's finished generating). */
  createGeneration(input: TryOnGenerationInput): Promise<TryOnGenerationHandle>;

  /** Polls the current status of a previously created generation. */
  getStatus(providerJobId: string): Promise<TryOnStatusResult>;

  /** Cancels an in-flight generation, if the provider supports it. */
  cancel?(providerJobId: string): Promise<void>;
}
