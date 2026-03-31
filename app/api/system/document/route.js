import prisma from "@/lib/prisma";
import { uploadFileToVercel } from "@/lib/uploadFile";

// GET: dapatkan semua registrasi dalam paket tertentu + user + dokumen
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const paketId = searchParams.get("paket");

    if (!paketId) {
      return new Response(
        JSON.stringify({ error: "Parameter 'paket' wajib disediakan" }),
        { status: 400 }
      );
    }

    // Ambil semua registration dengan paket tersebut, termasuk user dan dokumennya
    const registrations = await prisma.registration.findMany({
      where: { paketId },
      include: {
        user: true,
        documents: true,
      },
    });

    return new Response(JSON.stringify(registrations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET document/registrations error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data" }),
      { status: 500 }
    );
  }
}

// POST: Upload dokumen berdasarkan registrationId
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
    const { registrationId, type } = body;

    if (!registrationId || !type) {
      return new Response(
        JSON.stringify({ error: "Field 'registrationId' dan 'type' wajib diisi" }),
        { status: 400 }
      );
    }

    const allowedTypes = ["PASPOR", "KTP", "FOTO", "VAKSIN", "VISA"];
    if (!allowedTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Tipe dokumen tidak valid: ${type}` }),
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || file.size === 0) {
      return new Response(
        JSON.stringify({ error: "File dokumen wajib diunggah" }),
        { status: 400 }
      );
    }

    const fileUrl = await uploadFileToVercel(file, "document");

    // Cek apakah dokumen untuk tipe tersebut sudah ada
    const existing = await prisma.document.findFirst({
      where: {
        registrationId,
        type,
      },
    });

    let result;

    if (existing) {
      result = await prisma.document.update({
        where: { id: existing.id },
        data: {
          url: fileUrl,
          status: "PENDING",
        },
      });
    } else {
      result = await prisma.document.create({
        data: {
          registrationId,
          type,
          url: fileUrl,
        },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST document error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat upload dokumen" }),
      { status: 500 }
    );
  }
}

// PATCH: Update status dokumen (APPROVED, REJECTED, PENDING)
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "Field 'id' dan 'status' wajib disertakan" }),
        { status: 400 }
      );
    }

    const allowedStatus = ["PENDING", "APPROVED", "REJECTED"];
    if (!allowedStatus.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Status dokumen tidak valid: ${status}` }),
        { status: 400 }
      );
    }

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Dokumen tidak ditemukan" }),
        { status: 404 }
      );
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { status },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PATCH document error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengupdate dokumen" }),
      { status: 500 }
    );
  }
}
