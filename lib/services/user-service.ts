import bcrypt from "bcryptjs";

import { AppError, ApiErrorCode } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const SALT_ROUNDS = 12;

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  image: string | null;
}): SafeUser {
  return { id: user.id, name: user.name, email: user.email, image: user.image };
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
}): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
  });

  if (existing) {
    throw new AppError(
      ApiErrorCode.CONFLICT,
      "An account with this email already exists.",
      409
    );
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      passwordHash,
    },
  });

  return toSafeUser(user);
}

/** Verifies credentials for Auth.js's Credentials provider. Returns null on
 * any failure — never reveals whether the email or the password was wrong. */
export async function verifyCredentials(params: {
  email: string;
  password: string;
}): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: params.email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(params.password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return toSafeUser(user);
}
