import { AppError, ApiErrorCode } from "@/lib/api/response";
import {
  createVirtualTryOnGeneration,
  getActiveTryOnProviderName,
  getVirtualTryOnGenerationStatus,
  TryOnProviderError,
} from "@/lib/ai";
import { prisma } from "@/lib/db/prisma";
import { getClientOrThrow } from "@/lib/services/client-service";
import { getGarmentOrThrow } from "@/lib/services/garment-service";
import type { CreateTryOnSessionInput } from "@/lib/validations/tryon";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function getTryOnSessionOrThrow(params: {
  userId: string;
  sessionId: string;
}) {
  const session = await prisma.tryOnSession.findFirst({
    where: { id: params.sessionId, userId: params.userId },
    include: { client: true, clientPhoto: true, garment: true, garmentImage: true },
  });

  if (!session) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Generation not found.", 404);
  }

  return session;
}

export async function listTryOnSessions(params: {
  userId: string;
  page?: number;
  pageSize?: number;
  status?: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const where = {
    userId: params.userId,
    ...(params.status && { status: params.status }),
  };

  const [items, total] = await Promise.all([
    prisma.tryOnSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { client: true, clientPhoto: true, garment: true, garmentImage: true },
    }),
    prisma.tryOnSession.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Steps 1-6 of the generation flow: validates that the referenced client
 * photo and garment image belong to the requesting user, then creates the
 * TryOnSession record with status QUEUED. Image/category validation happens
 * earlier, at upload time (see lib/utils/image-validation.ts).
 */
export async function createTryOnSession(params: {
  userId: string;
  input: CreateTryOnSessionInput;
}) {
  const client = await getClientOrThrow({
    userId: params.userId,
    clientId: params.input.clientId,
  });
  const garment = await getGarmentOrThrow({
    userId: params.userId,
    garmentId: params.input.garmentId,
  });

  const clientPhoto = client.photos.find((p) => p.id === params.input.clientPhotoId);
  if (!clientPhoto) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Client photo not found.", 404);
  }

  const garmentImage = garment.images.find((i) => i.id === params.input.garmentImageId);
  if (!garmentImage) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Garment image not found.", 404);
  }

  const providerName = getActiveTryOnProviderName();

  return prisma.tryOnSession.create({
    data: {
      userId: params.userId,
      clientId: client.id,
      clientPhotoId: clientPhoto.id,
      garmentId: garment.id,
      garmentImageId: garmentImage.id,
      status: "QUEUED",
      providerName,
      description: params.input.description || null,
    },
  });
}

/**
 * Steps 7-9: submits a QUEUED session to the provider, stores the provider
 * job id, and moves status to PROCESSING. Guards against double-submission
 * (AI cost protection) by only acting on sessions still in QUEUED.
 */
export async function submitTryOnSession(params: { userId: string; sessionId: string }) {
  const session = await getTryOnSessionOrThrow(params);

  if (session.status !== "QUEUED") {
    return session;
  }

  const providerName = getActiveTryOnProviderName();

  try {
    const { providerJobId } = await createVirtualTryOnGeneration({
      personImageUrl: session.clientPhoto.url,
      garmentImageUrl: session.garmentImage.url,
      garmentCategory: session.garment.category,
      description: session.description ?? undefined,
    });

    return prisma.tryOnSession.update({
      where: { id: session.id },
      data: { status: "PROCESSING", providerJobId, providerName },
    });
  } catch (error) {
    return failTryOnSession({ session, error });
  }
}

/** Steps 10-12: polls provider status and stores the terminal result. */
export async function refreshTryOnSessionStatus(params: {
  userId: string;
  sessionId: string;
}) {
  const session = await getTryOnSessionOrThrow(params);

  if (session.status !== "PROCESSING" || !session.providerJobId) {
    return session;
  }

  try {
    const result = await getVirtualTryOnGenerationStatus(session.providerJobId);

    if (result.status === "completed" && result.resultUrl) {
      return prisma.tryOnSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          resultUrl: result.resultUrl,
          completedAt: new Date(),
        },
      });
    }

    if (result.status === "failed") {
      return prisma.tryOnSession.update({
        where: { id: session.id },
        data: {
          status: "FAILED",
          errorCode: "PROVIDER_GENERATION_FAILED",
          errorMessage:
            "We couldn't generate this look. Please try another photo or garment image.",
          completedAt: new Date(),
        },
      });
    }

    // Still starting/in_queue/processing — no DB change needed yet.
    return session;
  } catch (error) {
    return failTryOnSession({ session, error });
  }
}

async function failTryOnSession(params: { session: { id: string }; error: unknown }) {
  const { session, error } = params;
  const isProviderError = error instanceof TryOnProviderError;

  console.error("Try-on generation failed:", error);

  return prisma.tryOnSession.update({
    where: { id: session.id },
    data: {
      status: "FAILED",
      errorCode: isProviderError ? error.code : "UNKNOWN",
      errorMessage: isProviderError
        ? error.userMessage
        : "We couldn't generate this look. Please try another photo or garment image.",
      completedAt: new Date(),
    },
  });
}
