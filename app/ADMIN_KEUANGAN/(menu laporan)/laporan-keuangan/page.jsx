"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import { Spinner, Badge } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";

export default function LaporanKeuanganPage() {
  const [data, setData] = useState(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/system/pembayaran");
        const list = await res.json();
        if (!Array.isArray(list)) return;

        // Filter tahun
        const filtered = list.filter((p) => new Date(p.created).getFullYear() === tahun);

        const totalMasuk = filtered.filter((p) => p.status === "TERVERIFIKASI").reduce((s, p) => s + p.jumlah, 0);
        const totalMenunggu = filtered.filter((p) => p.status === "MENUNGGU").reduce((s, p) => s + p.jumlah, 0);
        const totalDitolak = filtered.filter((p) => p.status === "DITOLAK").reduce((s, p) => s + p.jumlah, 0);

        setData({ list: filtered.slice(0, 50), totalMasuk, totalMenunggu, totalDitolak });
      } catch {}
    };
    fetchData();
  }, [tahun]);

  const years = [2023, 2024, 2025, 2026];

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Laporan Keuangan</h2>
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!data ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-600 font-medium">Total Terverifikasi</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(data.totalMasuk)}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-600 font-medium">Menunggu Verifikasi</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">{formatCurrency(data.totalMenunggu)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600 font-medium">Ditolak</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(data.totalDitolak)}</p>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>{["Jamaah", "Paket", "Jenis", "Jumlah", "Status", "Tanggal"].map(h => (
                  <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {data.list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data untuk tahun {tahun}</td></tr>
                ) : data.list.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{p.pendaftaran?.akun?.nama || "-"}</td>
                    <td className="px-4 py-2 max-w-[140px]"><span className="line-clamp-1">{p.pendaftaran?.paket?.nama || "-"}</span></td>
                    <td className="px-4 py-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.jenis || "-"}</span></td>
                    <td className="px-4 py-2 font-medium">{formatCurrency(p.jumlah)}</td>
                    <td className="px-4 py-2">
                      <Badge color={p.status === "TERVERIFIKASI" ? "success" : p.status === "DITOLAK" ? "failure" : "warning"} size="sm">{p.status}</Badge>
                    </td>
                    <td className="px-4 py-2">{formatDate(p.created, "short")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminContainer>
  );
}
