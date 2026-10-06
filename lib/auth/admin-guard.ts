import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/services/admin-service";

/** Server Component guard for /admin routes. Runs in the layout *and* every
 * page, because pages can be requested without their layout re-rendering. */
export async function getAdminOrRedirect() {
  const session = await auth();
  try {
    return await requireAdmin(session?.user?.id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(error.status === 401 ? "/login" : "/dashboard");
    }
    throw error;
  }
}
