import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { akunEmail, rating, pesan } = body;

    if (!akunEmail || !rating || !pesan) {
      return new Response(
        JSON.stringify({ error: "Data tidak lengkap" }),
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: "Rating harus antara 1-5" }),
        { status: 400 }
      );
    }

    if (pesan.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Pesan testimoni minimal 10 karakter" }),
        { status: 400 }
      );
    }

    // Cek apakah user sudah pernah memberikan testimoni
    const existingTestimoni = await prisma.testimoni.findFirst({
      where: { akunEmail }
    });

    if (existingTestimoni) {
      return new Response(
        JSON.stringify({ error: "Anda sudah pernah memberikan testimoni" }),
        { status: 400 }
      );
    }

    // Simpan testimoni
    const newTestimoni = await prisma.testimoni.create({
      data: {
        akunEmail,
        rating,
        pesan,
        status: "PUBLIK"
      },
      include: {
        akun: {
          select: {
            nama: true
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ 
        message: "Testimoni berhasil dikirim",
        testimoni: newTestimoni
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating testimoni:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server" }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const testimoniList = await prisma.testimoni.findMany({
      where: { status: "PUBLIK" },
      include: {
        akun: {
          select: {
            nama: true
          }
        }
      },
      orderBy: {
        created: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.testimoni.count({
      where: { status: "PUBLIK" }
    });

    return new Response(
      JSON.stringify({
        testimoni: testimoniList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching testimoni:", error);
    return new Response(
      JSON.stringify({ error: "Gagal memuat testimoni" }),
      { status: 500 }
    );
  }
}
