"use server"
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const secret = process.env.NEXTAUTH_SECRET;

export default function withAuth(middleware, requireAuth = []) {
  const startsWithAnyPrefix = (link, array) => {
    for (let prefix of array) {
      if (link.startsWith(prefix)) return true;
    }
    return false;
  };

  return async (req, next) => {
    const pathname = req.nextUrl.pathname;

    // Ambil token dari request
    const token = await getToken({ req, secret });

    let userRole = null;

    if (token?.sessionToken) {
      // Ambil session dari database
      const sessionDb = await prisma.session.findUnique({
        where: { sessionToken: token.sessionToken },
        include: { user: true }, // ambil data user (Akun)
      });
      
      // Ambil role user dari database
      userRole = sessionDb?.user?.role;
    }

    // Jika halaman login
    if (pathname === "/login") {
      if (userRole) {
        return NextResponse.redirect(new URL(`/${userRole}`, req.url));
      }
      return NextResponse.next();
    }

    // Jika halaman butuh autentikasi
    if (startsWithAnyPrefix(pathname, requireAuth)) {
      if (!userRole) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (!pathname.startsWith(`/${userRole}`)) {
        return NextResponse.redirect(new URL(`/${userRole}`, req.url));
      }
    }

    return middleware(req, next);
  };
}