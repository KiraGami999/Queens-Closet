"use client";

import { ImagePlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type DragEvent } from "react";

import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;
/** Serverless request bodies are capped (~4.5 MB on Vercel), so larger
 * images are downscaled in the browser before upload. */
const UPLOAD_TARGET_BYTES = 4 * 1024 * 1024;
const MAX_EDGE_PX = 2400;

async function prepareForUpload(file: File): Promise<File> {
  if (file.size <= UPLOAD_TARGET_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.88)
  );
  if (!blob) return file;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

export function ImageDropzone({
  file,
  onFileChange,
  label,
  hint = "JPG, PNG or WEBP · up to 10 MB",
  aspect = "aspect-[4/5]",
  error,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label: string;
  hint?: string;
  aspect?: string;
  error?: string | null;
}) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  if ((preview?.file ?? null) !== file) {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(file ? { file, url: URL.createObjectURL(file) } : null);
  }
  const previewUrl = preview?.file === file ? preview.url : null;

  async function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setLocalError("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setLocalError("That image is over 10 MB. Please choose a smaller file.");
      return;
    }
    setLocalError(null);
    onFileChange(await prepareForUpload(candidate));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void accept(event.dataTransfer.files[0]);
  }

  const message = localError ?? error;

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition-colors",
          aspect,
          isDragging
            ? "border-[color:var(--qc-magenta)] bg-[color:var(--qc-lavender)]/50"
            : "border-border bg-muted/40 hover:border-[color:var(--qc-magenta)]/50 hover:bg-[color:var(--qc-lavender)]/25",
          message && "border-destructive/60"
        )}
      >
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Selected image preview" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-xs text-white">
                {file?.name}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 px-6"
            >
              <motion.span
                animate={isDragging ? { scale: 1.12, rotate: -6 } : { scale: 1, rotate: 0 }}
                className="flex size-12 items-center justify-center rounded-full gradient-purple-magenta text-white shadow-editorial"
              >
                <ImagePlus className="size-5" />
              </motion.span>
              <span className="text-sm font-medium">{isDragging ? "Drop it here" : label}</span>
              <span className="text-xs text-muted-foreground">Drag & drop or click to browse</span>
              <span className="text-[11px] text-muted-foreground/70">{hint}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            void accept(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>

      <div className="mt-2 flex min-h-5 items-center justify-between gap-2">
        {message ? (
          <p role="alert" className="text-xs text-destructive">
            {message}
          </p>
        ) : (
          <span />
        )}
        {file && (
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
