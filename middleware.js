import { NextResponse } from "next/server";
import withAuth from "./middlewares/withAuth";

export async function mainMiddleware(req) {
  const res = NextResponse.next();
  return res;
}

export default withAuth(mainMiddleware, ["/ADMIN_OPERASIONAL", "/ADMIN_KEUANGAN", "/jamaah"]);
