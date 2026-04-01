import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Ambil role user dari request.
 * @param {Request} req
 * @returns {Promise<string|null>} role atau null jika tidak terautentikasi
 */
export async function getRoleFromRequest(req) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.sessionToken) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token.sessionToken },
      include: { user: { select: { role: true } } },
    });

    return session?.user?.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Guard: kembalikan Response 403 jika role tidak diizinkan.
 * @param {Request} req
 * @param {string[]} allowedRoles
 * @returns {Promise<Response|null>} null jika diizinkan, Response 403 jika tidak
 */
export async function requireRole(req, allowedRoles) {
  const role = await getRoleFromRequest(req);
  if (!role) {
    return new Response(JSON.stringify({ error: "Tidak terautentikasi" }), { status: 401 });
  }
  if (!allowedRoles.includes(role)) {
    return new Response(JSON.stringify({ error: "Akses ditolak" }), { status: 403 });
  }
  return null;
}
