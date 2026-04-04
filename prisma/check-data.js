const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const mitraCount = await prisma.mitra.count();
  const paketCount = await prisma.paket.count();
  const pakets = await prisma.paket.findMany({ 
    select: { nama: true, tanggalBerangkat: true, status: true, gambar: true }, 
    orderBy: { tanggalBerangkat: "asc" } 
  });
  const mitras = await prisma.mitra.findMany({ select: { nama: true, layanan: true } });
  
  console.log("Mitra count:", mitraCount);
  console.log("Paket count:", paketCount);
  console.log("\nPaket:");
  pakets.forEach(p => console.log(" -", p.nama, "|", p.tanggalBerangkat?.toLocaleDateString("id-ID"), "|", p.status, "| gambar:", p.gambar ? "ada" : "kosong"));
  console.log("\nMitra:");
  mitras.forEach(m => console.log(" -", m.nama, "|", m.layanan));
}

main().catch(e => console.error("Error:", e.message)).finally(() => prisma.$disconnect().then(() => process.exit(0)));
