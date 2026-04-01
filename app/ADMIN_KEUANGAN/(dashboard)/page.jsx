"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Card } from "flowbite-react";
import { FaMoneyBillWave, FaCheckCircle, FaUsers } from "react-icons/fa";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import LineChart from "@/components/Chart/lineChart";
import { useEffect, useState } from "react";
import formatCurrency from "@/components/Currency/currency";

export default function AdminKeuanganDashboard() {
  const [stats, setStats] = useState({
    totalTransaksi: 0,
    transaksiMenunggu: 0,
    pembayaranMenunggu: 0,
    totalPendapatan: 0,
  });
  const [chartData, setChartData] = useState(Array(12).fill(0));
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch semua pembayaran (sudah include pendaftaran)
        const [resPembayaran, resOrder] = await Promise.all([
          fetch("/api/system/pembayaran"),
          fetch("/api/system/order"),
        ]);

        const pembayaranList = await resPembayaran.json();
        const orders = await resOrder.json();

        if (Array.isArray(pembayaranList)) {
          // Pembayaran menunggu verifikasi (sudah ada bukti)
          const pembayaranMenunggu = pembayaranList.filter(
            (p) => p.status === "MENUNGGU" && p.buktiUrl
          ).length;

          // Total pendapatan terverifikasi
          const totalPendapatan = pembayaranList
            .filter((p) => p.status === "TERVERIFIKASI")
            .reduce((sum, p) => sum + p.jumlah, 0);

          // Chart per bulan
          const monthly = Array(12).fill(0);
          pembayaranList.forEach((p) => {
            if (p.status === "TERVERIFIKASI") {
              const bulan = new Date(p.created).getMonth();
              monthly[bulan] += p.jumlah / 1_000_000;
            }
          });

          setChartData(monthly);
          setStats((prev) => ({ ...prev, pembayaranMenunggu, totalPendapatan }));
        }

        if (Array.isArray(orders)) {
          const transaksiMenunggu = orders.filter((o) => o.status === "MENUNGGU").length;
          setStats((prev) => ({
            ...prev,
            totalTransaksi: orders.length,
            transaksiMenunggu,
          }));
          setRecentOrders(orders.slice(0, 5));
        }
      } catch {}
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold">Dashboard Keuangan</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card href="/ADMIN_KEUANGAN/daftar-transaksi">
          <div className="mb-2 text-sm text-gray-500 font-medium">Total Transaksi</div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-2xl">{stats.totalTransaksi}</div>
            <MdOutlineFlipCameraAndroid className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card href="/ADMIN_KEUANGAN/daftar-transaksi">
          <div className="mb-2 text-sm text-gray-500 font-medium">Transaksi Baru</div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-2xl text-yellow-600">{stats.transaksiMenunggu}</div>
            <FaUsers className="text-yellow-500" size={32} />
          </div>
        </Card>

        <Card href="/ADMIN_KEUANGAN/pembayaran">
          <div className="mb-2 text-sm text-gray-500 font-medium">Pembayaran Perlu Verifikasi</div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-2xl text-orange-600">{stats.pembayaranMenunggu}</div>
            <FaMoneyBillWave className="text-orange-500" size={32} />
          </div>
        </Card>

        <Card href="/ADMIN_KEUANGAN/laporan-keuangan">
          <div className="mb-2 text-sm text-gray-500 font-medium">Total Pendapatan</div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-lg text-green-600">{formatCurrency(stats.totalPendapatan)}</div>
            <FaCheckCircle className="text-green-500" size={32} />
          </div>
        </Card>
      </div>

      {/* Chart */}
      <AdminContainer>
        <h3 className="text-lg font-bold mb-1">Arus Kas Bulanan</h3>
        <p className="text-sm text-gray-500 mb-4">Pembayaran terverifikasi per bulan (juta Rp)</p>
        <LineChart data={chartData} />
      </AdminContainer>

      {/* Transaksi Terbaru */}
      <AdminContainer>
        <h3 className="text-lg font-bold mb-4">Transaksi Terbaru</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Jamaah", "Paket", "Tgl Pesan", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{o.akun?.nama || o.akunEmail}</td>
                    <td className="px-4 py-2 max-w-[160px]">
                      <span className="line-clamp-1">{o.paket?.nama || "-"}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {new Date(o.created).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.status === "TERKONFIRMASI" ? "bg-green-100 text-green-700" :
                        o.status === "MENUNGGU" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminContainer>
    </div>
  );
}
