import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API response envelope used by every route handler, per the
 * project rules: `{ success: true, data }` or
 * `{ success: false, error: { code, message } }`. Never return raw
 * exceptions to the client.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponseBody<T> = ApiSuccess<T> | ApiErrorBody;

export function apiSuccess<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data },
    typeof init === "number" ? { status: init } : init
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400
): NextResponse<ApiErrorBody> {
  return NextResponse.json<ApiErrorBody>(
    { success: false, error: { code, message } },
    { status }
  );
}

export const ApiErrorCode = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCodeValue = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/** Domain error that services/route handlers can throw and that the shared
 * handler below converts into a safe, user-facing API response. */
export class AppError extends Error {
  readonly code: ApiErrorCodeValue;
  readonly status: number;

  constructor(code: ApiErrorCodeValue, message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Wraps a route handler body, normalizing thrown errors into the standard
 * error envelope and ensuring internal error details/stack traces are
 * logged server-side only, never sent to the client.
 */
export async function withApiErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiResponseBody<T>>>
): Promise<NextResponse<ApiResponseBody<T>>> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AppError) {
      return apiError(error.code, error.message, error.status);
    }

    if (error instanceof ZodError) {
      return apiError(
        ApiErrorCode.VALIDATION_ERROR,
        error.issues[0]?.message ?? "Invalid request.",
        422
      );
    }

    console.error("Unhandled API error:", error);
    return apiError(
      ApiErrorCode.INTERNAL_ERROR,
      "Something went wrong. Please try again.",
      500
    );
  }
}
