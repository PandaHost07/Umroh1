import prisma from "@/lib/prisma";
import { uploadFileToVercel } from "@/lib/uploadFile";
import { requireRole } from "@/lib/authGuard";

// ==========================
// GET Pembayaran
// ==========================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pendaftaranId = searchParams.get("pendaftaranId");

    const includeOptions = {
      pendaftaran: {
        include: {
          akun: true,
          paket: true,
        },
      },
    };

    if (id) {
      const pembayaran = await prisma.pembayaran.findUnique({
        where: { id },
        include: includeOptions,
      });

      if (!pembayaran) {
        return new Response(
          JSON.stringify({ error: "Pembayaran tidak ditemukan" }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(pembayaran), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Jika ada filter berdasarkan ID pendaftaran
    const filter = pendaftaranId ? { pendaftaranId } : {};

    const all = await prisma.pembayaran.findMany({
      where: filter,
      orderBy: { created: "desc" },
      include: includeOptions,
    });

    return new Response(JSON.stringify(all), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET pembayaran error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data pembayaran" }),
      { status: 500 }
    );
  }
}

// ==========================
// POST Pembayaran
// ==========================
export async function POST(req) {
  try {
    const formData = await req.formData();
    const formString = formData.get("form");

    if (!formString) {
      return new Response(
        JSON.stringify({ error: "Data form tidak ditemukan" }),
        { status: 400 }
      );
    }

    const body = JSON.parse(formString);
    const { pendaftaranId, jumlah } = body;

    if (!pendaftaranId || jumlah == null) {
      return new Response(
        JSON.stringify({ error: "'pendaftaranId' dan 'jumlah' wajib diisi" }),
        { status: 400 }
      );
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
    });

    if (!pendaftaran) {
      return new Response(
        JSON.stringify({ error: "Pendaftaran tidak ditemukan" }),
        { status: 404 }
      );
    }

    // Upload file jika ada
    const file = formData.get("file");
    let proofUrl = null;

    if (file && file.size > 0) {
      proofUrl = await uploadFileToVercel(file, "pembayaran");
    }

    const newPembayaran = await prisma.pembayaran.create({
      data: {
        pendaftaranId,
        jumlah,
        status: "MENUNGGU", // default
        buktiUrl: proofUrl,
      },
    });

    return new Response(JSON.stringify(newPembayaran), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST pembayaran error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat membuat pembayaran" }),
      { status: 500 }
    );
  }
}

// ==========================
// PATCH Pembayaran — hanya ADMIN_KEUANGAN
// ==========================
export async function PATCH(req) {
  const guard = await requireRole(req, ["ADMIN_KEUANGAN"]);
  if (guard) return guard;

  try {
    const body = await req.json();
    const { id, jumlah, status, buktiUrl } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "'id' pembayaran wajib disertakan" }),
        { status: 400 }
      );
    }

    const pembayaran = await prisma.pembayaran.findUnique({ where: { id } });

    if (!pembayaran) {
      return new Response(
        JSON.stringify({ error: "Pembayaran tidak ditemukan" }),
        { status: 404 }
      );
    }

    const updateData = {};

    if (jumlah != null) updateData.jumlah = jumlah;
    if (status != null) {
      const allowedStatus = ["MENUNGGU", "TERVERIFIKASI", "DITOLAK"];
      if (!allowedStatus.includes(status)) {
        return new Response(
          JSON.stringify({ error: `Status '${status}' tidak valid` }),
          { status: 400 }
        );
      }
      updateData.status = status;
    }
    if (buktiUrl != null) updateData.buktiUrl = buktiUrl;

    const updated = await prisma.pembayaran.update({
      where: { id },
      data: updateData,
    });

    // Jika status diubah ke TERVERIFIKASI, cek apakah semua pembayaran sudah lunas
    if (status === "TERVERIFIKASI") {
      const semuaPembayaran = await prisma.pembayaran.findMany({
        where: { pendaftaranId: pembayaran.pendaftaranId },
      });
      const semuaLunas = semuaPembayaran.every((p) =>
        p.id === id ? true : p.status === "TERVERIFIKASI"
      );
      if (semuaLunas) {
        await prisma.pendaftaran.update({
          where: { id: pembayaran.pendaftaranId },
          data: { status: "TERKONFIRMASI" },
        });
      } else {
        // Minimal ada 1 terverifikasi → set MENUNGGU (bukan TIDAK_TERKONFIRMASI)
        await prisma.pendaftaran.update({
          where: { id: pembayaran.pendaftaranId },
          data: { status: "MENUNGGU" },
        });
      }
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PATCH pembayaran error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengupdate pembayaran" }),
      { status: 500 }
    );
  }
}
