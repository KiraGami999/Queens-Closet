import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, apiSuccess, ApiErrorCode, withApiErrorHandling } from "@/lib/api/response";
import { createClientWithPhoto } from "@/lib/services/client-service";
import { inspectImageUpload } from "@/lib/utils/image-validation";
import { createClientSchema } from "@/lib/validations/client";

/** Creates a client with their first portrait (multipart form data). */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return apiError(ApiErrorCode.UNAUTHENTICATED, "Please sign in.", 401);
    }

    const form = await request.formData();
    const input = createClientSchema.parse({
      name: form.get("name"),
      email: form.get("email") ?? "",
      phone: form.get("phone") ?? "",
      notes: form.get("notes") ?? "",
      consentGiven: form.get("consentGiven") === "true",
    });

    const file = form.get("photo");
    if (!(file instanceof File)) {
      return apiError(ApiErrorCode.VALIDATION_ERROR, "Please add a client photo.", 422);
    }

    const photo = await inspectImageUpload(file);
    const client = await createClientWithPhoto({ userId, input, photo, fileName: file.name });

    return apiSuccess({ id: client.id }, 201);
  });
}
