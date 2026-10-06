"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageDropzone } from "@/components/dashboard/image-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { postFormData } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { createClientSchema, type CreateClientInput } from "@/lib/validations/client";

const addClientFormSchema = createClientSchema.refine((values) => values.consentGiven, {
  path: ["consentGiven"],
  message: "Consent is required before uploading a client photo.",
});

export function AddClientDialog({ triggerClassName }: { triggerClassName?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues: { name: "", email: "", phone: "", notes: "", consentGiven: false },
  });

  function reset() {
    form.reset();
    setFile(null);
    setFileError(null);
  }

  async function onSubmit(values: CreateClientInput) {
    if (!file) {
      setFileError("Please add a full-body photo of your client.");
      return;
    }

    setIsSubmitting(true);
    const body = new FormData();
    body.set("name", values.name);
    body.set("email", values.email ?? "");
    body.set("phone", values.phone ?? "");
    body.set("notes", values.notes ?? "");
    body.set("consentGiven", String(values.consentGiven));
    body.set("photo", file);

    const result = await postFormData<{ id: string }>("/api/clients", body);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success(`${values.name} has joined your portfolio.`);
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          "gap-2 rounded-full gradient-purple-magenta px-5 text-primary-foreground shadow-editorial transition-transform hover:-translate-y-0.5",
          triggerClassName
        )}
      >
        <UserPlus className="size-4" />
        Add client
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (isSubmitting) return;
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="max-h-[92svh] overflow-y-auto rounded-3xl p-6 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Welcome a new muse</DialogTitle>
            <DialogDescription>
              A front-facing, full-body photo in good light works best for try-on.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-[1fr_1.1fr]">
              <ImageDropzone
                file={file}
                onFileChange={(next) => {
                  setFile(next);
                  setFileError(null);
                }}
                label="Add the client photo"
                aspect="aspect-[3/4]"
                error={fileError}
              />

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Amara Okafor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Sizing, style preferences…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consentGiven"
                  render={({ field }) => (
                    <FormItem>
                      <label
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-2xl border p-3 text-sm transition-colors",
                          field.value
                            ? "border-[color:var(--qc-magenta)]/50 bg-[color:var(--qc-lavender)]/40"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="mt-0.5 size-4 accent-[color:var(--qc-magenta)]"
                        />
                        <span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="size-3.5 text-[color:var(--qc-magenta)]" />
                            Client consent confirmed
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            They agree to their photo being used for virtual try-on in this studio. Photos are
                            never used to train AI models.
                          </span>
                        </span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-auto h-11 gap-2 rounded-full gradient-purple-magenta text-primary-foreground"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                  {isSubmitting ? "Uploading…" : "Add to portfolio"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
