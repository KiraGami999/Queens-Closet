import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no providers/bcrypt/Prisma here) so it can be
 * imported by middleware, which runs on the Edge runtime. The full config
 * with the Credentials provider lives in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
