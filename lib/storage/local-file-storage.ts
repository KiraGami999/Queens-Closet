import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
  ImageStorage,
  UploadImageInput,
  UploadImageResult,
} from "@/lib/storage/image-storage";

const PUBLIC_DIR = join(process.cwd(), "public");
const UPLOADS_PREFIX = "uploads";

function sanitizeSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function toBuffer(data: UploadImageInput["data"]): Promise<Buffer> {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  return Buffer.from(await data.arrayBuffer());
}

/**
 * Development-only ImageStorage that writes into `public/uploads` so the
 * studio can be demoed locally without a Vercel Blob token. Serverless
 * filesystems are read-only, so this is never selected in production, and
 * external AI providers can't fetch `localhost` URLs — use with `mock` only.
 */
export class LocalFileStorage implements ImageStorage {
  async upload(input: UploadImageInput): Promise<UploadImageResult> {
    const prefix = input.pathPrefix.split("/").map(sanitizeSegment).join("/");
    const suffix = randomBytes(6).toString("hex");
    const fileName = `${suffix}-${sanitizeSegment(input.fileName)}`;
    const relativePath = `${UPLOADS_PREFIX}/${prefix}/${fileName}`;
    const absolutePath = join(PUBLIC_DIR, relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, await toBuffer(input.data));

    return { url: `/${relativePath}`, storageKey: relativePath };
  }

  async delete(storageKey: string): Promise<void> {
    if (!storageKey.startsWith(`${UPLOADS_PREFIX}/`) || storageKey.includes("..")) {
      return;
    }
    await unlink(join(PUBLIC_DIR, storageKey)).catch(() => undefined);
  }
}
