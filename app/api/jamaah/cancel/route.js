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

    // Ambil data pendaftaran
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        paket: true,
        pembayaran: true
      }
    });

    if (!pendaftaran) {
      return new Response(
        JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
        { status: 404 }
      );
    }

    // Cek status pendaftaran
    if (pendaftaran.status === "DIBATALKAN") {
      return new Response(
        JSON.stringify({ error: "Pendaftaran sudah dibatalkan" }),
        { status: 400 }
      );
    }

    // Cek apakah sudah ada pembayaran yang terverifikasi
    const verifiedPayments = pendaftaran.pembayaran.filter(p => p.status === "TERVERIFIKASI");
    if (verifiedPayments.length > 0) {
      return new Response(
        JSON.stringify({ error: "Tidak dapat membatalkan pendaftaran yang sudah ada pembayaran terverifikasi" }),
        { status: 400 }
      );
    }

    // Hitung refund berdasarkan kebijakan
    let refundAmount = 0;
    const now = new Date();
    const createdDate = new Date(pendaftaran.created);
    const daysSinceBooking = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    if (daysSinceBooking <= 7) {
      // Full refund jika dibatalkan dalam 7 hari
      refundAmount = verifiedPayments.reduce((sum, p) => sum + p.jumlah, 0);
    } else if (daysSinceBooking <= 30) {
      // 50% refund jika dibatalkan 8-30 hari
      refundAmount = Math.round(verifiedPayments.reduce((sum, p) => sum + p.jumlah, 0) * 0.5);
    } else {
      // 25% refund jika dibatalkan > 30 hari
      refundAmount = Math.round(verifiedPayments.reduce((sum, p) => sum + p.jumlah, 0) * 0.25);
    }

    // Update status pendaftaran
    const updatedPendaftaran = await prisma.pendaftaran.update({
      where: { id: pendaftaranId },
      data: {
        status: "DIBATALKAN",
        catatanBatal: alasan || "Dibatalkan oleh jamaah"
      }
    });

    // Update status pembayaran menjadi DITOLAK (untuk refund)
    if (verifiedPayments.length > 0) {
      await prisma.pembayaran.updateMany({
        where: {
          id: { in: verifiedPayments.map(p => p.id) }
        },
        data: {
          status: "DITOLAK",
          catatan: `Refund ${formatCurrency(refundAmount)} - ${daysSinceBooking <= 7 ? '100%' : daysSinceBooking <= 30 ? '50%' : '25%'}`
        }
      });
    }

    // Kembalikan kuota paket
    await prisma.paket.update({
      where: { id: pendaftaran.paketId },
      data: {
        kuota: {
          increment: 1
        }
      }
    });

    return new Response(
      JSON.stringify({ 
        message: "Pendaftaran berhasil dibatalkan",
        refundAmount,
        refundPercentage: daysSinceBooking <= 7 ? 100 : daysSinceBooking <= 30 ? 50 : 25,
        pendaftaran: updatedPendaftaran
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

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
}
