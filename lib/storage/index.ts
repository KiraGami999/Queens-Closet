import { AppError, ApiErrorCode } from "@/lib/api/response";
import type { ImageStorage } from "@/lib/storage/image-storage";
import { LocalFileStorage } from "@/lib/storage/local-file-storage";
import { VercelBlobStorage } from "@/lib/storage/vercel-blob-storage";

export type StorageBackendName = "vercel-blob" | "local" | "unconfigured";

export function getStorageBackendName(): StorageBackendName {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  if (process.env.NODE_ENV !== "production") return "local";
  return "unconfigured";
}

/** Resolves the active ImageStorage. Vercel Blob whenever a token is set;
 * local disk only as a development fallback. */
export function getImageStorage(): ImageStorage {
  const backend = getStorageBackendName();

  if (backend === "vercel-blob") return new VercelBlobStorage();
  if (backend === "local") return new LocalFileStorage();

  console.error("[storage] BLOB_READ_WRITE_TOKEN is not set in production.");
  throw new AppError(
    ApiErrorCode.INTERNAL_ERROR,
    "Image uploads aren't available right now. Please try again later.",
    503
  );
}

export type { ImageStorage, UploadImageInput, UploadImageResult } from "@/lib/storage/image-storage";
