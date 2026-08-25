import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, apiSuccess, ApiErrorCode, withApiErrorHandling } from "@/lib/api/response";
import { createTryOnSession, submitTryOnSession } from "@/lib/services/tryon-service";
import { createTryOnSessionSchema } from "@/lib/validations/tryon";

/** Creates a QUEUED try-on session then immediately submits it to the active
 * AI provider, per the generation flow (steps 1-9). */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return apiError(ApiErrorCode.UNAUTHENTICATED, "Please sign in.", 401);
    }

    const body = await request.json();
    const input = createTryOnSessionSchema.parse(body);

    const created = await createTryOnSession({ userId, input });
    const submitted = await submitTryOnSession({ userId, sessionId: created.id });

    return apiSuccess(submitted, 201);
  });
}
