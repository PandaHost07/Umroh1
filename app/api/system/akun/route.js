import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

// Ambil semua user atau user berdasarkan email
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      const user = await prisma.akun.findUnique({ where: { email }, include: { profil: true }, });

      if (!user) {
        return new Response(JSON.stringify({ error: "User tidak ditemukan" }), { status: 404 });
      }

      return new Response(JSON.stringify(sanitizeUser(user)), { status: 200 });
    }

    const users = await prisma.akun.findMany({ include: { profil: true } });
    const safeUsers = users.map(sanitizeUser);
    return new Response(JSON.stringify(safeUsers), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Gagal mengambil user" }), { status: 500 });
  }
}

// Buat user baru
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, jenisKelamin, Role, telepon } = body;

    if (!name || !email || !password || !jenisKelamin || !Role) {
      return new Response(JSON.stringify({ error: "Field wajib diisi" }), { status: 400 });
    }

    const existingUser = await prisma.akun.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email sudah terdaftar" }), { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.akun.create({
      data: {
        name,
        email,
        password: hashedPassword,
        jenisKelamin,
        Role,
        telepon,
      },
      include: { profil: true },
    });

    return new Response(JSON.stringify(sanitizeUser(newUser)), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Gagal membuat user" }), { status: 500 });
  }
}

// PATCH: Update user
export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email"); 
    if (!email) {
      return new Response(JSON.stringify({ error: "Email diperlukan" }), { status: 400 });
    }

    const body = await req.json();

    if (body.password) {
      body.password = await hash(body.password, 10);
    }

    const updatedUser = await prisma.akun.update({
      where: { email },
      data: body,
      include: { profil: true },
    });

    return new Response(JSON.stringify(sanitizeUser(updatedUser)), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Gagal update user" }), { status: 500 });
  }
}

// DELETE: Hapus user
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return new Response(JSON.stringify({ error: "Email diperlukan" }), { status: 400 });
    }

    await prisma.akun.delete({ where: { email } });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Gagal menghapus user" }), { status: 500 });
  }
}

// Hilangkan password dari response
function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}
