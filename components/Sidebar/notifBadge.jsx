"use client";
import { useEffect, useState } from "react";

/**
 * Badge notifikasi untuk sidebar.
 * Fetch jumlah pembayaran MENUNGGU yang sudah ada bukti (perlu verifikasi).
 * Hanya tampil untuk role ADMIN_KEUANGAN.
 */
export default function NotifBadgePembayaran() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/system/pembayaran");
        const data = await res.json();
        if (Array.isArray(data)) {
          const pending = data.filter((p) => p.status === "MENUNGGU" && p.buktiUrl).length;
          setCount(pending);
        }
      } catch {}
    };
    fetchCount();
    // Refresh setiap 30 detik
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
      {count > 99 ? "99+" : count}
    </span>
  );
}
