"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import { Spinner, Badge } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";

const JENIS_LABEL = { DP: "DP (30%)", CICILAN_1: "Cicilan (30%)", PELUNASAN: "Pelunasan (40%)" };
const STATUS_COLOR = { TERVERIFIKASI: "success", DITOLAK: "failure", MENUNGGU: "warning" };

export default function LaporanKeuanganPage() {
  const [rawList, setRawList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [filterJenis, setFilterJenis] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/system/pembayaran");
        const list = await res.json();
        if (Array.isArray(list)) setRawList(list);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Filter berdasarkan tahun, jenis, status
  const filtered = rawList.filter((p) => {
    const matchTahun = new Date(p.created).getFullYear() === tahun;
    const matchJenis = filterJenis === "ALL" || p.jenis === filterJenis;
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchTahun && matchJenis && matchStatus;
  });

  const totalVerifikasi = filtered.filter((p) => p.status === "TERVERIFIKASI").reduce((s, p) => s + p.jumlah, 0);
  const totalMenunggu = filtered.filter((p) => p.status === "MENUNGGU").reduce((s, p) => s + p.jumlah, 0);
  const totalDitolak = filtered.filter((p) => p.status === "DITOLAK").reduce((s, p) => s + p.jumlah, 0);

  return (
    <AdminContainer>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Laporan Keuangan</h2>
        <div className="flex gap-2 flex-wrap">
          {/* Filter Tahun */}
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {/* Filter Jenis */}
          <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
            <option value="ALL">Semua Jenis</option>
            <option value="DP">DP (30%)</option>
            <option value="CICILAN_1">Cicilan (30%)</option>
            <option value="PELUNASAN">Pelunasan (40%)</option>
          </select>
          {/* Filter Status */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
            <option value="ALL">Semua Status</option>
            <option value="TERVERIFIKASI">Terverifikasi</option>
            <option value="MENUNGGU">Menunggu</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-600 font-medium">Total Terverifikasi</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalVerifikasi)}</p>
              <p className="text-xs text-green-500 mt-1">{filtered.filter(p => p.status === "TERVERIFIKASI").length} transaksi</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-600 font-medium">Menunggu Verifikasi</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">{formatCurrency(totalMenunggu)}</p>
              <p className="text-xs text-yellow-500 mt-1">{filtered.filter(p => p.status === "MENUNGGU").length} transaksi</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600 font-medium">Ditolak</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalDitolak)}</p>
              <p className="text-xs text-red-500 mt-1">{filtered.filter(p => p.status === "DITOLAK").length} transaksi</p>
            </div>
          </div>

          {/* Info filter aktif */}
          {(filterJenis !== "ALL" || filterStatus !== "ALL") && (
            <div className="mb-3 flex gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Filter aktif:</span>
              {filterJenis !== "ALL" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{JENIS_LABEL[filterJenis]}</span>}
              {filterStatus !== "ALL" && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{filterStatus}</span>}
              <button onClick={() => { setFilterJenis("ALL"); setFilterStatus("ALL"); }} className="text-xs text-red-500 hover:underline">Reset</button>
            </div>
          )}

          {/* Tabel */}
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>{["Jamaah", "Paket", "Jenis", "Jumlah", "Status", "Tanggal"].map(h => (
                  <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data untuk filter yang dipilih</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="font-medium">{p.pendaftaran?.akun?.nama || "-"}</div>
                      <div className="text-xs text-gray-400">{p.pendaftaran?.akunEmail}</div>
                    </td>
                    <td className="px-4 py-2 max-w-[140px]"><span className="line-clamp-1 text-xs">{p.pendaftaran?.paket?.nama || "-"}</span></td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.jenis === "DP" ? "bg-blue-50 text-blue-700" :
                        p.jenis === "CICILAN_1" ? "bg-purple-50 text-purple-700" :
                        "bg-green-50 text-green-700"
                      }`}>{JENIS_LABEL[p.jenis] || p.jenis || "-"}</span>
                    </td>
                    <td className="px-4 py-2 font-medium">{formatCurrency(p.jumlah)}</td>
                    <td className="px-4 py-2">
                      <Badge color={STATUS_COLOR[p.status] ?? "gray"} size="sm">{p.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{formatDate(p.created, "short")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">{filtered.length} data ditampilkan</p>
        </>
      )}
    </AdminContainer>
  );
}
