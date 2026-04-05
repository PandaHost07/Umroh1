import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(req) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: "Konfigurasi server belum lengkap (DATABASE_URL belum diatur)" }),
        { status: 500 }
      );
    }

    const body = await req.json();
    const { nama, email, password, jenisKelamin, telepon } = body;

    if (!nama || !email || !password || !jenisKelamin) {
      return new Response(
        JSON.stringify({ error: "Semua field wajib diisi" }),
        { status: 400 }
      );
    }

    // Role selalu jamaah untuk registrasi publik — tidak bisa daftar sebagai admin
    const role = "jamaah";

    const existingUser = await prisma.akun.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email sudah terdaftar" }),
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.akun.create({
      data: { nama, email, password: hashedPassword, jenisKelamin, role, telepon, gambar: null },
    });

    return new Response(
      JSON.stringify({ message: "Registrasi berhasil", userId: newUser.email }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server" }),
      { status: 500 }
    );
  }
}
