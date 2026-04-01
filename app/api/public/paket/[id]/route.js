import prisma from "@/lib/prisma";
import { hitungKuotaTersedia, buildKuotaResponse } from "@/lib/kuota";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const paket = await prisma.paket.findUnique({
      where: { id, status: "AKTIF" },
      include: { hotel: true, penerbangan: true },
    });

    if (!paket) {
      return new Response(
        JSON.stringify({ error: "Paket tidak ditemukan" }),
        { status: 404 }
      );
    }

    const used = await hitungKuotaTersedia(prisma, id);
    return new Response(
      JSON.stringify({ ...paket, ...buildKuotaResponse(paket, used) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching paket detail:", error);
    return new Response(
      JSON.stringify({ error: "Gagal memuat detail paket" }),
      { status: 500 }
    );
  }
}
