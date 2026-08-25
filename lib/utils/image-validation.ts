import { AppError, ApiErrorCode } from "@/lib/api/response";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_IMAGE_DIMENSION_PX = 256;
export const MAX_IMAGE_DIMENSION_PX = 8000;

export type ImageFormat = "JPG" | "JPEG" | "PNG" | "WEBP";

export type ImageDimensions = {
  width: number;
  height: number;
};

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : "";
}

/** Validates MIME type, extension, and file size for an uploaded image.
 * Throws an AppError with a user-facing message on failure. */
export function validateImageFile(file: {
  name: string;
  type: string;
  size: number;
}): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      "Please upload a JPG, PNG, or WEBP image.",
      422
    );
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      "Unsupported file extension. Please upload a .jpg, .jpeg, .png, or .webp file.",
      422
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      `Image is too large. Please upload a file under ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`,
      422
    );
  }

  if (file.size === 0) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      "The uploaded file is empty.",
      422
    );
  }
}

/** Validates decoded image pixel dimensions. Call after reading dimensions
 * from the file (e.g. via `image-size` or a canvas/sharp probe). */
export function validateImageDimensions(dimensions: ImageDimensions): void {
  const { width, height } = dimensions;

  if (
    width < MIN_IMAGE_DIMENSION_PX ||
    height < MIN_IMAGE_DIMENSION_PX
  ) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      `Image is too small. Please upload an image at least ${MIN_IMAGE_DIMENSION_PX}x${MIN_IMAGE_DIMENSION_PX}px.`,
      422
    );
  }

  if (
    width > MAX_IMAGE_DIMENSION_PX ||
    height > MAX_IMAGE_DIMENSION_PX
  ) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      `Image is too large. Please upload an image under ${MAX_IMAGE_DIMENSION_PX}x${MAX_IMAGE_DIMENSION_PX}px.`,
      422
    );
  }
}

export function mimeTypeToImageFormat(mimeType: string): ImageFormat {
  switch (mimeType) {
    case "image/jpeg":
      return "JPEG";
    case "image/png":
      return "PNG";
    case "image/webp":
      return "WEBP";
    default:
      throw new AppError(
        ApiErrorCode.VALIDATION_ERROR,
        "Unsupported image format.",
        422
      );
  }
}
