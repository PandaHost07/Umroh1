import prisma from "@/lib/prisma";

// GET: Ambil data perlengkapan berdasarkan paketId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const paketId = searchParams.get("paket");

    if (!paketId) {
      return new Response(JSON.stringify({ error: "paketId wajib dikirim" }), {
        status: 400,
      });
    }

    const data = await prisma.registration.findMany({
      where: { paketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        perlengkapanJamaah: true,
      },
    });

    // Format data
    const result = data.map((reg) => ({
      registrationId: reg.id,
      user: reg.user,
      perlengkapan: reg.perlengkapanJamaah,
    }));

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("GET perlengkapan error:", err);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan saat mengambil data perlengkapan",
      }),
      { status: 500 }
    );
  }
}

// POST: Tambah atau update status penerimaan perlengkapan
export async function POST(req) {
  try {
    const body = await req.json();
    const { registrationId, perlengkapan, isReceived } = body;

    if (!registrationId || !perlengkapan) {
      return new Response(
        JSON.stringify({
          error: "Field 'registrationId' dan 'perlengkapan' wajib diisi",
        }),
        { status: 400 }
      );
    }

    const allowed = [
      "KOPER",
      "BAJU_IHRAM",
      "MUKENA",
      "NAMETAG",
      "BUKU_DOA_DAN_PANDUAN",
      "SYAL",
      "TAS_TRAVEL",
    ];

    if (!allowed.includes(perlengkapan)) {
      return new Response(
        JSON.stringify({ error: "Jenis perlengkapan tidak valid" }),
        { status: 400 }
      );
    }

    const existing = await prisma.perlengkapanJamaah.findFirst({
      where: {
        registrationId,
        perlengkapan,
      },
    });

    const now = new Date();
    let result;

    if (existing) {
      result = await prisma.perlengkapanJamaah.update({
        where: { id: existing.id },
        data: {
          isReceived: isReceived ?? true,
          receivedAt: now,
          updatedAt: now,
        },
      });
    } else {
      result = await prisma.perlengkapanJamaah.create({
        data: {
          registrationId,
          perlengkapan,
          isReceived: isReceived ?? true,
          receivedAt: now,
        },
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("POST perlengkapan error:", err);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan saat menyimpan perlengkapan",
      }),
      { status: 500 }
    );
  }
}

// PATCH: Update data perlengkapan berdasarkan ID
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Field 'id' wajib disertakan" }),
        { status: 400 }
      );
    }

    const existing = await prisma.perlengkapanJamaah.findUnique({
      where: { id },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Data perlengkapan tidak ditemukan" }),
        { status: 404 }
      );
    }

    const updated = await prisma.perlengkapanJamaah.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("PATCH perlengkapanJamaah error:", error);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan saat memperbarui data perlengkapan",
      }),
      { status: 500 }
    );
  }
}
