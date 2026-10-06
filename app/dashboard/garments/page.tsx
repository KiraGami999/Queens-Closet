import { Shirt } from "lucide-react";

import { auth } from "@/auth";
import { AddGarmentDialog } from "@/components/dashboard/add-garment-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GarmentGallery } from "@/components/dashboard/garment-gallery";
import { listGarments } from "@/lib/services/garment-service";

export default async function GarmentsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { items, total } = await listGarments({ userId, pageSize: 50 });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
            The Closet
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
            A digital wardrobe with an editor&rsquo;s eye
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${total} piece${total === 1 ? "" : "s"} in your catalogue.`
              : "Your clothing catalogue, ready to try on."}
          </p>
        </div>
        <AddGarmentDialog />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Your closet is waiting."
          description="Add your first piece and start creating unforgettable looks."
          action={<AddGarmentDialog />}
        />
      ) : (
        <GarmentGallery
          garments={items.map((garment) => ({
            id: garment.id,
            name: garment.name,
            category: garment.category,
            description: garment.description,
            images: garment.images.map((image) => ({
              url: image.url,
              width: image.width,
              height: image.height,
            })),
          }))}
        />
      )}
    </div>
  );
}
