"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import LineChart from "@/components/Chart/lineChart";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function LaporanArusKasPage() {
  const [data, setData] = useState(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setData(null);
      try {
        const res = await fetch("/api/system/pembayaran");
        const list = await res.json();
        if (!Array.isArray(list)) return;

        const filtered = list.filter((p) =>
          p.status === "TERVERIFIKASI" && new Date(p.created).getFullYear() === tahun
        );

        const monthly = Array(12).fill(0);
        const monthlyCount = Array(12).fill(0);
        filtered.forEach((p) => {
          const m = new Date(p.created).getMonth();
          monthly[m] += p.jumlah;
          monthlyCount[m]++;
        });

        const total = filtered.reduce((s, p) => s + p.jumlah, 0);
        const bulanTertinggi = monthly.indexOf(Math.max(...monthly));

        setData({ monthly, monthlyCount, total, bulanTertinggi });
      } catch {}
    };
    fetchData();
  }, [tahun]);

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Laporan Arus Kas</h2>
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
          {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!data ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-600 font-medium">Total Kas Masuk {tahun}</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(data.total)}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-600 font-medium">Bulan Tertinggi</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">{data.total > 0 ? BULAN[data.bulanTertinggi] : "-"}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-600 font-medium">Rata-rata per Bulan</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(Math.round(data.total / 12))}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-4 text-gray-700">Grafik Arus Kas Bulanan (dalam juta Rp)</h3>
            <LineChart data={data.monthly.map((v) => Math.round(v / 1_000_000))} />
          </div>

          {/* Tabel per bulan */}
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>{["Bulan", "Jumlah Transaksi", "Total Kas Masuk"].map(h => (
                  <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {BULAN.map((b, i) => (
                  <tr key={b} className={`border-b hover:bg-gray-50 ${i === data.bulanTertinggi && data.total > 0 ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-2 font-medium">{b} {tahun}</td>
                    <td className="px-4 py-2">{data.monthlyCount[i]} transaksi</td>
                    <td className="px-4 py-2 font-semibold">{formatCurrency(data.monthly[i])}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2">{data.monthlyCount.reduce((a, b) => a + b, 0)} transaksi</td>
                  <td className="px-4 py-2">{formatCurrency(data.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminContainer>
  );
}
