import prisma from "@/lib/prisma";

export async function DELETE(req) {
  try {
    const { sessionToken, email } = await req.json();

    if (!sessionToken && !email) {
      return new Response(
        JSON.stringify({ error: "sessionToken atau email harus disertakan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hapus berdasarkan sessionToken jika tersedia
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    }

    // Atau hapus semua session user berdasarkan email
    if (email) {
      await prisma.session.deleteMany({
        where: { userId: email },
      });
    }

    return new Response(
      JSON.stringify({ message: "Session berhasil dihapus" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gagal menghapus session:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
