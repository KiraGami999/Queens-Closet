"use client";

import { Loader2, MoreHorizontal, PauseCircle, PlayCircle, ShieldCheck, ShieldOff } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  setUserRoleAction,
  setUserSuspendedAction,
  type AdminActionResult,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
  successMessage: string;
  run: () => Promise<AdminActionResult>;
};

export function UserActions({
  user,
  isSelf,
}: {
  user: { id: string; name: string; email: string; role: "USER" | "ADMIN"; isSuspended: boolean };
  isSelf: boolean;
}) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isRunning, startTransition] = useTransition();

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">You</span>;
  }

  function confirm() {
    if (!pending) return;
    startTransition(async () => {
      const result = await pending.run();
      if (result.success) {
        toast.success(pending.successMessage);
        setPending(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Manage ${user.name}`} className="rounded-full" />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {user.role === "ADMIN" ? (
            <DropdownMenuItem
              onClick={() =>
                setPending({
                  title: "Remove admin access?",
                  description: `${user.email} will lose access to the admin console. Their studio is unaffected.`,
                  confirmLabel: "Remove admin",
                  destructive: true,
                  successMessage: `${user.name} is no longer an admin.`,
                  run: () => setUserRoleAction({ userId: user.id, role: "USER" }),
                })
              }
            >
              <ShieldOff />
              Remove admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                setPending({
                  title: "Grant admin access?",
                  description: `${user.email} will be able to manage every studio account and generation on the platform.`,
                  confirmLabel: "Make admin",
                  destructive: false,
                  successMessage: `${user.name} is now an admin.`,
                  run: () => setUserRoleAction({ userId: user.id, role: "ADMIN" }),
                })
              }
            >
              <ShieldCheck />
              Make admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {user.isSuspended ? (
            <DropdownMenuItem
              onClick={() =>
                setPending({
                  title: "Reactivate this studio?",
                  description: `${user.email} will be able to sign in again.`,
                  confirmLabel: "Reactivate",
                  destructive: false,
                  successMessage: `${user.name} has been reactivated.`,
                  run: () => setUserSuspendedAction({ userId: user.id, suspended: false }),
                })
              }
            >
              <PlayCircle />
              Reactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                setPending({
                  title: "Suspend this studio?",
                  description: `${user.email} will be signed out and blocked from signing in. No data is deleted — you can reactivate them at any time.`,
                  confirmLabel: "Suspend",
                  destructive: true,
                  successMessage: `${user.name} has been suspended.`,
                  run: () => setUserSuspendedAction({ userId: user.id, suspended: true }),
                })
              }
            >
              <PauseCircle />
              Suspend
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && !isRunning && setPending(null)}>
        <DialogContent className="rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{pending?.title}</DialogTitle>
            <DialogDescription>{pending?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl p-4">
            <Button variant="outline" disabled={isRunning} onClick={() => setPending(null)} className="rounded-full">
              Cancel
            </Button>
            <Button
              variant={pending?.destructive ? "destructive" : "default"}
              disabled={isRunning}
              onClick={confirm}
              className="gap-2 rounded-full"
            >
              {isRunning && <Loader2 className="size-4 animate-spin" />}
              {pending?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
