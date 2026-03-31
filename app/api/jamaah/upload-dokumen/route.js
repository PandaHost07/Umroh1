import { put } from '@vercel/blob';
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const dokumen = formData.get('dokumen');
    const dokumenId = formData.get('dokumenId');

    if (!dokumen || !dokumenId) {
      return new Response(
        JSON.stringify({ error: "File dan ID dokumen diperlukan" }),
        { status: 400 }
      );
    }

    // Validasi file
    const bytes = await dokumen.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) { // 5MB
      return new Response(
        JSON.stringify({ error: "Ukuran file maksimal 5MB" }),
        { status: 400 }
      );
    }

    // Upload ke Vercel Blob
    const blob = await put(`dokumen-jamaah/${Date.now()}-${dokumen.name}`, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update atau buat dokumen baru
    let updatedDokumen;
    
    // Cek apakah dokumenId adalah ID existing atau data baru
    if (dokumenId.length > 20) { // Existing ID (cuid)
      updatedDokumen = await prisma.dokumen.update({
        where: { id: dokumenId },
        data: {
          url: blob.url,
          status: "MENUNGGU"
        }
      });
    } else {
      // Data baru dari frontend (isNew: true)
      const [jenis, pendaftaranId, akunEmail] = dokumenId.split('|');
      
      updatedDokumen = await prisma.dokumen.create({
        data: {
          pendaftaranId,
          akunEmail,
          jenis,
          url: blob.url,
          status: "MENUNGGU"
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        message: "Dokumen berhasil diupload",
        dokumen: updatedDokumen
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error uploading dokumen:", error);
    return new Response(
      JSON.stringify({ error: "Gagal upload dokumen" }),
      { status: 500 }
    );
  }
}
