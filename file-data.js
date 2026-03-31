/**
 * Membaca file-data.json dan upsert 2 akun (Admin Keuangan + Admin Operasional).
 * Pastikan .env berisi DATABASE_URL yang valid (PostgreSQL / Prisma Accelerate).
 *
 * Jalankan dari root proyek: node file-data.js
 */

const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");
const bcrypt = require("bcrypt");

function createPrisma() {
  const client = new PrismaClient();
  if (process.env.DATABASE_URL?.startsWith("prisma+")) {
    return client.$extends(withAccelerate());
  }
  return client;
}

const prisma = createPrisma();

async function main() {
  const jsonPath = path.join(__dirname, "file-data.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const { users } = JSON.parse(raw);

  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("file-data.json: array users kosong atau tidak valid.");
  }

  for (const u of users) {
    const hashed = await bcrypt.hash(u.passwordAwal, 10);
    await prisma.akun.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        nama: u.nama,
        password: hashed,
        jenisKelamin: u.jenisKelamin,
        role: u.role,
        telepon: u.telepon ?? null,
        gambar: null,
      },
      update: {
        nama: u.nama,
        password: hashed,
        jenisKelamin: u.jenisKelamin,
        role: u.role,
        telepon: u.telepon ?? null,
      },
    });
    console.log("✓", u.email, "|", u.role);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
