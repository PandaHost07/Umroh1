import prisma from "@/lib/prisma";


export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const model = searchParams.get("model");

    if (!model || !prisma[model]) {
      return new Response(JSON.stringify({ error: "Model tidak ditemukan" }), {
        status: 400,
      });
    }

    const id = searchParams.get("id");
    if (!id)
      return new Response(JSON.stringify({ error: "ID diperlukan" }), {
        status: 400,
      });

    await prisma[model].delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan" }), {
      status: 500,
    });
  }
}