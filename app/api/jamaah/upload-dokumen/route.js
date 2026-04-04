import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const dokumen = formData.get("dokumen");
    const dokumenId = formData.get("dokumenId");

    if (!dokumen || !dokumenId) {
      return new Response(
        JSON.stringify({ error: "File dan ID dokumen diperlukan" }),
        { status: 400 }
      );
    }

    const bytes = await dokumen.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Ukuran file maksimal 5MB" }),
        { status: 400 }
      );
    }

    // Upload ke Vercel Blob
    const fileName = dokumen.name || `dokumen-${Date.now()}`;
    const blob = await put(`dokumen-jamaah/${Date.now()}-${fileName}`, buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    let updatedDokumen;

    // Format baru: "jenis|pendaftaranId|akunEmail" (dipisah pipe)
    if (dokumenId.includes("|")) {
      const parts = dokumenId.split("|");
      const jenis = parts[0];
      const pendaftaranId = parts[1];
      const akunEmail = parts[2];

      if (!jenis || !pendaftaranId || !akunEmail) {
        return new Response(
          JSON.stringify({ error: "Format dokumenId tidak valid" }),
          { status: 400 }
        );
      }

      // Cek apakah sudah ada dokumen dengan jenis yang sama untuk pendaftaran ini
      const existing = await prisma.dokumen.findFirst({
        where: { pendaftaranId, jenis },
      });

      if (existing) {
        updatedDokumen = await prisma.dokumen.update({
          where: { id: existing.id },
          data: { url: blob.url, status: "MENUNGGU" },
        });
      } else {
        updatedDokumen = await prisma.dokumen.create({
          data: { pendaftaranId, akunEmail, jenis, url: blob.url, status: "MENUNGGU" },
        });
      }
    } else {
      // ID dokumen existing (update)
      const existing = await prisma.dokumen.findUnique({ where: { id: dokumenId } });
      if (!existing) {
        return new Response(
          JSON.stringify({ error: "Dokumen tidak ditemukan" }),
          { status: 404 }
        );
      }
      updatedDokumen = await prisma.dokumen.update({
        where: { id: dokumenId },
        data: { url: blob.url, status: "MENUNGGU" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Dokumen berhasil diupload", dokumen: updatedDokumen }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Gagal upload dokumen: " + error.message }),
      { status: 500 }
    );
  }
}
