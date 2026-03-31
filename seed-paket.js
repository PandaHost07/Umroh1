/**
 * Seed data paket umrah sample
 * Jalankan: node seed-paket.js
 */

const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

function createPrisma() {
  const client = new PrismaClient();
  if (process.env.DATABASE_URL?.startsWith("prisma+")) {
    return client.$extends(withAccelerate());
  }
  return client;
}

const prisma = createPrisma();

async function main() {
  console.log("Creating sample data...");

  // Create Hotel
  const hotel1 = await prisma.hotel.upsert({
    where: { id: "hotel-mekkah-1" },
    create: {
      id: "hotel-mekkah-1",
      nama: "Movenpick Hotel Makkah",
      bintang: 5,
      lokasi: "MEKKAH",
      alamat: "Abdul Aziz End Street, Makkah",
      deskripsi: "Hotel bintang 5 dekat Masjidil Haram"
    },
    update: {}
  });

  const hotel2 = await prisma.hotel.upsert({
    where: { id: "hotel-madinah-1" },
    create: {
      id: "hotel-madinah-1", 
      nama: "Anwar Al Madinah",
      bintang: 4,
      lokasi: "MADINAH",
      alamat: "King Abdul Aziz Street, Madinah",
      deskripsi: "Hotel bintang 4 dekat Masjid Nabawi"
    },
    update: {}
  });

  // Create Penerbangan
  const penerbangan = await prisma.penerbangan.upsert({
    where: { id: "penerbangan-1" },
    create: {
      id: "penerbangan-1",
      maskapai: "Garuda Indonesia",
      bandaraBerangkat: "Raden Intan Lampung",
      bandaraTiba: "King Abdulaziz International Airport",
      waktuBerangkat: new Date("2024-06-15T08:00:00Z"),
      waktuTiba: new Date("2024-06-15T14:00:00Z")
    },
    update: {}
  });

  // Create Paket Umrah
  const paket1 = await prisma.paket.upsert({
    where: { id: "paket-regular-1" },
    create: {
      id: "paket-regular-1",
      nama: "Paket Umrah Regular 12 Hari",
      deskripsi: "Paket umrah ekonomis dengan durasi 12 hari, hotel bintang 4-5, penerbangan langsung dari Lampung. Fasilitas lengkap dengan tour guide berpengalaman.",
      tanggalBerangkat: new Date("2024-07-15T00:00:00Z"),
      tanggalPulang: new Date("2024-07-26T00:00:00Z"),
      harga: 25000000,
      kuota: 45,
      gambar: "/image/1.jpeg",
      hotelId: hotel1.id,
      penerbanganId: penerbangan.id,
      status: "AKTIF"
    },
    update: {}
  });

  const paket2 = await prisma.paket.upsert({
    where: { id: "paket-vip-1" },
    create: {
      id: "paket-vip-1",
      nama: "Paket Umrah VIP 10 Hari",
      deskripsi: "Paket umrah premium dengan durasi 10 hari, hotel bintang 5 dekat Masjidil Haram, penerbangan kelas bisnis, dan fasilitas VIP.",
      tanggalBerangkat: new Date("2024-08-01T00:00:00Z"),
      tanggalPulang: new Date("2024-08-10T00:00:00Z"),
      harga: 45000000,
      kuota: 20,
      gambar: "/image/2.jpeg",
      hotelId: hotel2.id,
      penerbanganId: penerbangan.id,
      status: "AKTIF"
    },
    update: {}
  });

  const paket3 = await prisma.paket.upsert({
    where: { id: "paket-family-1" },
    create: {
      id: "paket-family-1",
      nama: "Paket Umrah Family 15 Hari",
      deskripsi: "Paket umrah khusus keluarga dengan durasi 15 hari, hotel bintang 4, program edukasi anak, dan fasilitas ramah keluarga.",
      tanggalBerangkat: new Date("2024-09-10T00:00:00Z"),
      tanggalPulang: new Date("2024-09-24T00:00:00Z"),
      harga: 35000000,
      kuota: 30,
      gambar: "/image/3.jpeg",
      hotelId: hotel1.id,
      penerbanganId: penerbangan.id,
      status: "AKTIF"
    },
    update: {}
  });

  const paket4 = await prisma.paket.upsert({
    where: { id: "paket-promo-1" },
    create: {
      id: "paket-promo-1",
      nama: "Paket Umrah Promo 9 Hari",
      deskripsi: "Paket umrah super hemat 9 hari, hotel bintang 3, fasilitas standar lengkap dan maskapai penerbangan transit.",
      tanggalBerangkat: new Date("2024-10-05T00:00:00Z"),
      tanggalPulang: new Date("2024-10-14T00:00:00Z"),
      harga: 22000000,
      kuota: 50,
      gambar: "/image/4.jpeg",
      hotelId: hotel2.id,
      penerbanganId: penerbangan.id,
      status: "AKTIF"
    },
    update: {}
  });

  const paket5 = await prisma.paket.upsert({
    where: { id: "paket-plus-turki" },
    create: {
      id: "paket-plus-turki",
      nama: "Paket Umrah Plus Turki 14 Hari",
      deskripsi: "Beribadah umrah sekaligus wisata religi ke Turki. Mengunjungi Blue Mosque, Hagia Sophia, dan tempat bersejarah lainnya.",
      tanggalBerangkat: new Date("2024-11-12T00:00:00Z"),
      tanggalPulang: new Date("2024-11-26T00:00:00Z"),
      harga: 38000000,
      kuota: 25,
      gambar: "/image/5.jpeg",
      hotelId: hotel1.id,
      penerbanganId: penerbangan.id,
      status: "AKTIF"
    },
    update: {}
  });

  const paket6 = await prisma.paket.upsert({
    where: { id: "paket-ramadhan-1" },
    create: {
      id: "paket-ramadhan-1",
      nama: "Paket Umrah Ramadhan 15 Hari",
      deskripsi: "Rasakan syahdunya beribadah umrah di bulan suci Ramadhan. Fasilitas Iftar, Sahur, dan bimbingan ibadah intensif.",
      tanggalBerangkat: new Date("2025-03-01T00:00:00Z"),
      tanggalPulang: new Date("2025-03-15T00:00:00Z"),
      harga: 42000000,
      kuota: 40,
      gambar: "/image/6.jpeg",
      hotelId: hotel1.id,
      penerbanganId: penerbangan.id,
      status: "AKTIF"
    },
    update: {}
  });

  console.log("✓ Sample data created successfully!");
  console.log("- 2 Hotels created");
  console.log("- 1 Penerbangan created"); 
  console.log("- 6 Paket Umrah created");
  console.log("\nPaket Details:");
  console.log(`1. ${paket1.nama} - Rp ${paket1.harga.toLocaleString('id-ID')} - Kuota: ${paket1.kuota}`);
  console.log(`2. ${paket2.nama} - Rp ${paket2.harga.toLocaleString('id-ID')} - Kuota: ${paket2.kuota}`);
  console.log(`3. ${paket3.nama} - Rp ${paket3.harga.toLocaleString('id-ID')} - Kuota: ${paket3.kuota}`);
  console.log(`4. ${paket4.nama} - Rp ${paket4.harga.toLocaleString('id-ID')} - Kuota: ${paket4.kuota}`);
  console.log(`5. ${paket5.nama} - Rp ${paket5.harga.toLocaleString('id-ID')} - Kuota: ${paket5.kuota}`);
  console.log(`6. ${paket6.nama} - Rp ${paket6.harga.toLocaleString('id-ID')} - Kuota: ${paket6.kuota}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
