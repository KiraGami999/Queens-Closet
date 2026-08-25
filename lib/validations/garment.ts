import { z } from "zod";

export const garmentCategorySchema = z.enum([
  "TOP",
  "BOTTOM",
  "DRESS",
  "OUTERWEAR",
  "FOOTWEAR",
  "ACCESSORY",
  "FULL_BODY",
]);

export type GarmentCategoryInput = z.infer<typeof garmentCategorySchema>;

export const createGarmentSchema = z.object({
  name: z.string().trim().min(1, "Garment name is required.").max(150),
  category: garmentCategorySchema,
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CreateGarmentInput = z.infer<typeof createGarmentSchema>;

export const updateGarmentSchema = createGarmentSchema.partial();

export type UpdateGarmentInput = z.infer<typeof updateGarmentSchema>;
