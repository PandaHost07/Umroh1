import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const results = [];

    // ============================================================
    // 1. MITRA
    // ============================================================
    const mitraData = [
      { nama: "Garuda Indonesia", layanan: "Maskapai Penerbangan", telepon: "021-2351-9999", alamat: "Jl. Kebon Sirih No.44, Jakarta Pusat" },
      { nama: "Hotel Hilton Makkah", layanan: "Hotel Bintang 5 - Mekkah", telepon: "+966-12-571-1111", alamat: "Ibrahim Al Khalil Rd, Makkah" },
      { nama: "Hotel Pullman ZamZam Madinah", layanan: "Hotel Bintang 5 - Madinah", telepon: "+966-14-825-5555", alamat: "King Fahd Rd, Madinah" },
      { nama: "PT. Visa Umrah Nusantara", layanan: "Pengurusan Visa Umrah", telepon: "021-5555-1234", alamat: "Jl. Sudirman No.12, Jakarta" },
      { nama: "Bus Pariwisata Lampung Jaya", layanan: "Transportasi Bus", telepon: "0721-555-888", alamat: "Jl. Raden Intan No.5, Bandar Lampung" },
    ];

    for (const m of mitraData) {
      const existing = await prisma.mitra.findFirst({ where: { nama: m.nama } });
      if (!existing) {
        await prisma.mitra.create({ data: m });
        results.push("✓ Mitra: " + m.nama);
      } else {
        results.push("⏭ Mitra sudah ada: " + m.nama);
      }
    }

    // ============================================================
    // 2. HOTEL
    // ============================================================
    let hotelMekkah = await prisma.hotel.findFirst({ where: { nama: "Hilton Makkah Convention Hotel" } });
    if (!hotelMekkah) {
      hotelMekkah = await prisma.hotel.create({
        data: {
          nama: "Hilton Makkah Convention Hotel",
          bintang: 5,
          lokasi: "MEKKAH",
          alamat: "Ibrahim Al Khalil Rd, Makkah, Saudi Arabia",
          deskripsi: "Hotel bintang 5 dengan jarak 200m dari Masjidil Haram, fasilitas lengkap dan pemandangan Ka'bah.",
        },
      });
      results.push("✓ Hotel Mekkah dibuat");
    } else {
      results.push("⏭ Hotel Mekkah sudah ada");
    }

    let hotelMadinah = await prisma.hotel.findFirst({ where: { nama: "Pullman ZamZam Madinah" } });
    if (!hotelMadinah) {
      hotelMadinah = await prisma.hotel.create({
        data: {
          nama: "Pullman ZamZam Madinah",
          bintang: 5,
          lokasi: "MADINAH",
          alamat: "King Fahd Rd, Madinah, Saudi Arabia",
          deskripsi: "Hotel bintang 5 berhadapan langsung dengan Masjid Nabawi, fasilitas premium.",
        },
      });
      results.push("✓ Hotel Madinah dibuat");
    } else {
      results.push("⏭ Hotel Madinah sudah ada");
    }

    // ============================================================
    // 3. PENERBANGAN
    // ============================================================
    let penerbanganGaruda = await prisma.penerbangan.findFirst({ where: { maskapai: "Garuda Indonesia" } });
    if (!penerbanganGaruda) {
      penerbanganGaruda = await prisma.penerbangan.create({
        data: {
          maskapai: "Garuda Indonesia",
          bandaraBerangkat: "Raden Intan Lampung",
          bandaraTiba: "King Abdulaziz International Airport",
          waktuBerangkat: new Date("2026-06-15T07:00:00.000Z"),
          waktuTiba: new Date("2026-06-15T15:00:00.000Z"),
        },
      });
      results.push("✓ Penerbangan Garuda dibuat");
    } else {
      results.push("⏭ Penerbangan Garuda sudah ada");
    }

    let penerbanganSaudi = await prisma.penerbangan.findFirst({ where: { maskapai: "Saudi Arabian Airlines" } });
    if (!penerbanganSaudi) {
      penerbanganSaudi = await prisma.penerbangan.create({
        data: {
          maskapai: "Saudi Arabian Airlines",
          bandaraBerangkat: "Raden Intan Lampung",
          bandaraTiba: "King Abdulaziz International Airport",
          waktuBerangkat: new Date("2026-08-10T08:00:00.000Z"),
          waktuTiba: new Date("2026-08-10T16:00:00.000Z"),
        },
      });
      results.push("✓ Penerbangan Saudi Airlines dibuat");
    } else {
      results.push("⏭ Penerbangan Saudi Airlines sudah ada");
    }

    // ============================================================
    // 4. PAKET UMRAH — pakai gambar dari paket yang sudah ada
    // ============================================================
    const existingPakets = await prisma.paket.findMany({
      where: { gambar: { not: "" } },
      select: { gambar: true },
      take: 10,
    });
    const gambarList = existingPakets.map(p => p.gambar).filter(Boolean);
    const getGambar = (i) => gambarList[i % gambarList.length] || "";

    const paketBaru = [
      {
        nama: "Paket Umrah Reguler Juni 2026",
        deskripsi: "Paket umrah reguler 12 hari. Hotel bintang 5 dekat Masjidil Haram, penerbangan Garuda Indonesia, transportasi AC, pembimbing berpengalaman, makan 3x sehari, dan perlengkapan umrah lengkap.",
        tanggalBerangkat: new Date("2026-06-15T00:00:00.000Z"),
        tanggalPulang: new Date("2026-06-27T00:00:00.000Z"),
        harga: 28000000,
        kuota: 40,
        hotelId: hotelMekkah.id,
        penerbanganId: penerbanganGaruda.id,
      },
      {
        nama: "Paket Umrah Plus September 2026",
        deskripsi: "Paket umrah 15 hari dengan program ibadah intensif. Hotel bintang 5, penerbangan langsung, city tour Mekkah & Madinah, pembimbing berpengalaman, dan fasilitas lengkap.",
        tanggalBerangkat: new Date("2026-09-01T00:00:00.000Z"),
        tanggalPulang: new Date("2026-09-16T00:00:00.000Z"),
        harga: 35000000,
        kuota: 30,
        hotelId: hotelMekkah.id,
        penerbanganId: penerbanganGaruda.id,
      },
      {
        nama: "Paket Umrah VIP Agustus 2026",
        deskripsi: "Paket umrah premium VIP 10 hari. Hotel bintang 5 kelas bisnis, penerbangan Saudi Arabian Airlines, transportasi private, pembimbing personal, dan fasilitas eksklusif.",
        tanggalBerangkat: new Date("2026-08-10T00:00:00.000Z"),
        tanggalPulang: new Date("2026-08-20T00:00:00.000Z"),
        harga: 45000000,
        kuota: 20,
        hotelId: hotelMekkah.id,
        penerbanganId: penerbanganSaudi.id,
      },
      {
        nama: "Paket Umrah Hemat Oktober 2026",
        deskripsi: "Paket umrah ekonomis 9 hari. Cocok untuk jamaah dengan budget terbatas. Hotel bintang 4, penerbangan Garuda Indonesia, makan 3x sehari, dan pembimbing berpengalaman.",
        tanggalBerangkat: new Date("2026-10-05T00:00:00.000Z"),
        tanggalPulang: new Date("2026-10-14T00:00:00.000Z"),
        harga: 22000000,
        kuota: 50,
        hotelId: hotelMadinah.id,
        penerbanganId: penerbanganGaruda.id,
      },
      {
        nama: "Paket Umrah Keluarga Desember 2026",
        deskripsi: "Paket umrah khusus keluarga 12 hari. Kamar family, program anak-anak, pembimbing ramah keluarga. Hotel bintang 5, penerbangan, makan, dan perlengkapan umrah untuk seluruh keluarga.",
        tanggalBerangkat: new Date("2026-12-20T00:00:00.000Z"),
        tanggalPulang: new Date("2027-01-01T00:00:00.000Z"),
        harga: 32000000,
        kuota: 35,
        hotelId: hotelMekkah.id,
        penerbanganId: penerbanganGaruda.id,
      },
    ];

    for (let i = 0; i < paketBaru.length; i++) {
      const p = paketBaru[i];
      const existing = await prisma.paket.findFirst({ where: { nama: p.nama } });
      if (!existing) {
        await prisma.paket.create({
          data: { ...p, gambar: getGambar(i), status: "AKTIF" },
        });
        results.push("✓ Paket: " + p.nama);
      } else {
        results.push("⏭ Paket sudah ada: " + p.nama);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
