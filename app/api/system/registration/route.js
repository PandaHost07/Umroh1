import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get("id");

    const includeOptions = {
      user: true,
      paket: true,
    };

    if (registrationId) {
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: includeOptions,
      });

      if (!registration) {
        return new Response(
          JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(registration), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allRegistrations = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      include: includeOptions,
    });

    return new Response(JSON.stringify(allRegistrations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET registration error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data pendaftaran" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, paketId } = body;

    if (!userId || !paketId) {
      return new Response(
        JSON.stringify({ error: "Field 'userId' dan 'paketId' wajib diisi" }),
        { status: 400 }
      );
    }

    const newRegistration = await prisma.registration.create({
      data: {
        userId,
        paketId,
        status: "PENDING", // Default value, bisa dihilangkan
      },
    });

    return new Response(JSON.stringify(newRegistration), { status: 201 });
  } catch (error) {
    console.error("POST registration error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat membuat pendaftaran" }),
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "Field 'id' dan 'status' wajib diisi" }),
        { status: 400 }
      );
    }

    const existing = await prisma.registration.findUnique({ where: { id } });

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
        { status: 404 }
      );
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: { status },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("PATCH registration error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengupdate pendaftaran" }),
      { status: 500 }
    );
  }
}
