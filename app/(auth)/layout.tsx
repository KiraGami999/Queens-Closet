import Link from "next/link";

import { GradientBlob } from "@/components/decor/blobs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-grain relative hidden flex-col justify-between overflow-hidden gradient-purple-magenta p-12 text-white lg:flex">
        <GradientBlob variant="gold" className="top-[-6rem] right-[-6rem] size-80 opacity-30" />
        <GradientBlob variant="violet" className="bottom-[-8rem] left-[-6rem] size-96 opacity-30" />

        <Link href="/" className="relative flex flex-col leading-none">
          <span className="font-heading text-lg tracking-[0.18em]">QUEENS</span>
          <span className="font-heading text-lg tracking-[0.18em] italic text-white/80">
            CLOSET
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="font-heading text-4xl leading-tight italic">
            &ldquo;Where fashion meets imagination.&rdquo;
          </p>
          <p className="mt-4 text-sm text-white/70">
            Upload a design, choose your muse, and let the AI atelier bring
            the look to life.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="flex flex-col items-center leading-none">
              <span className="font-heading text-lg tracking-[0.18em]">QUEENS</span>
              <span className="font-heading text-lg tracking-[0.18em] text-gradient-purple-magenta">
                CLOSET
              </span>
            </Link>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-editorial">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
