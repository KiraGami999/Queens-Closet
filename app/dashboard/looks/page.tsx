import { Images } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function LooksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Looks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, download, and manage your generated fashion looks.
        </p>
      </div>
      <EmptyState
        icon={Images}
        title="No looks generated yet"
        description="Once you generate a virtual try-on, it will appear here."
      />
    </div>
  );
}
