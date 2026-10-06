import { del, put } from "@vercel/blob";

import type {
  ImageStorage,
  UploadImageInput,
  UploadImageResult,
} from "@/lib/storage/image-storage";

/**
 * Vercel Blob implementation of ImageStorage.
 *
 * Blobs are uploaded with `access: "public"` and a random suffix (unguessable
 * URL, no path collisions) because the virtual try-on provider must be able
 * to fetch person/garment images by URL. This is a standard trade-off for
 * third-party AI APIs that only accept image URLs; if stricter privacy is
 * required later, switch to `access: "private"` and either (a) proxy reads
 * through an authenticated `/api/images/[key]` route, or (b) fetch the blob
 * server-side and send it to the provider as a base64 data URI instead of a
 * URL (FASHN's API accepts both).
 */
export class VercelBlobStorage implements ImageStorage {
  async upload(input: UploadImageInput): Promise<UploadImageResult> {
    const pathname = `${input.pathPrefix}/${input.fileName}`;

    const blob = await put(pathname, input.data, {
      access: "public",
      addRandomSuffix: true,
      contentType: input.contentType,
    });

    // Vercel Blob's `del()` takes the blob's full URL (not just its
    // pathname), so we store the URL as the storage key too.
    return {
      url: blob.url,
      storageKey: blob.url,
    };
  }

  async delete(storageKey: string): Promise<void> {
    await del(storageKey);
  }
}
