"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Badge, Spinner, Button } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiOutlineClipboardList, HiCheck } from "react-icons/hi";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
};

export default function DaftarTransaksiPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [confirming, setConfirming] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/system/order");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleKonfirmasi = async (order) => {
    const result = await Swal.fire({
      title: "Konfirmasi Transaksi?",
      text: `Konfirmasi pendaftaran ${order.akun?.nama || order.akunEmail} untuk paket ${order.paket?.nama}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Konfirmasi",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    setConfirming(order.id);
    try {
      const res = await fetch("/api/system/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: "TERKONFIRMASI" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal konfirmasi");
      alertSuccess("Transaksi berhasil dikonfirmasi!");
      fetchOrders();
    } catch (err) {
      alertError(err.message);
    } finally {
      setConfirming(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o.akun?.nama?.toLowerCase().includes(search.toLowerCase()) ||
      o.akunEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.paket?.nama?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HiOutlineClipboardList className="text-blue-600" size={22} />
          Daftar Transaksi
        </h2>
        <span className="text-sm text-gray-500">{filtered.length} transaksi</span>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama jamaah atau paket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          {[["ALL", "Semua"], ["MENUNGGU", "Menunggu"], ["TERKONFIRMASI", "Terkonfirmasi"], ["TIDAK_TERKONFIRMASI", "Dibatalkan"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label} ({val === "ALL" ? orders.length : orders.filter(o => o.status === val).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Tidak ada transaksi.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["No", "Jamaah", "Paket", "Tgl Pesan", "Keberangkatan", "Harga", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{o.akun?.nama || "-"}</div>
                    <div className="text-xs text-gray-400">{o.akunEmail}</div>
                  </td>
                  <td className="px-4 py-2 max-w-[160px]">
                    <span className="line-clamp-2">{o.paket?.nama || "-"}</span>
                  </td>
                  <td className="px-4 py-2">{formatDate(o.created, "short")}</td>
                  <td className="px-4 py-2">{o.paket?.tanggalBerangkat ? formatDate(o.paket.tanggalBerangkat, "short") : "-"}</td>
                  <td className="px-4 py-2 font-medium">{o.paket?.harga ? formatCurrency(o.paket.harga) : "-"}</td>
                  <td className="px-4 py-2">
                    <Badge color={STATUS_COLOR[o.status] ?? "gray"} size="sm">{o.status}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1 flex-wrap">
                      <Button size="xs" color="blue" onClick={() => router.push(`/ADMIN_KEUANGAN/pembayaran/${o.id}`)}>
                        Pembayaran
                      </Button>
                      {o.status === "MENUNGGU" && (
                        <Button size="xs" color="success" disabled={confirming === o.id}
                          onClick={() => handleKonfirmasi(o)}>
                          {confirming === o.id ? <Spinner size="sm" /> : <><HiCheck className="mr-1" />Konfirmasi</>}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminContainer>
  );
}
