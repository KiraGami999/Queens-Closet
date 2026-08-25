import { Users } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage client profiles and photos used for try-on generations.
        </p>
      </div>
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Add a client and their photo to start generating personalized looks."
        actionLabel="Add client"
      />
    </div>
  );
}
