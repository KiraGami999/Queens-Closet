"use client";

import { Loader2, XCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { cancelGenerationAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function CancelGenerationButton({ sessionId }: { sessionId: string }) {
  const [isRunning, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isRunning}
      onClick={() =>
        startTransition(async () => {
          const result = await cancelGenerationAction({ sessionId });
          if (result.success) toast.success("Generation cancelled.");
          else toast.error(result.message);
        })
      }
      className="gap-1 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
      Cancel
    </Button>
  );
}
