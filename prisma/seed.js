const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Admin Operasional
  await prisma.akun.upsert({
    where: { email: "operasional@adatour.com" },
    update: {},
    create: {
      email: "operasional@adatour.com",
      nama: "Admin Operasional",
      password: hashedPassword,
      jenisKelamin: "LAKI_LAKI",
      role: "ADMIN_OPERASIONAL",
    },
  });

  // Admin Keuangan
  await prisma.akun.upsert({
    where: { email: "keuangan@adatour.com" },
    update: {},
    create: {
      email: "keuangan@adatour.com",
      nama: "Admin Keuangan",
      password: hashedPassword,
      jenisKelamin: "LAKI_LAKI",
      role: "ADMIN_KEUANGAN",
    },
  });

  console.log("✅ Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
