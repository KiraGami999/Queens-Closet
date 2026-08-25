import type { NextRequest } from "next/server";

import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { createUser } from "@/lib/services/user-service";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const body = await request.json();
    const input = registerSchema.parse(body);

    const user = await createUser(input);

    return apiSuccess(user, 201);
  });
}
