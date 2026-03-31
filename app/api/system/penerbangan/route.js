import prisma from "@/lib/prisma";

// GET: Ambil penerbangan atau semua
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const flightId = searchParams.get("id");

    const includeOptions = {
      paket: true, // relasi ke paket
    };

    if (flightId) {
      const flight = await prisma.penerbangan.findUnique({
        where: { id: flightId },
        include: includeOptions,
      });

      if (!flight) {
        return new Response(JSON.stringify({ error: "Penerbangan tidak ditemukan" }), {
          status: 404,
        });
      }

      return new Response(JSON.stringify(flight), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flights = await prisma.penerbangan.findMany({
      orderBy: { created: "desc" },
      include: includeOptions,
    });

    return new Response(JSON.stringify(flights), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET flight error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data penerbangan" }),
      { status: 500 }
    );
  }
}

// POST: Buat penerbangan baru
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      maskapai,
      bandaraTiba,
      waktuBerangkat,
      waktuTiba,
      bandaraBerangkat,
    } = body;

    if (!bandaraTiba || !waktuBerangkat || !waktuTiba) {
      return new Response(
        JSON.stringify({
          error: "Field 'bandaraTiba', 'waktuBerangkat', dan 'waktuTiba' wajib diisi",
        }),
        { status: 400 }
      );
    }

    const newFlight = await prisma.penerbangan.create({
      data: {
        maskapai,
        bandaraTiba,
        waktuBerangkat: new Date(waktuBerangkat),
        waktuTiba: new Date(waktuTiba),
        bandaraBerangkat: bandaraBerangkat || undefined, // fallback ke default schema
      },
    });

    return new Response(JSON.stringify(newFlight), { status: 201 });
  } catch (error) {
    console.error("POST flight error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat membuat penerbangan" }),
      { status: 500 }
    );
  }
}

// PATCH: Update penerbangan
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Field 'id' wajib disertakan untuk update" }),
        { status: 400 }
      );
    }

    const existing = await prisma.penerbangan.findUnique({ where: { id } });

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Penerbangan tidak ditemukan" }),
        { status: 404 }
      );
    }

    // Konversi waktu jika dikirim dalam string
    if (updateData.waktuBerangkat) {
      updateData.waktuBerangkat = new Date(updateData.waktuBerangkat);
    }

    if (updateData.waktuTiba) {
      updateData.waktuTiba = new Date(updateData.waktuTiba);
    }

    const updatedFlight = await prisma.penerbangan.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedFlight), { status: 200 });
  } catch (error) {
    console.error("PATCH flight error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengupdate penerbangan" }),
      { status: 500 }
    );
  }
}
