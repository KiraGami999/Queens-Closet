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

const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function readJpegDimensions(buf: Buffer): ImageDimensions | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1]!;
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    if (JPEG_SOF_MARKERS.has(marker)) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function readPngDimensions(buf: Buffer): ImageDimensions | null {
  const signature = "89504e470d0a1a0a";
  if (buf.length < 24 || buf.subarray(0, 8).toString("hex") !== signature) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function readWebpDimensions(buf: Buffer): ImageDimensions | null {
  if (
    buf.length < 30 ||
    buf.toString("ascii", 0, 4) !== "RIFF" ||
    buf.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const b0 = buf[21]!;
    const b1 = buf[22]!;
    const b2 = buf[23]!;
    const b3 = buf[24]!;
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }
  if (chunk === "VP8X") {
    return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  }
  return null;
}

export type InspectedImage = ImageDimensions & {
  buffer: Buffer;
  format: ImageFormat;
  contentType: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
};

/** Full server-side check for an uploaded image: MIME, extension, size, the
 * real file signature (so a renamed file can't slip through) and pixel
 * dimensions. */
export async function inspectImageUpload(file: File): Promise<InspectedImage> {
  validateImageFile(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const format = mimeTypeToImageFormat(file.type);
  const dimensions =
    format === "PNG"
      ? readPngDimensions(buffer)
      : format === "WEBP"
        ? readWebpDimensions(buffer)
        : readJpegDimensions(buffer);

  if (!dimensions) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      "This file doesn't look like a valid image. Please try another photo.",
      422
    );
  }

  validateImageDimensions(dimensions);

  return {
    buffer,
    format,
    contentType: file.type as InspectedImage["contentType"],
    ...dimensions,
  };
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
