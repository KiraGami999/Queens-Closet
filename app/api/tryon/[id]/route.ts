import { auth } from "@/auth";
import { apiError, apiSuccess, ApiErrorCode, withApiErrorHandling } from "@/lib/api/response";
import { refreshTryOnSessionStatus } from "@/lib/services/tryon-service";

/** Polls the active AI provider for a session's latest status (steps 10-12
 * of the generation flow) and returns the refreshed record. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return apiError(ApiErrorCode.UNAUTHENTICATED, "Please sign in.", 401);
    }

    const { id } = await params;
    const result = await refreshTryOnSessionStatus({ userId, sessionId: id });

    return apiSuccess(result);
  });
}
