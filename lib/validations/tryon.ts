import { z } from "zod";

export const createTryOnSessionSchema = z.object({
  clientId: z.string().min(1, "Select a client."),
  clientPhotoId: z.string().min(1, "Select a client photo."),
  garmentId: z.string().min(1, "Select a garment."),
  garmentImageId: z.string().min(1, "Select a garment image."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateTryOnSessionInput = z.infer<typeof createTryOnSessionSchema>;
