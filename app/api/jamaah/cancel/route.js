import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { pendaftaranId, alasan } = body;

    if (!pendaftaranId) {
      return new Response(
        JSON.stringify({ error: "ID pendaftaran diperlukan" }),
        { status: 400 }
      );
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: { paket: true, pembayaran: true },
    });

    if (!pendaftaran) {
      return new Response(
        JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
        { status: 404 }
      );
    }

    // Validasi status — hanya bisa batalkan jika MENUNGGU atau TERKONFIRMASI
    if (!["MENUNGGU", "TERKONFIRMASI"].includes(pendaftaran.status)) {
      return new Response(
        JSON.stringify({ error: "Pendaftaran tidak dapat dibatalkan" }),
        { status: 400 }
      );
    }

    // Cek apakah sudah ada pembayaran yang terverifikasi
    const verifiedPayments = pendaftaran.pembayaran.filter(
      (p) => p.status === "TERVERIFIKASI"
    );
    if (verifiedPayments.length > 0) {
      return new Response(
        JSON.stringify({
          error:
            "Tidak dapat membatalkan pendaftaran yang sudah ada pembayaran terverifikasi",
        }),
        { status: 400 }
      );
    }

    // Update status ke TIDAK_TERKONFIRMASI (sesuai enum StatusPendaftaran)
    // TANPA increment kuota — kuota dihitung dinamis dari COUNT pendaftaran aktif
    const updatedPendaftaran = await prisma.pendaftaran.update({
      where: { id: pendaftaranId },
      data: { status: "TIDAK_TERKONFIRMASI" },
    });

    return new Response(
      JSON.stringify({
        message: "Pendaftaran berhasil dibatalkan",
        pendaftaran: updatedPendaftaran,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error canceling pendaftaran:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server" }),
      { status: 500 }
    );
  }
}
