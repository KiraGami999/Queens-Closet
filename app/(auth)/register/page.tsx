import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="font-heading text-3xl">
          Open your <span className="text-gradient-purple-magenta italic">studio.</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Start generating virtual try-on looks in minutes.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[color:var(--qc-magenta)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
