import prisma from "@/lib/prisma";

const model = "pengumuman";

export async function GET(req) {
  try {
    const dataList = await prisma.pengumuman.findMany({
      orderBy: { tanggalMulai: "desc" }
    });
    return new Response(JSON.stringify(dataList), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, content, startDate, endDate, isActive, pendaftaranId, createdById } = body;

    const newData = await prisma.pengumuman.create({
      data: {
        judul: title,
        isi: content,
        tanggalMulai: new Date(startDate),
        tanggalSelesai: endDate ? new Date(endDate) : null,
        aktif: isActive !== undefined ? isActive : true,
        dibuatOlehId: createdById || "admin",
        pendaftaranId: (pendaftaranId && pendaftaranId !== "global") ? pendaftaranId : null,
      },
    });

    return new Response(JSON.stringify(newData), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan buat pengumuman" }), { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Field 'id' wajib disertakan" }),
        { status: 400 }
      );
    }

    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const existing = await prisma[model].findUnique({ where: { id } });

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Pengumuman tidak ditemukan" }),
        { status: 404 }
      );
    }

    const updated = await prisma[model].update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("PATCH announcement error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat memperbarui pengumuman" }),
      { status: 500 }
    );
  }
}
