import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl space-y-6">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Virtual Fashion Studio
        </p>
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
          Queens Closet
        </h1>
        <p className="mx-auto max-w-md text-balance text-muted-foreground">
          Upload garments and client photos, then generate polished
          AI-powered virtual try-on previews in moments.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="lg" render={<Link href="/register" />}>
            Get started
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            Sign in
          </Button>
        </div>
      </div>
    </main>
  );
}
