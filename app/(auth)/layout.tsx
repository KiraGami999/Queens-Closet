import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Queens Closet
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Virtual fashion studio
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
