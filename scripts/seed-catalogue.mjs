/**
 * One-off: upload client catalogue photos to Vercel Blob and seed garments
 * for the demo admin account.
 *
 * Run: node --env-file=.env.local scripts/seed-catalogue.mjs
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAIL = "admin@queenscloset.com";

/** @type {Array<{ file: string; name: string; category: string; description: string }>} */
const catalogue = [
  {
    file: "regent-belted-jacket.jpg",
    name: "Regent Belted Jacket",
    category: "OUTERWEAR",
    description: "Cropped black leather trench with oversized lapels and buckled waist",
  },
  {
    file: "solene-denim-culottes.jpg",
    name: "Solene Denim Culottes",
    category: "BOTTOM",
    description: "Wide-leg charcoal denim shorts with a washed vintage finish",
  },
  {
    file: "sculptural-ruffle-boots.jpg",
    name: "Sculptural Ruffle Boots",
    category: "FOOTWEAR",
    description: "Avant-garde black leather stilettos with draped folds and silver snaps",
  },
  {
    file: "leather-baker-boy-cap.jpg",
    name: "Leather Baker Boy Cap",
    category: "ACCESSORY",
    description: "Structured black leather newsboy cap with a soft slouch crown",
  },
  {
    file: "bamboo-silver-hoops.jpg",
    name: "Bamboo Silver Hoops",
    category: "ACCESSORY",
    description: "Oversized segmented silver hoop earrings with an architectural finish",
  },
  {
    file: "layered-silver-chain.jpg",
    name: "Layered Silver Chain",
    category: "ACCESSORY",
    description: "Four-tier statement necklace with mixed link sizes and extender",
  },
  {
    file: "noir-edit-lookbook.jpg",
    name: "Noir Edit Lookbook",
    category: "FULL_BODY",
    description: "Editorial flat-lay of the full Noir Edit capsule",
  },
];

function jpegSize(buf) {
  // Minimal JPEG SOF0/SOF2 parser for width/height
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    const len = (buf[i + 2] << 8) + buf[i + 3];
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      const height = (buf[i + 5] << 8) + buf[i + 6];
      const width = (buf[i + 7] << 8) + buf[i + 8];
      return { width, height };
    }
    i += 2 + len;
  }
  return { width: 800, height: 1000 };
}

function cuidLike() {
  return `c${randomBytes(12).toString("hex")}`;
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
const databaseUrl = process.env.DATABASE_URL;

if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN is missing");
  process.exit(1);
}
if (!databaseUrl) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const sql = neon(databaseUrl);
const dir = join(process.cwd(), "public", "catalogue");

const admins = await sql`
  SELECT id FROM users WHERE email = ${ADMIN_EMAIL} LIMIT 1
`;
if (admins.length === 0) {
  console.error("Admin user not found. Create admin@queenscloset.com first.");
  process.exit(1);
}
const userId = admins[0].id;

for (const item of catalogue) {
  const existing = await sql`
    SELECT id FROM garments
    WHERE "userId" = ${userId} AND name = ${item.name} AND "archivedAt" IS NULL
    LIMIT 1
  `;
  if (existing.length > 0) {
    console.log(`skip existing: ${item.name}`);
    continue;
  }

  const filePath = join(dir, item.file);
  const data = readFileSync(filePath);
  const { width, height } = jpegSize(data);

  const blob = await put(`catalogue/${item.file}`, data, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/jpeg",
    token,
  });

  const garmentId = cuidLike();
  const imageId = cuidLike();

  await sql`
    INSERT INTO garments (id, "userId", name, category, description, "createdAt", "updatedAt")
    VALUES (
      ${garmentId},
      ${userId},
      ${item.name},
      ${item.category}::"GarmentCategory",
      ${item.description},
      NOW(),
      NOW()
    )
  `;

  await sql`
    INSERT INTO garment_images (id, "garmentId", url, "storageKey", width, height, format, "createdAt")
    VALUES (
      ${imageId},
      ${garmentId},
      ${blob.url},
      ${blob.url},
      ${width},
      ${height},
      'JPEG'::"ImageFormat",
      NOW()
    )
  `;

  console.log(`seeded: ${item.name} -> ${blob.url}`);
}

console.log("done");
