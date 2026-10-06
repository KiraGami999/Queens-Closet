import { z } from "zod";

export const tryOnStatusSchema = z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]);

export type TryOnStatusValue = z.infer<typeof tryOnStatusSchema>;

export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]),
});

export const setUserSuspendedSchema = z.object({
  userId: z.string().min(1),
  suspended: z.boolean(),
});

export const cancelGenerationSchema = z.object({
  sessionId: z.string().min(1),
});

export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;
export type SetUserSuspendedInput = z.infer<typeof setUserSuspendedSchema>;
export type CancelGenerationInput = z.infer<typeof cancelGenerationSchema>;
