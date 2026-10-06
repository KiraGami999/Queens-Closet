import { AppError, ApiErrorCode } from "@/lib/api/response";
import { cancelVirtualTryOnGeneration, getActiveTryOnProviderName } from "@/lib/ai";
import { prisma } from "@/lib/db/prisma";
import type { TryOnStatus, UserRole } from "@/lib/generated/prisma/client";
import { getStorageBackendName } from "@/lib/storage";

const ADMIN_PAGE_SIZE = 25;
const TREND_DAYS = 14;

/**
 * Platform-operator queries. Admins see operational data (accounts,
 * generation health, errors) — never client photos or contact details, which
 * stay private to the studio that owns them.
 */
export async function requireAdmin(userId: string | undefined) {
  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHENTICATED, "Please sign in.", 401);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, suspendedAt: true },
  });
  if (!user || user.role !== "ADMIN" || user.suspendedAt) {
    throw new AppError(ApiErrorCode.FORBIDDEN, "You don't have access to the admin console.", 403);
  }
  return user;
}

export type DailyGenerationPoint = {
  date: string;
  completed: number;
  failed: number;
  other: number;
};

export async function getPlatformOverview() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1));
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    admins,
    suspended,
    newUsersThisWeek,
    clients,
    garments,
    statusGroups,
    recentSessions,
    newestUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { suspendedAt: { not: null } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.garment.count({ where: { archivedAt: null } }),
    prisma.tryOnSession.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.tryOnSession.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  const statusCounts: Record<TryOnStatus, number> = {
    QUEUED: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    FAILED: 0,
    CANCELLED: 0,
  };
  for (const group of statusGroups) {
    statusCounts[group.status] = group._count._all;
  }
  const totalGenerations = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const finished = statusCounts.COMPLETED + statusCounts.FAILED;
  const successRate = finished > 0 ? Math.round((statusCounts.COMPLETED / finished) * 100) : null;

  const trend: DailyGenerationPoint[] = Array.from({ length: TREND_DAYS }, (_, i) => {
    const day = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    return { date: day.toISOString().slice(0, 10), completed: 0, failed: 0, other: 0 };
  });
  const trendIndex = new Map(trend.map((point, i) => [point.date, i]));
  for (const session of recentSessions) {
    const index = trendIndex.get(session.createdAt.toISOString().slice(0, 10));
    if (index === undefined) continue;
    const point = trend[index]!;
    if (session.status === "COMPLETED") point.completed += 1;
    else if (session.status === "FAILED") point.failed += 1;
    else point.other += 1;
  }

  return {
    users: { total: totalUsers, admins, suspended, newThisWeek: newUsersThisWeek },
    catalogue: { clients, garments },
    generations: { total: totalGenerations, byStatus: statusCounts, successRate },
    trend,
    newestUsers,
  };
}

export type HealthCheck = {
  key: string;
  label: string;
  status: "ok" | "warning" | "error";
  detail: string;
};

/** Reports whether each integration is configured — never its secret value. */
export async function getSystemHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  const started = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Math.round(performance.now() - started);
    checks.push({
      key: "database",
      label: "Neon Postgres",
      status: latency > 1500 ? "warning" : "ok",
      detail: `Connected · ${latency} ms round-trip`,
    });
  } catch (error) {
    console.error("[admin] database health check failed", error);
    checks.push({ key: "database", label: "Neon Postgres", status: "error", detail: "Unreachable" });
  }

  let providerName = "unknown";
  try {
    providerName = getActiveTryOnProviderName();
  } catch (error) {
    console.error("[admin] AI provider misconfigured", error);
  }
  const hasKey = Boolean(process.env.AI_API_KEY);
  checks.push({
    key: "ai",
    label: "AI try-on provider",
    status: providerName === "unknown" ? "error" : providerName === "mock" ? "warning" : hasKey ? "ok" : "error",
    detail:
      providerName === "mock"
        ? "Mock provider — demo mode, no real AI calls"
        : providerName === "unknown"
          ? "AI_PROVIDER is not a supported value"
          : `${providerName.toUpperCase()} · ${hasKey ? "API key configured" : "API key missing"}`,
  });

  const storage = getStorageBackendName();
  checks.push({
    key: "storage",
    label: "Image storage",
    status: storage === "vercel-blob" ? "ok" : storage === "local" ? "warning" : "error",
    detail:
      storage === "vercel-blob"
        ? "Vercel Blob connected"
        : storage === "local"
          ? "Local disk (development only)"
          : "BLOB_READ_WRITE_TOKEN missing",
  });

  checks.push({
    key: "auth",
    label: "Authentication",
    status: process.env.AUTH_SECRET ? "ok" : "error",
    detail: process.env.AUTH_SECRET ? "Auth.js secret configured" : "AUTH_SECRET missing",
  });

  return checks;
}

