const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Menambahkan data untuk model-model terkait terlebih dahulu

  // JenisPesawat
  const jenisPesawat = await prisma.jenisPesawat.create({
    data: {
      nama: "Boeing 747",
      harga: 15000000,
      penjemputan: "Jeddah",
      transit: false,
      rute: "Jakarta - Mekkah",
    },
  });

  // JenisPaket
  const jenisPaket = await prisma.jenisPaket.create({
    data: {
      kategori: "Umroh Reguler",
      durasi: 10, // Durasi 10 hari
    },
  });

  // Muthawif
  const muthawif = await prisma.muthawif.create({
    data: {
      nama: "Muthawif A",
      harga: 2000000,
      location: "Jakarta",
      telepon: "081234567890",
    },
  });

  // JenisHotel untuk Mekkah
  const hotelMekkah = await prisma.jenisHotel.create({
    data: {
      nama: "Hotel Mekkah A",
      jenis: "Hotel",
      alamat: "Mekkah, Al Haram",
      maps: "https://maps.google.com",
      starHotel: 5,
      harga: 5000000,
      description: "Hotel bintang 5 dekat Masjidil Haram",
    },
  });

  // JenisHotel untuk Madinah
  const hotelMadinah = await prisma.jenisHotel.create({
    data: {
      nama: "Hotel Madinah A",
      jenis: "Hotel",
      alamat: "Madinah, Central Area",
      maps: "https://maps.google.com",
      starHotel: 4,
      harga: 4000000,
      description: "Hotel bintang 4 dekat Masjid Nabawi",
    },
  });

  // Menambahkan data ke dalam tabel Paket
  const paket = await prisma.paket.create({
    data: {
      nama: "Paket Umroh Premium",
      tanggal: new Date("2025-06-01"),
      dp: 5000000,
      harga: 25000000,
      status: true,
      totalSeat: 20,
      image: "https://example.com/umroh-premium.jpg",
      deskripsi:
        "Paket umroh dengan fasilitas premium dan muthawif berpengalaman.",
      jenisPesawatId: jenisPesawat.id,
      hotelMekkahId: hotelMekkah.id,
      hotelMadinahId: hotelMadinah.id,
      jenisPaketId: jenisPaket.id,
      muthawifId: muthawif.id,
    },
  });

  console.log("Paket berhasil ditambahkan:", paket);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
