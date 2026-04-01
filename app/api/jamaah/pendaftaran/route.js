import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email diperlukan" }),
        { status: 400 }
      );
    }

    const pendaftaranList = await prisma.pendaftaran.findMany({
      where: { akunEmail: email },
      include: {
        akun: { select: { nama: true, email: true } },
        paket: {
          include: { hotel: true, penerbangan: true },
        },
        pembayaran: { orderBy: { created: "asc" } },
        dokumen: true,
        iternary: true,
      },
      orderBy: { created: "desc" },
    });

    return new Response(
      JSON.stringify(pendaftaranList),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching pendaftaran:", error);
    return new Response(
      JSON.stringify({ error: "Gagal memuat data pendaftaran" }),
      { status: 500 }
    );
  }
}
