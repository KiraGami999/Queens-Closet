import type { ApiResponseBody } from "@/lib/api/response";

const NETWORK_ERROR: ApiResponseBody<never> = {
  success: false,
  error: { code: "NETWORK_ERROR", message: "We couldn't reach the studio. Please check your connection and try again." },
};

/** Browser-side helper for multipart uploads to our own API routes. Always
 * resolves to the standard response envelope — never throws. */
export async function postFormData<T>(url: string, body: FormData): Promise<ApiResponseBody<T>> {
  try {
    const response = await fetch(url, { method: "POST", body });
    if (response.status === 413) {
      return {
        success: false,
        error: { code: "PAYLOAD_TOO_LARGE", message: "That image is too large to upload. Please try a smaller file." },
      };
    }
    return (await response.json()) as ApiResponseBody<T>;
  } catch {
    return NETWORK_ERROR;
  }
}
