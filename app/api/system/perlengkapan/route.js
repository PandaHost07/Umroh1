import prisma from "@/lib/prisma";

// GET: Ambil data perlengkapan berdasarkan paketId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const paketId = searchParams.get("paket");

    if (!paketId) {
      return new Response(JSON.stringify({ error: "paketId wajib dikirim" }), { status: 400 });
    }

    const pendaftaranList = await prisma.pendaftaran.findMany({
      where: {
        paketId,
        status: { in: ["MENUNGGU", "TERKONFIRMASI"] },
      },
      include: {
        akun: { select: { nama: true, email: true } },
        perlengkapan: true,
      },
    });

    const result = pendaftaranList.map((p) => ({
      pendaftaranId: p.id,
      akun: p.akun,
      perlengkapan: p.perlengkapan,
    }));

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("GET perlengkapan error:", err);
    return new Response(JSON.stringify({ error: "Gagal mengambil data perlengkapan" }), { status: 500 });
  }
}

// POST: Toggle status penerimaan perlengkapan
export async function POST(req) {
  try {
    const body = await req.json();
    const { pendaftaranId, jenis, sudahDiterima } = body;

    if (!pendaftaranId || !jenis) {
      return new Response(JSON.stringify({ error: "pendaftaranId dan jenis wajib diisi" }), { status: 400 });
    }

    const allowed = ["KOPER", "BAJU_IHRAM", "MUKENA", "NAMETAG", "BUKU_DOA_DAN_PANDUAN", "SYAL", "TAS_TRAVEL"];
    if (!allowed.includes(jenis)) {
      return new Response(JSON.stringify({ error: "Jenis perlengkapan tidak valid" }), { status: 400 });
    }

    const existing = await prisma.perlengkapan.findFirst({
      where: { pendaftaranId, jenis },
    });

    let result;
    if (existing) {
      result = await prisma.perlengkapan.update({
        where: { id: existing.id },
        data: {
          sudahDiterima: sudahDiterima ?? !existing.sudahDiterima,
          tanggalTerima: sudahDiterima ? new Date() : null,
        },
      });
    } else {
      result = await prisma.perlengkapan.create({
        data: {
          pendaftaranId,
          jenis,
          sudahDiterima: sudahDiterima ?? true,
          tanggalTerima: new Date(),
        },
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("POST perlengkapan error:", err);
    return new Response(JSON.stringify({ error: "Gagal menyimpan perlengkapan" }), { status: 500 });
  }
}
