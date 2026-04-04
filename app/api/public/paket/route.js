import prisma from "@/lib/prisma";
import { hitungKuotaTersedia, buildKuotaResponse } from "@/lib/kuota";

export async function GET() {
  try {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    });

    const paketList = await prisma.paket.findMany({
      where: {
        status: "AKTIF",
        tanggalBerangkat: { gt: new Date() }, // hanya paket yang belum berangkat
      },
      include: { hotel: true, penerbangan: true },
      orderBy: { tanggalBerangkat: "asc" },
    });

    const paketWithQuota = await Promise.all(
      paketList.map(async (paket) => {
        const used = await hitungKuotaTersedia(prisma, paket.id);
        return { ...paket, ...buildKuotaResponse(paket, used) };
      })
    );

    return new Response(
      JSON.stringify({ success: true, paket: paketWithQuota, total: paketWithQuota.length }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Gagal memuat data paket" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
