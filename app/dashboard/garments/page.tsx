import { Shirt } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function GarmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Garments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your clothing catalogue, ready to try on.
        </p>
      </div>
      <EmptyState
        icon={Shirt}
        title="No garments yet"
        description="Upload your first clothing design to start building your catalogue."
        actionLabel="Add garment"
      />
    </div>
  );
}
