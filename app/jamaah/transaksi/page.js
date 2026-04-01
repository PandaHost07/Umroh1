"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Badge, Button, Spinner } from "flowbite-react";
import formatDate from "@/components/Date/formatDate";
import formatCurrency from "@/components/Currency/currency";
import { HiCash } from "react-icons/hi";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
};

export default function TransaksiPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session.user.email}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data");
      setList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = async (item) => {
    const hasVerified = item.pembayaran?.some((p) => p.status === "TERVERIFIKASI");
    if (hasVerified) {
      alertError("Tidak bisa dibatalkan karena sudah ada pembayaran yang terverifikasi.");
      return;
    }

    const result = await Swal.fire({
      title: "Batalkan Pesanan?",
      text: `Batalkan pesanan paket "${item.paket?.nama}"? Tindakan ini tidak bisa dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Tidak",
    });
    if (!result.isConfirmed) return;

    setCancelling(item.id);
    try {
      const res = await fetch("/api/jamaah/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan");
      alertSuccess("Pesanan berhasil dibatalkan.");
      fetchData();
    } catch (err) {
      alertError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  const canCancel = (item) =>
    item.status === "MENUNGGU" &&
    !item.pembayaran?.some((p) => p.status === "TERVERIFIKASI");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">Transaksi</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      )}

      <div className="overflow-x-auto border border-gray-300 rounded">
        <table className="w-full text-sm text-left">
          <thead className="bg-white border-b border-gray-300">
            <tr>
              {["No", "Paket", "Tgl Pesanan", "Harga", "Status", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10"><Spinner size="md" /></td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  Belum ada transaksi.{" "}
                  <button onClick={() => router.push("/jamaah")} className="text-blue-600 underline">Pesan paket sekarang</button>
                </td>
              </tr>
            ) : (
              list.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200 text-center">{i + 1}</td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium line-clamp-2">{item.paket?.nama ?? "-"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Berangkat: {item.paket?.tanggalBerangkat ? formatDate(item.paket.tanggalBerangkat, "short") : "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">{formatDate(item.created, "short")}</td>
                  <td className="px-4 py-3 border-r border-gray-200 font-medium">
                    {item.paket?.harga ? formatCurrency(item.paket.harga) : "-"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <Badge color={STATUS_COLOR[item.status] ?? "gray"} size="sm">{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {/* Tombol Bayar — langsung ke halaman pembayaran */}
                      {item.status !== "TIDAK_TERKONFIRMASI" && (
                        <Button size="xs" color="blue" onClick={() => router.push("/jamaah/pembayaran")}>
                          <HiCash size={12} className="mr-1" /> Pembayaran
                        </Button>
                      )}
                      {canCancel(item) && (
                        <Button size="xs" color="failure" disabled={cancelling === item.id}
                          onClick={() => handleCancel(item)}>
                          {cancelling === item.id ? <Spinner size="sm" /> : "Batalkan"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
