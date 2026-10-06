import { AppError, ApiErrorCode } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { getImageStorage } from "@/lib/storage";
import type { InspectedImage } from "@/lib/utils/image-validation";
import type { GarmentCategoryInput } from "@/lib/validations/garment";
import type { CreateGarmentInput, UpdateGarmentInput } from "@/lib/validations/garment";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export type ListGarmentsParams = {
  userId: string;
  page?: number;
  pageSize?: number;
  category?: GarmentCategoryInput;
  includeArchived?: boolean;
};

/** Paginated garment listing — the catalogue must never be loaded in full
 * (see project performance rules). */
export async function listGarments(params: ListGarmentsParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  const where = {
    userId: params.userId,
    ...(params.category && { category: params.category }),
    ...(params.includeArchived ? {} : { archivedAt: null }),
  };

  const [items, total] = await Promise.all([
    prisma.garment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { images: true },
    }),
    prisma.garment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getGarmentOrThrow(params: { userId: string; garmentId: string }) {
  const garment = await prisma.garment.findFirst({
    where: { id: params.garmentId, userId: params.userId },
    include: { images: true },
  });

  if (!garment) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Garment not found.", 404);
  }

  return garment;
}

export async function createGarment(params: {
  userId: string;
  input: CreateGarmentInput;
}) {
  return prisma.garment.create({
    data: {
      userId: params.userId,
      name: params.input.name,
      category: params.input.category,
      description: params.input.description || null,
    },
  });
}

/** Uploads the garment image to storage, then creates the garment and its
 * image record together. Removes the uploaded file if the DB write fails so
 * storage never accumulates orphans. */
export async function createGarmentWithImage(params: {
  userId: string;
  input: CreateGarmentInput;
  image: InspectedImage;
  fileName: string;
}) {
  const storage = getImageStorage();
  const uploaded = await storage.upload({
    pathPrefix: `garments/${params.userId}`,
    fileName: params.fileName,
    contentType: params.image.contentType,
    data: params.image.buffer,
  });

  try {
    return await prisma.garment.create({
      data: {
        userId: params.userId,
        name: params.input.name,
        category: params.input.category,
        description: params.input.description || null,
        images: {
          create: {
            url: uploaded.url,
            storageKey: uploaded.storageKey,
            width: params.image.width,
            height: params.image.height,
            format: params.image.format,
          },
        },
      },
      include: { images: true },
    });
  } catch (error) {
    await storage.delete(uploaded.storageKey).catch(() => undefined);
    throw error;
  }
}

export async function updateGarment(params: {
  userId: string;
  garmentId: string;
  input: UpdateGarmentInput;
}) {
  await getGarmentOrThrow({ userId: params.userId, garmentId: params.garmentId });

  return prisma.garment.update({
    where: { id: params.garmentId },
    data: {
      ...(params.input.name !== undefined && { name: params.input.name }),
      ...(params.input.category !== undefined && { category: params.input.category }),
      ...(params.input.description !== undefined && {
        description: params.input.description || null,
      }),
    },
  });
}

/** Soft-deletes (archives) a garment instead of destroying the catalogue
 * record, per the project's soft-deletion rule. */
export async function archiveGarment(params: { userId: string; garmentId: string }) {
  await getGarmentOrThrow({ userId: params.userId, garmentId: params.garmentId });

  return prisma.garment.update({
    where: { id: params.garmentId },
    data: { archivedAt: new Date() },
  });
}

export async function addGarmentImage(params: {
  userId: string;
  garmentId: string;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  format: "JPG" | "JPEG" | "PNG" | "WEBP";
}) {
  await getGarmentOrThrow({ userId: params.userId, garmentId: params.garmentId });

  return prisma.garmentImage.create({
    data: {
      garmentId: params.garmentId,
      url: params.url,
      storageKey: params.storageKey,
      width: params.width,
      height: params.height,
      format: params.format,
    },
  });
}
