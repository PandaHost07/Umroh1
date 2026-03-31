import prisma from "@/lib/prisma";

// ==========================
// GET Pendaftaran
// ==========================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pendaftaranId = searchParams.get("id");

    const includeOptions = {
      akun: true,
      paket: true,
    };

    if (pendaftaranId) {
      const pendaftaran = await prisma.pendaftaran.findUnique({
        where: { id: pendaftaranId },
        include: includeOptions,
      });

      if (!pendaftaran) {
        return new Response(
          JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(pendaftaran), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const all = await prisma.pendaftaran.findMany({
      orderBy: { created: "desc" },
      include: includeOptions,
    });

    return new Response(JSON.stringify(all), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET pendaftaran error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data pendaftaran" }),
      { status: 500 }
    );
  }
}

// ==========================
// POST Pendaftaran
// ==========================
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, paketId } = body;

    if (!paketId || !email) {
      return new Response(
        JSON.stringify({ error: "'paketId' dan 'email' wajib diisi" }),
        { status: 400 }
      );
    }

    const paket = await prisma.paket.findUnique({
      where: { id: paketId },
      include: { pendaftaran: true },
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

    if (paket.pendaftaran.length >= paket.kuota) {
      return new Response(
        JSON.stringify({ error: "Kuota paket sudah penuh" }),
        { status: 400 }
      );
    }

    const newPendaftaran = await prisma.pendaftaran.create({
      data: {
        akunEmail: email,
        paketId,
      },
    });

    return new Response(
      JSON.stringify({ success: true, pendaftaran: newPendaftaran }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST pendaftaran error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat membuat pendaftaran" }),
      { status: 500 }
    );
  }
}

// ==========================
// PATCH Pendaftaran
// ==========================
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "'id' dan 'status' wajib diisi" }),
        { status: 400 }
      );
    }

    const existing = await prisma.pendaftaran.findUnique({ where: { id } });

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
        { status: 404 }
      );
    }

    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: { status },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("PATCH pendaftaran error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengupdate pendaftaran" }),
      { status: 500 }
    );
  }
}
