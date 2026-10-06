"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
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
import { Textarea } from "@/components/ui/textarea";
import { postFormData } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  createGarmentSchema,
  garmentCategoryLabels,
  garmentCategorySchema,
  type CreateGarmentInput,
} from "@/lib/validations/garment";

export function AddGarmentDialog({ triggerClassName }: { triggerClassName?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGarmentInput>({
    resolver: zodResolver(createGarmentSchema),
    defaultValues: { name: "", category: "TOP", description: "" },
  });

  function reset() {
    form.reset();
    setFile(null);
    setFileError(null);
  }

  async function onSubmit(values: CreateGarmentInput) {
    if (!file) {
      setFileError("Please add a garment image.");
      return;
    }

    setIsSubmitting(true);
    const body = new FormData();
    body.set("name", values.name);
    body.set("category", values.category);
    body.set("description", values.description ?? "");
    body.set("image", file);

    const result = await postFormData<{ id: string }>("/api/garments", body);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success(`${values.name} is now in your closet.`);
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
        <Plus className="size-4" />
        Add garment
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
            <DialogTitle className="font-heading text-2xl">Add a piece to the closet</DialogTitle>
            <DialogDescription>
              A clean product shot on a plain background gives the AI the best results.
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
                label="Add the garment image"
                error={fileError}
              />

              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Regent Belted Jacket" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <div role="radiogroup" className="flex flex-wrap gap-2">
                        {garmentCategorySchema.options.map((category) => {
                          const selected = field.value === category;
                          return (
                            <button
                              key={category}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => field.onChange(category)}
                              className={cn(
                                "relative rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                selected
                                  ? "border-transparent text-primary-foreground"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {selected && (
                                <motion.span
                                  layoutId="garment-category-chip"
                                  className="absolute inset-0 rounded-full gradient-purple-magenta"
                                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                />
                              )}
                              <span className="relative">{garmentCategoryLabels[category]}</span>
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Fabric, fit, colour — helps the AI drape it correctly."
                          className="min-h-24"
                          maxLength={2000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-auto h-11 gap-2 rounded-full gradient-purple-magenta text-primary-foreground"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  {isSubmitting ? "Uploading…" : "Add to closet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
