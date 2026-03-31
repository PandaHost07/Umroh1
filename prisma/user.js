const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      nama: "Admin Keuangan",
      email: "adminkeuangan@gmail.com",
      password: "password123",
      jenisKelamin: "PEREMPUAN",
      role: "ADMIN_KEUANGAN",
      telepon: "081234567890",
      gambar: "https://www.adatourtravel.com/man.jpg",
    },
    {
      nama: "Admin Operasional",
      email: "adminoperasional@gmail.com",
      password: "password123",
      jenisKelamin: "LAKI_LAKI",
      role: "ADMIN_OPERASIONAL",
      telepon: "089876543210",
      gambar: "https://www.adatourtravel.com/man.jpg",
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.akun.create({
      data: {
        email: userData.email,
        nama: userData.nama,
        password: hashedPassword,
        jenisKelamin: userData.jenisKelamin,
        role: userData.role,
        telepon: userData.telepon,
        gambar: userData.gambar,
      },
    });
  }

  console.log("Seed selesai: 2 akun berhasil dibuat");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });