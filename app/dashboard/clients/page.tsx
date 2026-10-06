import { Users } from "lucide-react";

import { auth } from "@/auth";
import { AddClientDialog } from "@/components/dashboard/add-client-dialog";
import { ClientCard } from "@/components/dashboard/client-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { listClients } from "@/lib/services/client-service";

export default async function ClientsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { items, total } = await listClients({ userId, pageSize: 50 });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
            The Portfolio
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
            Your muses, ready for the runway
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${total} client${total === 1 ? "" : "s"} in your portfolio.`
              : "Manage client profiles and photos used for try-on generations."}
          </p>
        </div>
        <AddClientDialog />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Your portfolio is empty."
          description="Add a client and their photo to start generating personalised looks."
          action={<AddClientDialog />}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((client, index) => (
            <Reveal key={client.id} delay={Math.min(index, 8) * 0.05}>
              <TiltCard className="rounded-3xl">
                <ClientCard client={client} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
