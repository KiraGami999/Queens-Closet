import { AppError, ApiErrorCode } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { getImageStorage } from "@/lib/storage";
import type { InspectedImage } from "@/lib/utils/image-validation";
import type { CreateClientInput, UpdateClientInput } from "@/lib/validations/client";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export type ListClientsParams = {
  userId: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export async function listClients(params: ListClientsParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  const where = {
    userId: params.userId,
    ...(params.includeArchived ? {} : { archivedAt: null }),
  };

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        photos: true,
        _count: { select: { tryOnSessions: true } },
        tryOnSessions: {
          where: { status: "COMPLETED" },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Fetches a client, throwing NOT_FOUND if it doesn't exist or belongs to
 * another user — this is how cross-user access is prevented at the data
 * layer, not just in the UI. */
export async function getClientOrThrow(params: { userId: string; clientId: string }) {
  const client = await prisma.client.findFirst({
    where: { id: params.clientId, userId: params.userId },
    include: { photos: true },
  });

  if (!client) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Client not found.", 404);
  }

  return client;
}

export async function createClient(params: {
  userId: string;
  input: CreateClientInput;
}) {
  return prisma.client.create({
    data: {
      userId: params.userId,
      name: params.input.name,
      email: params.input.email || null,
      phone: params.input.phone || null,
      notes: params.input.notes || null,
      consentGiven: params.input.consentGiven,
      consentAt: params.input.consentGiven ? new Date() : null,
    },
  });
}

/** Creates a client with their first portrait. Client photos are sensitive,
 * so a photo is only accepted once consent has been recorded. */
export async function createClientWithPhoto(params: {
  userId: string;
  input: CreateClientInput;
  photo: InspectedImage;
  fileName: string;
}) {
  if (!params.input.consentGiven) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      "Please confirm the client has consented before uploading their photo.",
      422
    );
  }

  const storage = getImageStorage();
  const uploaded = await storage.upload({
    pathPrefix: `clients/${params.userId}`,
    fileName: params.fileName,
    contentType: params.photo.contentType,
    data: params.photo.buffer,
  });

  try {
    return await prisma.client.create({
      data: {
        userId: params.userId,
        name: params.input.name,
        email: params.input.email || null,
        phone: params.input.phone || null,
        notes: params.input.notes || null,
        consentGiven: true,
        consentAt: new Date(),
        photos: {
          create: {
            url: uploaded.url,
            storageKey: uploaded.storageKey,
            width: params.photo.width,
            height: params.photo.height,
            format: params.photo.format,
          },
        },
      },
      include: { photos: true },
    });
  } catch (error) {
    await storage.delete(uploaded.storageKey).catch(() => undefined);
    throw error;
  }
}

export async function updateClient(params: {
  userId: string;
  clientId: string;
  input: UpdateClientInput;
}) {
  await getClientOrThrow({ userId: params.userId, clientId: params.clientId });

  return prisma.client.update({
    where: { id: params.clientId },
    data: {
      ...(params.input.name !== undefined && { name: params.input.name }),
      ...(params.input.email !== undefined && { email: params.input.email || null }),
      ...(params.input.phone !== undefined && { phone: params.input.phone || null }),
      ...(params.input.notes !== undefined && { notes: params.input.notes || null }),
      ...(params.input.consentGiven !== undefined && {
        consentGiven: params.input.consentGiven,
        consentAt: params.input.consentGiven ? new Date() : null,
      }),
    },
  });
}

/** Soft-deletes a client (archive) rather than destroying the record, per
 * the project's catalogue soft-deletion rule. */
export async function archiveClient(params: { userId: string; clientId: string }) {
  await getClientOrThrow({ userId: params.userId, clientId: params.clientId });

  return prisma.client.update({
    where: { id: params.clientId },
    data: { archivedAt: new Date() },
  });
}

/** Permanently deletes a client and their photos — used when a client
 * explicitly withdraws consent and requests full data deletion. */
export async function permanentlyDeleteClient(params: {
  userId: string;
  clientId: string;
}) {
  await getClientOrThrow({ userId: params.userId, clientId: params.clientId });

  return prisma.client.delete({ where: { id: params.clientId } });
}

export async function addClientPhoto(params: {
  userId: string;
  clientId: string;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  format: "JPG" | "JPEG" | "PNG" | "WEBP";
}) {
  await getClientOrThrow({ userId: params.userId, clientId: params.clientId });

  return prisma.clientPhoto.create({
    data: {
      clientId: params.clientId,
      url: params.url,
      storageKey: params.storageKey,
      width: params.width,
      height: params.height,
      format: params.format,
    },
  });
}
