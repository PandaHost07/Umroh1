"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Card } from "flowbite-react";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import LineChart from "@/components/Chart/lineChart";
import { useEffect, useState } from "react";

export default function AdminKeuanganDashboard() {
  const [stats, setStats] = useState({ transaksi: 0, menungguVerifikasi: 0 });
  const [chartData, setChartData] = useState(Array(12).fill(0));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/system/order");
        const orders = await res.json();
        if (!Array.isArray(orders)) return;

        const menunggu = orders.filter((o) =>
          o.pembayaran?.some((p) => p.status === "MENUNGGU" && p.buktiUrl)
        ).length;

        // Hitung total pembayaran per bulan
        const monthly = Array(12).fill(0);
        orders.forEach((o) => {
          o.pembayaran?.forEach((p) => {
            if (p.status === "TERVERIFIKASI") {
              const bulan = new Date(p.created).getMonth();
              monthly[bulan] += p.jumlah / 1_000_000; // dalam juta
            }
          });
        });

        setStats({ transaksi: orders.length, menungguVerifikasi: menunggu });
        setChartData(monthly);
      } catch {}
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold">Dashboard Keuangan</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card href="/ADMIN_KEUANGAN/daftar-transaksi">
          <div className="mb-3 font-medium text-sm text-gray-500">Total Transaksi</div>
          <div className="flex w-full justify-between items-center px-2">
            <div className="font-semibold text-2xl">{stats.transaksi}</div>
            <MdOutlineFlipCameraAndroid className="text-blue-500" size={35} />
          </div>
        </Card>

        <Card href="/ADMIN_KEUANGAN/pembayaran">
          <div className="mb-3 font-medium text-sm text-gray-500">Menunggu Verifikasi</div>
          <div className="flex w-full justify-between items-center px-2">
            <div className="font-semibold text-2xl">{stats.menungguVerifikasi}</div>
            <FaMoneyBillWave className="text-green-500" size={35} />
          </div>
        </Card>
      </div>

      <AdminContainer>
        <div className="py-4">
          <h3 className="text-xl font-bold mb-1">Laporan Arus Kas Bulanan</h3>
          <p className="text-sm text-gray-500 mb-4">Total pembayaran terverifikasi per bulan (dalam juta Rp)</p>
          <LineChart data={chartData} />
        </div>
      </AdminContainer>
    </div>
  );
}
