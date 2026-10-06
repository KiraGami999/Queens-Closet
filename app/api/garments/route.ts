import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, apiSuccess, ApiErrorCode, withApiErrorHandling } from "@/lib/api/response";
import { createGarmentWithImage } from "@/lib/services/garment-service";
import { inspectImageUpload } from "@/lib/utils/image-validation";
import { createGarmentSchema } from "@/lib/validations/garment";

/** Creates a garment with its primary image (multipart form data). */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return apiError(ApiErrorCode.UNAUTHENTICATED, "Please sign in.", 401);
    }

    const form = await request.formData();
    const input = createGarmentSchema.parse({
      name: form.get("name"),
      category: form.get("category"),
      description: form.get("description") ?? "",
    });

    const file = form.get("image");
    if (!(file instanceof File)) {
      return apiError(ApiErrorCode.VALIDATION_ERROR, "Please add a garment image.", 422);
    }

    const image = await inspectImageUpload(file);
    const garment = await createGarmentWithImage({ userId, input, image, fileName: file.name });

    return apiSuccess({ id: garment.id }, 201);
  });
}
