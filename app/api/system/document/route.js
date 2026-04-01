import prisma from "@/lib/prisma";
import { uploadFileToVercel } from "@/lib/uploadFile";

// GET: Ambil dokumen berdasarkan paketId
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
        dokumen: true,
      },
    });

    const result = pendaftaranList.map((p) => ({
      pendaftaranId: p.id,
      akun: p.akun,
      dokumen: p.dokumen,
    }));

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("GET document error:", error);
    return new Response(JSON.stringify({ error: "Gagal mengambil data dokumen" }), { status: 500 });
  }
}

// PATCH: Update status dokumen
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ error: "id dan status wajib diisi" }), { status: 400 });
    }

    const allowed = ["MENUNGGU", "DISETUJUI", "DITOLAK"];
    if (!allowed.includes(status)) {
      return new Response(JSON.stringify({ error: "Status tidak valid" }), { status: 400 });
    }

    const updated = await prisma.dokumen.update({
      where: { id },
      data: { status },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("PATCH document error:", error);
    return new Response(JSON.stringify({ error: "Gagal update status dokumen" }), { status: 500 });
  }
}
