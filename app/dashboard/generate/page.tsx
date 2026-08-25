import { Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { getActiveTryOnProviderName } from "@/lib/ai";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GradientBlob } from "@/components/decor/blobs";
import { TryOnStudio } from "@/components/studio/try-on-studio";
import { listClients } from "@/lib/services/client-service";
import { listGarments } from "@/lib/services/garment-service";

export default async function GeneratePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [clients, garments] = await Promise.all([
    listClients({ userId, pageSize: 50 }),
    listGarments({ userId, pageSize: 50 }),
  ]);

  const clientsWithPhotos = clients.items.filter((c) => c.photos.length > 0);
  const garmentsWithImages = garments.items.filter((g) => g.images.length > 0);
  const isReady = clientsWithPhotos.length > 0 && garmentsWithImages.length > 0;

  return (
    <div className="-mx-6 -mt-8 -mb-28 md:-mx-10 md:-mt-10 lg:-mb-10">
      <div className="gradient-studio-dark bg-grain relative min-h-[calc(100svh-4rem)] overflow-hidden px-6 py-10 md:px-10">
        <GradientBlob variant="violet" className="top-[-6rem] left-[-6rem] size-80 opacity-40" />
        <GradientBlob variant="coral" className="bottom-[-6rem] right-[-6rem] size-80 opacity-25" />

        <div className="relative mx-auto mb-8 max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
            <Sparkles className="size-3.5" />
            Virtual Try-On Studio
          </p>
          <h1 className="mt-2 font-heading text-3xl text-white sm:text-4xl">
            Dress the imagination.
          </h1>
          <p className="mt-1 max-w-md text-sm text-white/60">
            Pick a muse and a garment, then let the AI atelier render the look.
          </p>
        </div>

        <div className="relative mx-auto max-w-7xl">
          {isReady ? (
            <TryOnStudio
              clients={clientsWithPhotos}
              garments={garmentsWithImages}
              providerName={getActiveTryOnProviderName()}
            />
          ) : (
            <div className="dark">
              <EmptyState
                icon={Sparkles}
                title="Add a client and a garment first"
                description="You'll need at least one client photo and one garment image before you can generate a look."
                note={
                  clientsWithPhotos.length === 0 && garmentsWithImages.length === 0
                    ? undefined
                    : clientsWithPhotos.length === 0
                      ? "Waiting on a client photo."
                      : "Waiting on a garment image."
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
