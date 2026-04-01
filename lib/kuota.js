/**
 * Hitung jumlah slot terpakai untuk suatu paket.
 * Slot terpakai = pendaftaran dengan status MENUNGGU atau TERKONFIRMASI.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} paketId
 * @returns {Promise<number>} jumlah slot terpakai
 */
export async function hitungKuotaTersedia(prisma, paketId) {
  const used = await prisma.pendaftaran.count({
    where: {
      paketId,
      status: { in: ["MENUNGGU", "TERKONFIRMASI"] },
    },
  });
  return used;
}

/**
 * Bangun objek respons kuota yang konsisten untuk semua endpoint.
 * @param {{ kuota: number }} paket
 * @param {number} used - jumlah slot terpakai dari hitungKuotaTersedia
 * @returns {{ kuotaTersedia: number, isAvailable: boolean, quotaUsage: { used: number, total: number, percentage: number } }}
 */
export function buildKuotaResponse(paket, used) {
  const kuotaTersedia = paket.kuota - used;
  return {
    kuotaTersedia,
    isAvailable: kuotaTersedia > 0,
    quotaUsage: {
      used,
      total: paket.kuota,
      percentage: Math.round((used / paket.kuota) * 100),
    },
  };
}
