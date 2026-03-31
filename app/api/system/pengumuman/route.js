import prisma from "@/lib/prisma";

const model = "announcement";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const isActive = searchParams.get("isActive");

    if (id) {
      const data = await prisma[model].findUnique({
        where: { id },
        include: { createdBy: true },
      });

      if (!data) {
        return new Response(JSON.stringify({ error: "Announcement tidak ditemukan" }), { status: 404 });
      }

      return new Response(JSON.stringify(data), { status: 200 });
    }

    // Filter aktif jika diberikan
    const whereClause = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    const dataList = await prisma[model].findMany({
      where: whereClause,
      orderBy: { startDate: "desc" },
      include: { createdBy: true },
    });

    return new Response(JSON.stringify(dataList), { status: 200 });
  } catch (error) {
    console.error("GET announcement error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat mengambil data pengumuman" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, content, startDate, endDate, isActive, createdById } = body;

    if (!title || !content || !startDate || !createdById) {
      return new Response(
        JSON.stringify({ error: "Field 'title', 'content', 'startDate' dan 'createdById' wajib diisi" }),
        { status: 400 }
      );
    }

    const newData = await prisma[model].create({
      data: {
        title,
        content,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        createdById,
      },
    });

    return new Response(JSON.stringify(newData), { status: 201 });
  } catch (error) {
    console.error("POST announcement error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat membuat pengumuman" }),
      { status: 500 }
    );
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
