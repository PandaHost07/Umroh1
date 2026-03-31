import { put } from '@vercel/blob';
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const bukti = formData.get('bukti');
    const pembayaranId = formData.get('pembayaranId');

    if (!bukti || !pembayaranId) {
      return new Response(
        JSON.stringify({ error: "File dan ID pembayaran diperlukan" }),
        { status: 400 }
      );
    }

    // Validasi file
    const bytes = await bukti.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) { // 5MB
      return new Response(
        JSON.stringify({ error: "Ukuran file maksimal 5MB" }),
        { status: 400 }
      );
    }

    // Upload ke Vercel Blob
    const blob = await put(`bukti-pembayaran/${Date.now()}-${bukti.name}`, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update pembayaran dengan URL bukti
    const updatedPembayaran = await prisma.pembayaran.update({
      where: { id: pembayaranId },
      data: {
        buktiUrl: blob.url
      }
    });

    return new Response(
      JSON.stringify({ 
        message: "Bukti pembayaran berhasil diupload",
        buktiUrl: blob.url
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error uploading bukti:", error);
    return new Response(
      JSON.stringify({ error: "Gagal upload bukti pembayaran" }),
      { status: 500 }
    );
  }
}
