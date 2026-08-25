/**
 * Storage abstraction for uploaded images. Route handlers/services must go
 * through this interface instead of calling a storage SDK directly, so the
 * provider (Vercel Blob today) can be swapped without touching callers.
 * Only URLs + metadata are persisted in Postgres — never raw image bytes.
 */
export type UploadImageInput = {
  /** Logical folder/prefix, e.g. `garments` or `clients/<clientId>`. */
  pathPrefix: string;
  fileName: string;
  contentType: string;
  data: Buffer | Blob | ArrayBuffer;
};

export type UploadImageResult = {
  url: string;
  storageKey: string;
};

export interface ImageStorage {
  upload(input: UploadImageInput): Promise<UploadImageResult>;
  delete(storageKey: string): Promise<void>;
}
