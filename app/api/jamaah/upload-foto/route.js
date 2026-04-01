import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const email = formData.get("email");

    if (!file || !email) {
      return new Response(JSON.stringify({ error: "File dan email diperlukan" }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 2 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Foto maksimal 2MB" }), { status: 400 });
    }

    const blob = await put(`foto-profil/${Date.now()}-${file.name}`, buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    await prisma.akun.update({
      where: { email },
      data: { gambar: blob.url },
    });

    return new Response(JSON.stringify({ message: "Foto berhasil diupload", url: blob.url }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Gagal upload foto" }), { status: 500 });
  }
}
