"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Badge, Spinner, Button } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiOutlineClipboardList } from "react-icons/hi";

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
};

export default function DaftarTransaksiPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/system/order");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) =>
    !search ||
    o.akun?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    o.akunEmail?.toLowerCase().includes(search.toLowerCase()) ||
    o.paket?.nama?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HiOutlineClipboardList className="text-blue-600" size={22} />
          Daftar Transaksi
        </h2>
        <span className="text-sm text-gray-500">{filtered.length} transaksi</span>
      </div>

      <input
        type="text"
        placeholder="Cari nama jamaah atau paket..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm mb-4 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

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
                    <Button size="xs" color="blue" onClick={() => router.push(`/ADMIN_KEUANGAN/pembayaran/${o.id}`)}>
                      Detail
                    </Button>
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
