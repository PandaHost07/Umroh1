"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Badge, Button, Spinner } from "flowbite-react";
import formatDate from "@/components/Date/formatDate";
import formatCurrency from "@/components/Currency/currency";
import { HiCash, HiTrash, HiX } from "react-icons/hi";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
};

const STATUS_LABEL = {
  MENUNGGU: "Menunggu",
  TERKONFIRMASI: "Terkonfirmasi",
  TIDAK_TERKONFIRMASI: "Dibatalkan",
};

export default function TransaksiPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session.user.email}`);
      const data = await res.json();
      if (res.ok) setList(data);
    } catch {}
    finally { setLoading(false); }
  }, [session?.user?.email]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sudahAdaPembayaranVerifikasi = (item) =>
    item.pembayaran?.some((p) => p.status === "TERVERIFIKASI");

  const handleCancel = async (item) => {
    if (sudahAdaPembayaranVerifikasi(item)) {
      alertError("Tidak bisa dibatalkan karena sudah ada pembayaran yang terverifikasi.");
      return;
    }
    const result = await Swal.fire({
      title: "Batalkan Pesanan?",
      text: `Batalkan pesanan "${item.paket?.nama}"?`,
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
    } catch (err) { alertError(err.message); }
    finally { setCancelling(null); }
  };

  const handleHapus = async (item) => {
    if (sudahAdaPembayaranVerifikasi(item)) {
      alertError("Tidak bisa dihapus karena sudah ada pembayaran yang terverifikasi.");
      return;
    }
    const result = await Swal.fire({
      title: "Hapus Pesanan?",
      text: `Hapus pesanan "${item.paket?.nama}" secara permanen?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Tidak",
    });
    if (!result.isConfirmed) return;
    setDeleting(item.id);
    try {
      // Cancel dulu baru hapus
      if (item.status === "MENUNGGU") {
        await fetch("/api/jamaah/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendaftaranId: item.id }),
        });
      }
      const res = await fetch(`/api/system/delete?model=pendaftaran&id=${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      alertSuccess("Pesanan berhasil dihapus.");
      fetchData();
    } catch (err) { alertError(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">Transaksi</h1>

      {/* Mobile: card view */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Belum ada transaksi.{" "}
            <button onClick={() => router.push("/jamaah")} className="text-blue-600 underline">Pesan paket</button>
          </div>
        ) : list.map((item) => (
          <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-semibold text-sm line-clamp-2">{item.paket?.nama ?? "-"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Berangkat: {item.paket?.tanggalBerangkat ? formatDate(item.paket.tanggalBerangkat, "short") : "-"}</p>
              </div>
              <Badge color={STATUS_COLOR[item.status] ?? "gray"} size="xs" className="ml-2 shrink-0">
                {STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-3">
              <span>{formatDate(item.created, "short")}</span>
              <span className="font-semibold text-gray-700">{item.paket?.harga ? formatCurrency(item.paket.harga) : "-"}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {item.status !== "TIDAK_TERKONFIRMASI" && (
                <Button size="xs" color="blue" onClick={() => router.push("/jamaah/pembayaran")}>
                  <HiCash size={12} className="mr-1" /> Bayar
                </Button>
              )}
              {item.status === "MENUNGGU" && !sudahAdaPembayaranVerifikasi(item) && (
                <Button size="xs" color="warning" disabled={cancelling === item.id} onClick={() => handleCancel(item)}>
                  {cancelling === item.id ? <Spinner size="sm" /> : <><HiX size={12} className="mr-1" />Batal</>}
                </Button>
              )}
              {!sudahAdaPembayaranVerifikasi(item) && (
                <Button size="xs" color="failure" disabled={deleting === item.id} onClick={() => handleHapus(item)}>
                  {deleting === item.id ? <Spinner size="sm" /> : <><HiTrash size={12} className="mr-1" />Hapus</>}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table view */}
      <div className="hidden md:block overflow-x-auto border border-gray-300 rounded">
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
            ) : list.map((item, i) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 border-r border-gray-200 text-center">{i + 1}</td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="font-medium line-clamp-2">{item.paket?.nama ?? "-"}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Berangkat: {item.paket?.tanggalBerangkat ? formatDate(item.paket.tanggalBerangkat, "short") : "-"}</div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">{formatDate(item.created, "short")}</td>
                <td className="px-4 py-3 border-r border-gray-200 font-medium">{item.paket?.harga ? formatCurrency(item.paket.harga) : "-"}</td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <Badge color={STATUS_COLOR[item.status] ?? "gray"} size="sm">{STATUS_LABEL[item.status] ?? item.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {item.status !== "TIDAK_TERKONFIRMASI" && (
                      <Button size="xs" color="blue" onClick={() => router.push("/jamaah/pembayaran")}>
                        <HiCash size={12} className="mr-1" /> Pembayaran
                      </Button>
                    )}
                    {item.status === "MENUNGGU" && !sudahAdaPembayaranVerifikasi(item) && (
                      <Button size="xs" color="warning" disabled={cancelling === item.id} onClick={() => handleCancel(item)}>
                        {cancelling === item.id ? <Spinner size="sm" /> : <><HiX size={12} className="mr-1" />Batalkan</>}
                      </Button>
                    )}
                    {!sudahAdaPembayaranVerifikasi(item) && (
                      <Button size="xs" color="failure" disabled={deleting === item.id} onClick={() => handleHapus(item)}>
                        {deleting === item.id ? <Spinner size="sm" /> : <><HiTrash size={12} className="mr-1" />Hapus</>}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
