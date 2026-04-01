import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ambil semua mitra
export async function GET() {
  try {
    const mitraList = await prisma.mitra.findMany({
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json({ success: true, count: mitraList.length, mitra: mitraList }, { status: 200 });
  } catch (error) {
    console.error("GET Mitra error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data Mitra" }, { status: 500 });
  }
}

// Tambah mitra baru
export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, telepon, alamat, layanan } = body;

    if (!nama) {
      return NextResponse.json({ success: false, error: "Nama Mitra wajib diisi" }, { status: 400 });
    }

    const newMitra = await prisma.mitra.create({
      data: {
        nama,
        telepon,
        alamat,
        layanan,
      },
    });

    return NextResponse.json({ success: true, message: "Mitra berhasil ditambahkan", data: newMitra }, { status: 201 });
  } catch (error) {
    console.error("POST Mitra error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan Mitra" }, { status: 500 });
  }
}

// Update mitra
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, nama, telepon, alamat, layanan } = body;

    if (!id || !nama) {
      return NextResponse.json({ success: false, error: "ID dan Nama Mitra wajib diisi" }, { status: 400 });
    }

    const updatedMitra = await prisma.mitra.update({
      where: { id },
      data: { nama, telepon, alamat, layanan },
    });

    return NextResponse.json({ success: true, message: "Mitra berhasil diperbarui", data: updatedMitra }, { status: 200 });
  } catch (error) {
    console.error("PUT Mitra error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui Mitra" }, { status: 500 });
  }
}

// Hapus mitra
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Mitra wajib disertakan" }, { status: 400 });
    }

    await prisma.mitra.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Mitra berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Mitra error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus Mitra" }, { status: 500 });
  }
}
