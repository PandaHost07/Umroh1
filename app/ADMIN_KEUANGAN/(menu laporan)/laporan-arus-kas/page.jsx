"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BULAN_FULL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function LaporanArusKasPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await fetch("/api/system/pembayaran");
        const list = await res.json();
        if (!Array.isArray(list)) return;

        const filtered = list.filter(
          (p) => p.status === "TERVERIFIKASI" && new Date(p.created).getFullYear() === tahun
        );

        const monthly = Array(12).fill(0);
        const monthlyCount = Array(12).fill(0);
        const byJenis = { DP: Array(12).fill(0), CICILAN_1: Array(12).fill(0), PELUNASAN: Array(12).fill(0) };

        filtered.forEach((p) => {
          const m = new Date(p.created).getMonth();
          monthly[m] += p.jumlah;
          monthlyCount[m]++;
          if (p.jenis && byJenis[p.jenis]) byJenis[p.jenis][m] += p.jumlah;
        });

        const total = filtered.reduce((s, p) => s + p.jumlah, 0);
        const maxVal = Math.max(...monthly);
        const bulanTertinggi = maxVal > 0 ? monthly.indexOf(maxVal) : -1;
        const bulanAktif = monthly.filter((v) => v > 0).length;

        setData({ monthly, monthlyCount, byJenis, total, bulanTertinggi, bulanAktif });
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, [tahun]);

  const chartData = data ? {
    labels: BULAN_FULL,
    datasets: [
      {
        label: "DP",
        data: data.byJenis.DP.map((v) => Math.round(v / 1000)),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Cicilan",
        data: data.byJenis.CICILAN_1.map((v) => Math.round(v / 1000)),
        backgroundColor: "rgba(139, 92, 246, 0.7)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Pelunasan",
        data: data.byJenis.PELUNASAN.map((v) => Math.round(v / 1000)),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: Rp ${ctx.parsed.y.toLocaleString("id-ID")} ribu`,
        },
      },
    },
    scales: {
      x: { stacked: false, grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `Rp ${v}rb` },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <AdminContainer>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold">Laporan Arus Kas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Rekap pembayaran terverifikasi per bulan</p>
        </div>
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : !data ? (
        <p className="text-center text-gray-400 py-10">Gagal memuat data.</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-xs text-blue-100 font-medium">Total Kas Masuk</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(data.total)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-xs text-purple-100 font-medium">Bulan Terbaik</p>
              <p className="text-xl font-bold mt-1">{data.bulanTertinggi >= 0 ? BULAN[data.bulanTertinggi] : "-"}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-xs text-green-100 font-medium">Rata-rata/Bulan</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(data.bulanAktif > 0 ? Math.round(data.total / data.bulanAktif) : 0)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-xs text-orange-100 font-medium">Total Transaksi</p>
              <p className="text-xl font-bold mt-1">{data.monthlyCount.reduce((a, b) => a + b, 0)}</p>
            </div>
          </div>

          {/* Grafik Bar */}
          <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Grafik Arus Kas per Bulan {tahun}</h3>
              <span className="text-xs text-gray-400">dalam ribuan Rp</span>
            </div>
            {data.total === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Belum ada data untuk tahun {tahun}</p>
                </div>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          {/* Tabel per bulan */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700 text-sm">Rincian per Bulan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Bulan", "Transaksi", "DP", "Cicilan", "Pelunasan", "Total"].map(h => (
                      <th key={h} className="px-4 py-2.5 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BULAN.map((b, i) => {
                    const isHighlight = i === data.bulanTertinggi && data.total > 0;
                    const hasData = data.monthly[i] > 0;
                    return (
                      <tr key={b} className={`border-b transition-colors ${isHighlight ? "bg-blue-50" : hasData ? "hover:bg-gray-50" : "opacity-50"}`}>
                        <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                          {isHighlight && <span className="text-yellow-500 text-xs">★</span>}
                          {b} {tahun}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{data.monthlyCount[i]}</td>
                        <td className="px-4 py-2.5 text-blue-600">{data.byJenis.DP[i] > 0 ? formatCurrency(data.byJenis.DP[i]) : "-"}</td>
                        <td className="px-4 py-2.5 text-purple-600">{data.byJenis.CICILAN_1[i] > 0 ? formatCurrency(data.byJenis.CICILAN_1[i]) : "-"}</td>
                        <td className="px-4 py-2.5 text-green-600">{data.byJenis.PELUNASAN[i] > 0 ? formatCurrency(data.byJenis.PELUNASAN[i]) : "-"}</td>
                        <td className="px-4 py-2.5 font-semibold">{data.monthly[i] > 0 ? formatCurrency(data.monthly[i]) : "-"}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-100 font-bold border-t-2">
                    <td className="px-4 py-3">TOTAL {tahun}</td>
                    <td className="px-4 py-3">{data.monthlyCount.reduce((a, b) => a + b, 0)}</td>
                    <td className="px-4 py-3 text-blue-700">{formatCurrency(data.byJenis.DP.reduce((a, b) => a + b, 0))}</td>
                    <td className="px-4 py-3 text-purple-700">{formatCurrency(data.byJenis.CICILAN_1.reduce((a, b) => a + b, 0))}</td>
                    <td className="px-4 py-3 text-green-700">{formatCurrency(data.byJenis.PELUNASAN.reduce((a, b) => a + b, 0))}</td>
                    <td className="px-4 py-3 text-blue-800">{formatCurrency(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminContainer>
  );
}
