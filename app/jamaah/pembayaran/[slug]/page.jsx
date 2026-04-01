"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

// Redirect ke halaman pembayaran utama jamaah
export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace("/jamaah/pembayaran"); }, [router]);
  return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;
}
