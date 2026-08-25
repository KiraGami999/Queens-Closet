import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function GeneratePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Generate a look</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a client and a garment to create a virtual try-on preview.
        </p>
      </div>
      <EmptyState
        icon={Sparkles}
        title="Add a client and a garment first"
        description="You'll need at least one client photo and one garment before you can generate a look."
      />
    </div>
  );
}
