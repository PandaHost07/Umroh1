import prisma from "@/lib/prisma";

// GET Hotel
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("id");
    const includeOptions = { paket: true, };

    if (hotelId) {
      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        include: includeOptions,
      });

      if (!hotel) {
        return new Response(JSON.stringify({ error: "Hotel tidak ditemukan" }), {
          status: 404,
        });
      }

      return new Response(JSON.stringify(hotel), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hotels = await prisma.hotel.findMany({
      orderBy: { created: "desc" },
      include: includeOptions,
    });

    return new Response(JSON.stringify(hotels), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET hotel error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil hotel" }),
      { status: 500 }
    );
  }
}

// POST Hotel
export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, lokasi } = body;

    // Validasi: wajib isi nama dan lokasi
    if (!nama || !lokasi) {
      return new Response(
        JSON.stringify({ error: "Field 'nama' dan 'lokasi' wajib diisi" }),
        { status: 400 }
      );
    }

    // Validasi enum lokasi
    const allowedLocations = ["MEKKAH", "MADINAH"];
    if (!allowedLocations.includes(lokasi)) {
      return new Response(
        JSON.stringify({ error: "Lokasi harus salah satu dari: MEKKAH atau MADINAH" }),
        { status: 400 }
      );
    }

    const newHotel = await prisma.hotel.create({
      data: body,
    });

    return new Response(JSON.stringify(newHotel), { status: 201 });
  } catch (error) {
    console.error("POST hotel error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat membuat hotel" }),
      { status: 500 }
    );
  }
}

// PATCH Hotel
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

    const existingHotel = await prisma.hotel.findUnique({ where: { id } });

    if (!existingHotel) {
      return new Response(
        JSON.stringify({ error: "Hotel tidak ditemukan" }),
        { status: 404 }
      );
    }

    // Jika update lokasi, validasi enum
    if (updateData.lokasi) {
      const allowedLocations = ["MEKKAH", "MADINAH"];
      if (!allowedLocations.includes(updateData.lokasi)) {
        return new Response(
          JSON.stringify({ error: "Lokasi harus salah satu dari: MEKKAH atau MADINAH" }),
          { status: 400 }
        );
      }
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedHotel), { status: 200 });
  } catch (error) {
    console.error("PATCH hotel error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengupdate hotel" }),
      { status: 500 }
    );
  }
}
