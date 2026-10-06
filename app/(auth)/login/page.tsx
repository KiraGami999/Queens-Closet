import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { suspended } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="font-heading text-3xl">
          Welcome back, <span className="text-gradient-purple-magenta italic">Queen.</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to keep creating unforgettable looks.
        </p>
      </div>
      {suspended === "1" && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          This account has been paused. Please contact the Queens Closet team to restore access.
        </p>
      )}
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[color:var(--qc-magenta)] underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
