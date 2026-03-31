import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const paket = await prisma.paket.findUnique({
      where: { 
        id,
        status: "AKTIF"
      },
      include: {
        hotel: true,
        penerbangan: true,
        _count: {
          select: {
            pendaftaran: {
              where: {
                status: {
                  in: ["MENUNGGU", "TERKONFIRMASI"]
                }
              }
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

    // Hitung sisa kuota
    const paketWithQuota = {
      ...paket,
      kuotaTersedia: paket.kuota - paket._count.pendaftaran
    };

    return new Response(
      JSON.stringify(paketWithQuota),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching paket detail:", error);
    return new Response(
      JSON.stringify({ error: "Gagal memuat detail paket" }),
      { status: 500 }
    );
  }
}
