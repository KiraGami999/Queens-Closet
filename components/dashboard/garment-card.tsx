import { Shirt, Sparkles } from "lucide-react";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  TOP: "Top",
  BOTTOM: "Bottom",
  DRESS: "Dress",
  OUTERWEAR: "Outerwear",
  FOOTWEAR: "Footwear",
  ACCESSORY: "Accessory",
  FULL_BODY: "Full Body",
};

type GarmentCardData = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  images: Array<{ url: string; width: number; height: number }>;
};

export function GarmentCard({ garment }: { garment: GarmentCardData }) {
  const image = garment.images[0];
  const aspect = image ? `${image.width} / ${image.height}` : "3 / 4";

  return (
    <div className="group relative mb-6 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial break-inside-avoid">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={garment.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="bg-grain flex h-full w-full items-center justify-center gradient-lavender-purple">
            <Shirt className="size-8 text-white/70" />
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href="/dashboard/generate"
            className="inline-flex w-fit items-center gap-1.5 rounded-full gradient-purple-magenta px-3.5 py-1.5 text-xs font-medium text-white shadow-editorial transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="size-3.5" />
            Try This Look
          </Link>
        </div>
      </div>

      <div className="p-4">
        <p className="font-heading text-base leading-tight">{garment.name}</p>
        <p className="mt-1 text-[11px] tracking-wide text-muted-foreground uppercase">
          {categoryLabels[garment.category] ?? garment.category}
          {garment.description ? ` · ${garment.description}` : ""}
        </p>
      </div>
    </div>
  );
}
