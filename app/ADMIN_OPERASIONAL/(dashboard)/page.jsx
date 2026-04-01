"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Card } from "flowbite-react";
import { FaUserFriends, FaClipboardCheck, FaRegCalendarAlt, FaSuitcase } from "react-icons/fa";
import { useEffect, useState } from "react";
import formatDate from "@/components/Date/formatDate";

export default function AdminOperasionalDashboard() {
  const [stats, setStats] = useState({ paket: 0, jamaah: 0, dokumen: 0, keberangkatan: 0 });
  const [paketList, setPaketList] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resPaket, resJamaah] = await Promise.all([
          fetch("/api/system/paket"),
          fetch("/api/system/akun?role=jamaah"),
        ]);
        const pakets = await resPaket.json();
        const jamaah = await resJamaah.json();

        const now = new Date();
        const bulanIni = Array.isArray(pakets)
          ? pakets.filter((p) => {
              const tgl = new Date(p.tanggalBerangkat);
              return tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear();
            }).length
          : 0;

        setPaketList(Array.isArray(pakets) ? pakets.slice(0, 5) : []);
        setStats({
          paket: Array.isArray(pakets) ? pakets.length : 0,
          jamaah: Array.isArray(jamaah) ? jamaah.length : 0,
          keberangkatan: bulanIni,
        });
      } catch {}
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold">Dashboard Operasional</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Card href="/ADMIN_OPERASIONAL/daftar-paket">
          <div className="mb-3 font-medium text-sm text-gray-500">Total Paket Umrah</div>
          <div className="flex w-full justify-between items-center px-2">
            <div className="font-bold text-3xl">{stats.paket}</div>
            <FaSuitcase className="text-blue-500" size={35} />
          </div>
        </Card>

        <Card href="/ADMIN_OPERASIONAL/data-jamaah">
          <div className="mb-3 font-medium text-sm text-gray-500">Jamaah Terdaftar</div>
          <div className="flex w-full justify-between items-center px-2">
            <div className="font-bold text-3xl">{stats.jamaah}</div>
            <FaUserFriends className="text-green-500" size={35} />
          </div>
        </Card>

        <Card href="/ADMIN_OPERASIONAL/keberangkatan">
          <div className="mb-3 font-medium text-sm text-gray-500">Keberangkatan Bulan Ini</div>
          <div className="flex w-full justify-between items-center px-2">
            <div className="font-bold text-3xl">{stats.keberangkatan}</div>
            <FaRegCalendarAlt className="text-purple-500" size={35} />
          </div>
        </Card>
      </div>

      <AdminContainer>
        <h3 className="text-lg font-bold mb-4">Paket Umrah Terbaru</h3>
        {paketList.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada paket.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Nama Paket", "Keberangkatan", "Kuota", "Terisi", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paketList.map((p) => {
                  const terisi = p.pendaftaran?.length ?? 0;
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{p.nama}</td>
                      <td className="px-4 py-2">{formatDate(p.tanggalBerangkat, "short")}</td>
                      <td className="px-4 py-2">{p.kuota}</td>
                      <td className="px-4 py-2">{terisi}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "AKTIF" ? "bg-green-100 text-green-700" :
                          p.status === "DITUTUP" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminContainer>
    </div>
  );
}