export async function listUsersForAdmin(params: { search?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const search = params.search?.trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspendedAt: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { clients: true, garments: true, tryOnSessions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function listGenerationsForAdmin(params: { status?: TryOnStatus; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = params.status ? { status: params.status } : {};

  const [items, total] = await Promise.all([
    prisma.tryOnSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        status: true,
        providerName: true,
        errorCode: true,
        errorMessage: true,
        createdAt: true,
        completedAt: true,
        user: { select: { name: true, email: true } },
        garment: { select: { name: true, category: true } },
      },
    }),
    prisma.tryOnSession.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function listAuditLogs(params: { page?: number; take?: number }) {
  const take = params.take ?? ADMIN_PAGE_SIZE;
  const page = Math.max(1, params.page ?? 1);
  const [items, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.adminAuditLog.count(),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / take)) };
}

async function getTargetUserOrThrow(actorId: string, targetUserId: string) {
  if (actorId === targetUserId) {
    throw new AppError(
      ApiErrorCode.FORBIDDEN,
      "You can't change your own account from the admin console.",
      403
    );
  }
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, role: true, suspendedAt: true },
  });
  if (!target) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Account not found.", 404);
  }
  return target;
}

export async function setUserRole(params: { actorId: string; targetUserId: string; role: UserRole }) {
  const target = await getTargetUserOrThrow(params.actorId, params.targetUserId);
  if (target.role === params.role) return;

  await prisma.$transaction([
    prisma.user.update({ where: { id: target.id }, data: { role: params.role } }),
    prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: params.role === "ADMIN" ? "user.promoted" : "user.demoted",
        targetType: "user",
        targetId: target.id,
        summary: `${params.role === "ADMIN" ? "Granted" : "Removed"} admin access for ${target.email}`,
      },
    }),
  ]);
}

export async function setUserSuspended(params: {
  actorId: string;
  targetUserId: string;
  suspended: boolean;
}) {
  const target = await getTargetUserOrThrow(params.actorId, params.targetUserId);
  if (Boolean(target.suspendedAt) === params.suspended) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.id },
      data: { suspendedAt: params.suspended ? new Date() : null },
    }),
    prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: params.suspended ? "user.suspended" : "user.reactivated",
        targetType: "user",
        targetId: target.id,
        summary: `${params.suspended ? "Suspended" : "Reactivated"} ${target.email}`,
      },
    }),
  ]);
}

/** Cancels a generation that is stuck in QUEUED/PROCESSING so it stops
 * counting against the studio's in-flight limit. */
export async function cancelGeneration(params: { actorId: string; sessionId: string }) {
  const session = await prisma.tryOnSession.findUnique({
    where: { id: params.sessionId },
    select: { id: true, status: true, providerJobId: true, user: { select: { email: true } } },
  });
  if (!session) {
    throw new AppError(ApiErrorCode.NOT_FOUND, "Generation not found.", 404);
  }
  if (session.status !== "QUEUED" && session.status !== "PROCESSING") {
    throw new AppError(ApiErrorCode.CONFLICT, "Only in-flight generations can be cancelled.", 409);
  }

  if (session.providerJobId) {
    await cancelVirtualTryOnGeneration(session.providerJobId).catch((error: unknown) => {
      console.error("[admin] provider cancel failed", error);
    });
  }

  await prisma.$transaction([
    prisma.tryOnSession.update({
      where: { id: session.id },
      data: {
        status: "CANCELLED",
        errorCode: "CANCELLED_BY_ADMIN",
        errorMessage: "This generation was cancelled by the studio team.",
        completedAt: new Date(),
      },
    }),
    prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: "generation.cancelled",
        targetType: "tryOnSession",
        targetId: session.id,
        summary: `Cancelled a stuck generation for ${session.user.email}`,
      },
    }),
  ]);
}
