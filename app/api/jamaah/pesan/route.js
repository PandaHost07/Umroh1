import prisma from "@/lib/prisma";
import { hitungKuotaTersedia, buildKuotaResponse } from "@/lib/kuota";

export async function POST(req) {
  try {
    const body = await req.json();
    const { paketId, akunEmail } = body;

    if (!paketId || !akunEmail) {
      return new Response(
        JSON.stringify({ error: "Data tidak lengkap" }),
        { status: 400 }
      );
    }

    const paket = await prisma.paket.findUnique({
      where: { id: paketId },
    });

    if (!paket) {
      return new Response(
        JSON.stringify({ error: "Paket tidak ditemukan" }),
        { status: 404 }
      );
    }

    if (paket.status !== "AKTIF") {
      return new Response(
        JSON.stringify({ error: "Paket tidak aktif" }),
        { status: 400 }
      );
    }

    // Validasi tanggal — paket yang sudah lewat tidak bisa dipesan
    if (new Date(paket.tanggalBerangkat) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Paket ini sudah tidak tersedia karena tanggal keberangkatan telah berlalu." }),
        { status: 400 }
      );
    }

    // Validasi kuota secara dinamis
    const used = await hitungKuotaTersedia(prisma, paketId);
    if (used >= paket.kuota) {
      return new Response(
        JSON.stringify({ error: "Kuota paket sudah penuh" }),
        { status: 400 }
      );
    }

    // Cek apakah user sudah pernah mendaftar paket ini
    const existingPendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        akunEmail,
        paketId,
        status: { in: ["MENUNGGU", "TERKONFIRMASI"] },
      },
    });

    if (existingPendaftaran) {
      return new Response(
        JSON.stringify({ error: "Anda sudah mendaftar untuk paket ini" }),
        { status: 400 }
      );
    }

    // Cek maksimal pemesanan aktif per jamaah (max 3)
    const activePendaftaranCount = await prisma.pendaftaran.count({
      where: {
        akunEmail,
        status: { in: ["MENUNGGU", "TERKONFIRMASI"] },
      },
    });

    if (activePendaftaranCount >= 3) {
      return new Response(
        JSON.stringify({
          error:
            "Maksimal pemesanan aktif adalah 3 paket. Silakan batalkan salah satu pemesanan untuk memesan paket baru.",
        }),
        { status: 400 }
      );
    }

    // Buat pendaftaran baru (TANPA decrement kuota — kuota dihitung dinamis)
    const newPendaftaran = await prisma.pendaftaran.create({
      data: {
        akunEmail,
        paketId,
        status: "MENUNGGU",
      },
      include: {
        paket: {
          include: { hotel: true, penerbangan: true },
        },
      },
    });

    // Buat jadwal pembayaran otomatis
    const dpAmount = Math.round(paket.harga * 0.3);
    const cicilan1Amount = Math.round(paket.harga * 0.3);
    const pelunasanAmount = paket.harga - dpAmount - cicilan1Amount;

    await prisma.pembayaran.createMany({
      data: [
        { pendaftaranId: newPendaftaran.id, jumlah: dpAmount, status: "MENUNGGU", jenis: "DP" },
        { pendaftaranId: newPendaftaran.id, jumlah: cicilan1Amount, status: "MENUNGGU", jenis: "CICILAN_1" },
        { pendaftaranId: newPendaftaran.id, jumlah: pelunasanAmount, status: "MENUNGGU", jenis: "PELUNASAN" },
      ],
    });

    const usedAfter = await hitungKuotaTersedia(prisma, paketId);
    const kuotaInfo = buildKuotaResponse(paket, usedAfter);

    return new Response(
      JSON.stringify({
        message: "Pemesanan berhasil",
        pendaftaran: newPendaftaran,
        ...kuotaInfo,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pendaftaran:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server" }),
      { status: 500 }
    );
  }
}
