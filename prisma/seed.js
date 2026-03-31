const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Hashing password untuk Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Membuat akun admin
  const adminAccount = await prisma.akun.create({
    data: {
      email: "admin@gmail.com",
      nama: "Admin User",
      role: "admin",
      image: "https://adatourtravel.vercel.app/man.jpg",
      password: hashedPassword,
      isVerified: true,
    },
  });
  const adminKeuangan = await prisma.akun.create({
    data: {
      email: "adminKeuangan@gmail.com",
      nama: "Admin Keuangan",
      role: "admin-keuangan",
      image: "https://adatourtravel.vercel.app/man.jpg",
      password: hashedPassword,
      isVerified: true,
    },
  });
    const mitra = await prisma.akun.create({
    data: {
      email: "mitra@gmail.com",
      nama: "Mitra",
      role: "mitra",
      image: "https://adatourtravel.vercel.app/man.jpg",
      password: hashedPassword,
      isVerified: true,
    },
  });

  console.log("✅ Admin account created:", adminAccount, adminKeuangan, mitra);

  // Membuat data perusahaan
  const perusahaan = await prisma.perusahaan.create({
    data: {
      id: "PgnBQK4B9PO",
      perusahaan: "PT. AMINAH ZHAFER TRAVELINDO WISATA",
      namaTravel: "Ada Tour Travel",
      image: "https://storage.googleapis.com/testing-7aa93.appspot.com/Perusahaan/1745850017502-logo-perusahaan.png",
      izinPPIU: "",
      jam: "08.00 - 16.00 WIB",
      lokasi: "Jl. ZA. Pagar Alam No.46b, Labuhan Ratu, Kec. Kedaton, Kota Bandar Lampung, Lampung",
      nomorSK: "",
      tanggalSK: new Date("2025-04-28T14:14:13.235Z"),
      pemilik: "Andi Wahyudi",
      maps: "https://maps.app.goo.gl/wbocDg4mpHjrH2ui9",
      embededMaps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.7747806265825!2d105.30558957408584!3d-5.45112005435948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40d954102c6f09%3A0x58a52ab9decc2e25!2sAda%20Tour%20%26%20Travel%20Mitra%20Resmi!5e0!3m2!1sid!2sid!4v1745849831989!5m2!1sid!2sid",
      email: "adhatourtravel27@gmail.com",
      facebook: "",
      tiktok: "",
      ig: "ada.tourtravel",
      whatssapp: "0895330731972",
      telp: "0895330731972",
      rekening: "8905637289 a.n Andi Wahyudi",
      deskripsi: `<p>Perusahaan kami berdiri secara resmi pada Tahun 2012 dengan nama Erahajj Indonesia. Kami adalah perusahaan Travel professional telah 10 tahun lebih berkecimpung di dunia haji dan umrah</p>
                  <p>Kami adalah Perusahaan yang bergerak di bidang Jasa Umrah & Haji, Provider visa, Land Arrangement, Paket Umrah Plus, Paket Haji Furoda dan Paket Haji Khusus.</p>`,
      createdAt: new Date("2025-04-28T14:20:18.034Z"),
      updatedAt: new Date("2025-04-30T07:55:02.338Z"),
    },
  });

  console.log("✅ Perusahaan data created:", perusahaan);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
