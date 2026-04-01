import prisma from "@/lib/prisma";
import { uploadFileToVercel } from "@/lib/uploadFile";
import { hitungKuotaTersedia, buildKuotaResponse } from "@/lib/kuota";
import { requireRole } from "@/lib/authGuard";

export const dynamic = 'force-dynamic';

// =======================================
// GET - Ambil semua paket atau by ID
// =======================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const paketId = searchParams.get("id");

    const includeOptions = {
      hotel: true,
      penerbangan: true,
      pendaftaran: {
        where: { status: { in: ["MENUNGGU", "TERKONFIRMASI"] } },
        select: { id: true, status: true },
      },
    };

    if (paketId) {
      const paket = await prisma.paket.findUnique({
        where: { id: paketId },
        include: includeOptions,
      });

      if (!paket) {
        return new Response(
          JSON.stringify({ error: "Paket tidak ditemukan" }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(paket), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pakets = await prisma.paket.findMany({
      orderBy: { created: "desc" },
      include: includeOptions,
    });

    return new Response(JSON.stringify(pakets), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET paket error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data paket" }),
      { status: 500 }
    );
  }
}

// =======================================
// POST - Tambah Paket Umrah Baru — hanya ADMIN_OPERASIONAL
// =======================================
export async function POST(req) {
  const guard = await requireRole(req, ["ADMIN_OPERASIONAL"]);
  if (guard) return guard;

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

    const requiredFields = [
      "nama",
      "deskripsi",
      "tanggalBerangkat",
      "tanggalPulang",
      "harga",
      "kuota",
      "hotelId",
      "penerbanganId",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Field '${field}' wajib diisi` }),
          { status: 400 }
        );
      }
    }

    const file = formData.get("file");
    if (file && file.size > 0 && typeof file !== "string") {
      try {
        const fileUrl = await uploadFileToVercel(file, "paket");
        body.gambar = fileUrl;
      } catch (uploadErr) {
        throw new Error("Gagal mengupload gambar. Konfigurasi Vercel Blob token mungkin belum diatur.");
      }
    }

    const newPaket = await prisma.paket.create({
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        tanggalBerangkat: new Date(body.tanggalBerangkat),
        tanggalPulang: new Date(body.tanggalPulang),
        harga: parseInt(body.harga) > 2000000000 ? 2000000000 : parseInt(body.harga),
        kuota: parseInt(body.kuota) > 10000 ? 10000 : parseInt(body.kuota),
        gambar: body.gambar || "",
        hotelId: body.hotelId,
        penerbanganId: body.penerbanganId,
        status: body.status || "AKTIF",
      },
    });

    return new Response(JSON.stringify(newPaket), { status: 201 });
  } catch (error) {
    console.error("POST paket error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Gagal membuat paket" }),
      { status: 500 }
    );
  }
}

// =======================================
// PATCH - Update Paket — hanya ADMIN_OPERASIONAL
// =======================================
export async function PATCH(req) {
  const guard = await requireRole(req, ["ADMIN_OPERASIONAL"]);
  if (guard) return guard;

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

    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "ID paket wajib disertakan" }),
        { status: 400 }
      );
    }

    const existingPaket = await prisma.paket.findUnique({
      where: { id: body.id },
    });

    if (!existingPaket) {
      return new Response(
        JSON.stringify({ error: "Paket tidak ditemukan" }),
        { status: 404 }
      );
    }

    const file = formData.get("file");
    if (file && file.size > 0 && typeof file !== "string") {
      try {
        const fileUrl = await uploadFileToVercel(file, "paket");
        body.gambar = fileUrl;
      } catch (uploadErr) {
        throw new Error("Gagal mengupload gambar. Konfigurasi Vercel Blob token mungkin belum diatur.");
      }
    }

    const { id, ...dataToUpdate } = body;

    if (dataToUpdate.tanggalBerangkat)
      dataToUpdate.tanggalBerangkat = new Date(dataToUpdate.tanggalBerangkat);
    if (dataToUpdate.tanggalPulang)
      dataToUpdate.tanggalPulang = new Date(dataToUpdate.tanggalPulang);
    if (dataToUpdate.harga) {
      dataToUpdate.harga = parseInt(dataToUpdate.harga);
      if (dataToUpdate.harga > 2000000000) throw new Error("Harga tidak boleh melebihi batas 2 Miliar.");
    }
    if (dataToUpdate.kuota) {
      dataToUpdate.kuota = parseInt(dataToUpdate.kuota);
      if (isNaN(dataToUpdate.kuota) || dataToUpdate.kuota <= 0)
        throw new Error("Kuota harus bilangan bulat positif.");
      if (dataToUpdate.kuota > 10000)
        throw new Error("Kuota tidak valid atau terlalu besar.");

      // Validasi: kuota baru tidak boleh < pendaftaran aktif
      const pendaftaranAktif = await hitungKuotaTersedia(prisma, id);
      if (dataToUpdate.kuota < pendaftaranAktif) {
        return new Response(
          JSON.stringify({
            error: `Kuota baru tidak boleh lebih kecil dari jumlah pendaftaran aktif (${pendaftaranAktif} pendaftaran)`,
          }),
          { status: 400 }
        );
      }
    }

    const updatedPaket = await prisma.paket.update({
      where: { id },
      data: dataToUpdate,
    });

    const used = await hitungKuotaTersedia(prisma, id);
    const kuotaInfo = buildKuotaResponse(updatedPaket, used);

    return new Response(JSON.stringify({ ...updatedPaket, ...kuotaInfo }), { status: 200 });
  } catch (error) {
    console.error("PATCH paket error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan saat update paket" }),
      { status: 500 }
    );
  }
}
