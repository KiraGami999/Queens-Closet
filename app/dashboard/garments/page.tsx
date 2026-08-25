import { Plus, Shirt } from "lucide-react";

import { auth } from "@/auth";
import { GarmentCard } from "@/components/dashboard/garment-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
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
        <Button disabled className="gap-2 rounded-full gradient-purple-magenta px-5 text-primary-foreground">
          <Plus className="size-4" />
          Add garment
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Your closet is waiting."
          description="Add your first piece and start creating unforgettable looks."
          actionLabel="Add garment"
          note="Garment uploads are coming soon."
        />
      ) : (
        <Reveal>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {items.map((garment) => (
              <GarmentCard key={garment.id} garment={garment} />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
