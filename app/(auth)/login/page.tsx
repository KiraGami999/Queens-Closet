import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
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
