import prisma from "@/lib/prisma";

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

    // Cek apakah paket ada dan masih ada kuota
    const paket = await prisma.paket.findUnique({
      where: { id: paketId },
      include: {
        pendaftaran: {
          where: {
            status: {
              in: ["MENUNGGU", "TERKONFIRMASI"]
            }
          }
        }
      }
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

    if (paket.kuota <= paket.pendaftaran.length) {
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
        status: {
          in: ["MENUNGGU", "TERKONFIRMASI"]
        }
      }
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
        status: {
          in: ["MENUNGGU", "TERKONFIRMASI"]
        }
      }
    });

    if (activePendaftaranCount >= 3) {
      return new Response(
        JSON.stringify({ error: "Maksimal pemesanan aktif adalah 3 paket. Silakan batalkan salah satu pemesanan untuk memesan paket baru." }),
        { status: 400 }
      );
    }

    // Buat pendaftaran baru dan kurangi kuota
    const newPendaftaran = await prisma.pendaftaran.create({
      data: {
        akunEmail,
        paketId,
        status: "MENUNGGU"
      },
      include: {
        paket: {
          include: {
            hotel: true,
            penerbangan: true
          }
        }
      }
    });

    // Kurangi kuota paket
    await prisma.paket.update({
      where: { id: paketId },
      data: {
        kuota: {
          decrement: 1
        }
      }
    });

    // Buat jadwal pembayaran otomatis
    const dpAmount = Math.round(paket.harga * 0.3);
    const cicilan1Amount = Math.round(paket.harga * 0.3);
    const cicilan2Amount = paket.harga - dpAmount - cicilan1Amount; // Sisa 40%

    await prisma.pembayaran.createMany({
      data: [
        {
          pendaftaranId: newPendaftaran.id,
          jumlah: dpAmount,
          status: "MENUNGGU",
          jenis: "DP"
        },
        {
          pendaftaranId: newPendaftaran.id,
          jumlah: cicilan1Amount,
          status: "MENUNGGU", 
          jenis: "CICILAN_1"
        },
        {
          pendaftaranId: newPendaftaran.id,
          jumlah: cicilan2Amount,
          status: "MENUNGGU",
          jenis: "PELUNASAN"
        }
      ]
    });

    return new Response(
      JSON.stringify({ 
        message: "Pemesanan berhasil",
        pendaftaran: newPendaftaran
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
