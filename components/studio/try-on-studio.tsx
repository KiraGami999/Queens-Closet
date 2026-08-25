"use client";

import { Download, RefreshCcw, Save, Shirt, Sparkles, User, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { CompareSlider } from "@/components/studio/compare-slider";
import { GeneratingOverlay } from "@/components/studio/generating-overlay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ClientOption = {
  id: string;
  name: string;
  photos: Array<{ id: string; url: string }>;
};

type GarmentOption = {
  id: string;
  name: string;
  category: string;
  images: Array<{ id: string; url: string }>;
};

type Phase = "idle" | "submitting" | "processing" | "completed" | "failed";

const categoryLabels: Record<string, string> = {
  TOP: "Top",
  BOTTOM: "Bottom",
  DRESS: "Dress",
  OUTERWEAR: "Outerwear",
  FOOTWEAR: "Footwear",
  ACCESSORY: "Accessory",
  FULL_BODY: "Full Body",
};

export function TryOnStudio({
  clients,
  garments,
  providerName,
}: {
  clients: ClientOption[];
  garments: GarmentOption[];
  providerName: string;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [photoId, setPhotoId] = useState(clients[0]?.photos[0]?.id ?? "");
  const [garmentId, setGarmentId] = useState("");
  const [imageId, setImageId] = useState("");
  const [description, setDescription] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const client = clients.find((c) => c.id === clientId);
  const photo = client?.photos.find((p) => p.id === photoId) ?? client?.photos[0];
  const garment = garments.find((g) => g.id === garmentId);
  const image = garment?.images.find((i) => i.id === imageId) ?? garment?.images[0];

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function selectClient(id: string) {
    setClientId(id);
    const next = clients.find((c) => c.id === id);
    setPhotoId(next?.photos[0]?.id ?? "");
  }

  function selectGarment(id: string) {
    setGarmentId(id);
    const next = garments.find((g) => g.id === id);
    setImageId(next?.images[0]?.id ?? "");
    setPhase("idle");
    setResultUrl(null);
    setErrorMessage(null);
  }

  function pollStatus(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/tryon/${id}`);
        const body = await res.json();
        if (!body.success) return;

        if (body.data.status === "COMPLETED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setResultUrl(body.data.resultUrl);
          setPhase("completed");
        } else if (body.data.status === "FAILED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMessage(body.data.errorMessage ?? "We couldn't generate this look.");
          setPhase("failed");
        }
      } catch {
        // transient network hiccup — next poll tick will retry
      }
    }, 1500);
  }

  async function handleGenerate() {
    if (!photo || !image || !garment) return;

    setPhase("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientPhotoId: photo.id,
          garmentId: garment.id,
          garmentImageId: image.id,
          description,
        }),
      });
      const body = await res.json();

      if (!body.success) {
        setErrorMessage(body.error?.message ?? "We couldn't generate this look.");
        setPhase("failed");
        return;
      }

      if (body.data.status === "COMPLETED" && body.data.resultUrl) {
        setResultUrl(body.data.resultUrl);
        setPhase("completed");
      } else {
        setPhase("processing");
        pollStatus(body.data.id);
      }
    } catch {
      setErrorMessage("We couldn't reach the studio. Please try again.");
      setPhase("failed");
    }
  }

  function handleTryAnotherOutfit() {
    setGarmentId("");
    setImageId("");
    setPhase("idle");
    setResultUrl(null);
    setErrorMessage(null);
  }

  const isGenerating = phase === "submitting" || phase === "processing";
  const canGenerate = Boolean(photo && garment && image) && !isGenerating;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_300px]">
      {/* LEFT — muse selection */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-white/60 uppercase">
          <User className="size-3.5" />
          Choose your muse
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {clients.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectClient(c.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-2xl border p-2 text-left transition-colors lg:w-full",
                c.id === clientId
                  ? "border-[color:var(--qc-magenta)] bg-white/10"
                  : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-white/10">
                {c.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photos[0].url} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <User className="size-4 text-white/50" />
                  </span>
                )}
              </span>
              <span className="min-w-0 text-sm text-white/90">
                <span className="block truncate">{c.name}</span>
                <span className="block text-[11px] text-white/45">
                  {c.photos.length} photo{c.photos.length === 1 ? "" : "s"}
                </span>
              </span>
            </button>
          ))}
        </div>

        {client && client.photos.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-3">
            {client.photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPhotoId(p.id)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg border",
                  p.id === photoId ? "border-[color:var(--qc-magenta)]" : "border-white/10"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CENTER — canvas */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-2xl">
          {phase === "completed" && resultUrl && photo ? (
            <CompareSlider beforeSrc={photo.url} afterSrc={resultUrl} className="h-full" />
          ) : photo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={client?.name ?? "Selected muse"} className="h-full w-full object-cover" />
              {image && !isGenerating && phase !== "failed" && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                  <Shirt className="size-3.5" />
                  {garment?.name}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/40">
              <User className="size-10" />
            </div>
          )}

          {isGenerating && <GeneratingOverlay />}

          {phase === "failed" && errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center">
              <p className="text-sm text-white/90">{errorMessage}</p>
              <Button
                size="sm"
                onClick={handleGenerate}
                className="rounded-full gradient-purple-magenta text-primary-foreground"
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        {phase === "completed" ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => toast.success("Saved to your creations.")}
              className="gap-2 rounded-full gradient-purple-magenta px-5 text-primary-foreground"
            >
              <Save className="size-4" />
              Save Look
            </Button>
            <Button
              variant="outline"
              render={
                resultUrl ? (
                  <a href={resultUrl} download target="_blank" rel="noreferrer" />
                ) : undefined
              }
              className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
            >
              <Download className="size-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={handleTryAnotherOutfit}
              className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
            >
              <Shirt className="size-4" />
              Try Another Outfit
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerate}
              className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
            >
              <RefreshCcw className="size-4" />
              Generate Again
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="mt-6 h-12 gap-2 rounded-full gradient-purple-magenta px-8 text-base text-primary-foreground shadow-editorial transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Wand2 className="size-4" />
            {isGenerating ? "Creating your look…" : "Generate Look"}
          </Button>
        )}

        <p className="mt-3 text-[11px] tracking-wide text-white/40 uppercase">
          AI Studio &middot; {providerName}
        </p>
      </div>

      {/* RIGHT — garment + controls */}
      <div className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-white/60 uppercase">
            <Shirt className="size-3.5" />
            Choose the garment
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {garments.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => selectGarment(g.id)}
                className={cn(
                  "group overflow-hidden rounded-xl border text-left transition-colors",
                  g.id === garmentId ? "border-[color:var(--qc-magenta)]" : "border-white/10 hover:border-white/25"
                )}
                title={g.name}
              >
                <span className="relative flex aspect-square items-center justify-center bg-white/5">
                  {g.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.images[0].url} alt={g.name} className="h-full w-full object-cover" />
                  ) : (
                    <Shirt className="size-4 text-white/40" />
                  )}
                </span>
              </button>
            ))}
          </div>
          {garment && (
            <p className="mt-3 text-xs text-white/60">
              {garment.name} &middot; {categoryLabels[garment.category] ?? garment.category}
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-white/60 uppercase">
            <Sparkles className="size-3.5" />
            Styling notes
          </p>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional — e.g. tuck the blazer, add a belt…"
            className="min-h-20 border-white/10 bg-white/5 text-sm text-white placeholder:text-white/35"
            maxLength={500}
          />
        </div>
      </div>
    </div>
  );
}
