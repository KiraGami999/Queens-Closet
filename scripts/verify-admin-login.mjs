/**
 * Verify / reset admin credentials against the Neon DB.
 * Run: node --env-file=.env.local scripts/verify-admin-login.mjs
 * Reset: node --env-file=.env.local scripts/verify-admin-login.mjs --reset
 */
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAIL = "admin@queenscloset.com";
const ADMIN_PASSWORD = "superadmin123";
const shouldReset = process.argv.includes("--reset");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const sql = neon(databaseUrl);

const users = await sql`
  SELECT id, email, "passwordHash", name, "updatedAt"
  FROM users
  WHERE lower(email) = lower(${ADMIN_EMAIL})
  LIMIT 1
`;

if (users.length === 0) {
  console.log("ADMIN_MISSING — creating account");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const created = await sql`
    INSERT INTO users (id, name, email, "passwordHash", "createdAt", "updatedAt")
    VALUES (
      ${`c${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`},
      ${"Queens Closet Admin"},
      ${ADMIN_EMAIL},
      ${passwordHash},
      NOW(),
      NOW()
    )
    RETURNING id, email
  `;
  console.log("CREATED", created[0]);
  process.exit(0);
}

const user = users[0];
const matches = await bcrypt.compare(ADMIN_PASSWORD, user.passwordHash);
console.log({
  email: user.email,
  name: user.name,
  updatedAt: user.updatedAt,
  passwordMatches: matches,
});

if (!matches || shouldReset) {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await sql`
    UPDATE users
    SET "passwordHash" = ${passwordHash}, "updatedAt" = NOW()
    WHERE id = ${user.id}
  `;
  const recheck = await bcrypt.compare(
    ADMIN_PASSWORD,
    (
      await sql`SELECT "passwordHash" FROM users WHERE id = ${user.id}`
    )[0].passwordHash
  );
  console.log("RESET_DONE", { passwordMatches: recheck });
}
