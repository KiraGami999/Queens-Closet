"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { AppError } from "@/lib/api/response";
import {
  cancelGeneration,
  requireAdmin,
  setUserRole,
  setUserSuspended,
} from "@/lib/services/admin-service";
import {
  cancelGenerationSchema,
  setUserRoleSchema,
  setUserSuspendedSchema,
  type CancelGenerationInput,
  type SetUserRoleInput,
  type SetUserSuspendedInput,
} from "@/lib/validations/admin";

export type AdminActionResult = { success: true } | { success: false; message: string };

async function runAdminAction(
  mutate: (actorId: string) => Promise<void>
): Promise<AdminActionResult> {
  try {
    const session = await auth();
    const admin = await requireAdmin(session?.user?.id);
    await mutate(admin.id);
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) return { success: false, message: error.message };
    if (error instanceof ZodError) return { success: false, message: "That request wasn't valid." };
    console.error("[admin] action failed", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function setUserRoleAction(input: SetUserRoleInput) {
  return runAdminAction(async (actorId) => {
    const { userId, role } = setUserRoleSchema.parse(input);
    await setUserRole({ actorId, targetUserId: userId, role });
  });
}

export async function setUserSuspendedAction(input: SetUserSuspendedInput) {
  return runAdminAction(async (actorId) => {
    const { userId, suspended } = setUserSuspendedSchema.parse(input);
    await setUserSuspended({ actorId, targetUserId: userId, suspended });
  });
}

export async function cancelGenerationAction(input: CancelGenerationInput) {
  return runAdminAction(async (actorId) => {
    const { sessionId } = cancelGenerationSchema.parse(input);
    await cancelGeneration({ actorId, sessionId });
  });
}
