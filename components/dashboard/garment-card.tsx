import { Shirt, Sparkles } from "lucide-react";
import Link from "next/link";

import { garmentCategoryLabels, type GarmentCategoryInput } from "@/lib/validations/garment";

export type GarmentCardData = {
  id: string;
  name: string;
  category: GarmentCategoryInput;
  description: string | null;
  images: Array<{ url: string; width: number; height: number }>;
};

export function GarmentCard({ garment }: { garment: GarmentCardData }) {
  const image = garment.images[0];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={garment.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="bg-grain flex h-full w-full items-center justify-center gradient-lavender-purple">
            <Shirt className="size-8 text-white/70" />
          </div>
        )}

        <span className="absolute top-3 left-3 rounded-full border border-white/30 bg-black/35 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-md">
          {garmentCategoryLabels[garment.category]}
        </span>

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <Link
            href="/dashboard/generate"
            className="inline-flex w-fit translate-y-2 items-center gap-1.5 rounded-full gradient-purple-magenta px-3.5 py-1.5 text-xs font-medium text-white shadow-editorial transition-transform duration-300 group-hover:translate-y-0"
          >
            <Sparkles className="size-3.5" />
            Try This Look
          </Link>
        </div>
      </div>

      <div className="p-4">
        <p className="font-heading text-base leading-tight">{garment.name}</p>
        {garment.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{garment.description}</p>
        )}
      </div>
    </div>
  );
}
