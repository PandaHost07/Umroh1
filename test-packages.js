const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.paket.findMany({ select: { id: true, nama: true, gambar: true } }).then(console.log).finally(() => prisma.$disconnect());
