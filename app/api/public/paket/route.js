import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🚀 API: Fetching paket list...");
    
    // Set headers untuk no cache
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    const paketList = await prisma.paket.findMany({
      where: {
        status: "AKTIF"
      },
      include: {
        hotel: true,
        penerbangan: true
      }
    });

    console.log("📦 Raw paket list:", paketList.length, "items");

    // Hitung kuota untuk setiap paket
    const paketWithQuota = await Promise.all(
      paketList.map(async (paket) => {
        const usedQuota = await prisma.pendaftaran.count({
          where: {
            paketId: paket.id,
            status: {
              in: ["MENUNGGU", "TERKONFIRMASI"]
            }
          }
        });
        
        const availableQuota = paket.kuota - usedQuota;
        
        return {
          ...paket,
          kuotaTersedia: availableQuota,
          isAvailable: availableQuota > 0,
          quotaUsage: {
            used: usedQuota,
            total: paket.kuota,
            percentage: Math.round((usedQuota / paket.kuota) * 100)
          }
        };
      })
    );

    const response = {
      success: true,
      paket: paketWithQuota,
      total: paketWithQuota.length,
      timestamp: new Date().toISOString()
    };

    console.log("✅ Final API response:", {
      success: response.success,
      total: response.total,
      sample: response.paket[0] ? {
        id: response.paket[0].id,
        nama: response.paket[0].nama,
        kuotaTersedia: response.paket[0].kuotaTersedia
      } : null
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("💥 API Error:", error);
    
    const errorResponse = {
      success: false,
      error: "Gagal memuat data paket",
      details: error.message,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
