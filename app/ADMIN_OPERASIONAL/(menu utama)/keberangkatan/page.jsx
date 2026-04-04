"use client";
import AdminContainer from "@/components/Container/adminContainer";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { Label, Select, Spinner, Badge } from "flowbite-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AnnouncementPage from "./pengumuman";
import { FaUsers, FaUser } from "react-icons/fa";

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
};

export default function Page() {
  const [paket, setPaket] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [jamaahList, setJamaahList] = useState([]);
  const [loadingJamaah, setLoadingJamaah] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/system/paket");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPaket(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Fetch daftar jamaah saat paket berubah
  useEffect(() => {
    if (!selectedId) return;
    const fetchJamaah = async () => {
      setLoadingJamaah(true);
      try {
        const res = await fetch(`/api/system/order?paketId=${selectedId}`);
        const data = await res.json();
        setJamaahList(Array.isArray(data) ? data : []);
      } catch {
        setJamaahList([]);
      } finally {
        setLoadingJamaah(false);
      }
    };
    fetchJamaah();
  }, [selectedId]);

  const onePaket = paket.find((p) => p.id === selectedId);
  const terisi = onePaket?.pendaftaran?.length ?? 0;

  if (loading) return <AdminContainer><div className="flex justify-center py-10"><Spinner size="xl" /></div></AdminContainer>;

  if (paket.length === 0) return (
    <AdminContainer>
      <p className="text-gray-500 text-center py-10">Belum ada paket umrah. <a href="/ADMIN_OPERASIONAL/daftar-paket/tambah" className="text-blue-600 underline">Tambah paket</a></p>
    </AdminContainer>
  );

  return (
    <div className="space-y-4">
      <AdminContainer>
        <h2 className="text-xl font-bold mb-4">Keberangkatan & Manasik</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gambar paket */}
          {onePaket?.gambar && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-100">
              <Image src={onePaket.gambar} alt={onePaket.nama} fill className="object-cover" />
            </div>
          )}

          {/* Info paket */}
          <div className="space-y-3 col-span-2">
            <div>
              <Label value="Pilih Paket" />
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="mt-1">
                {paket.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — Berangkat {formatDate(p.tanggalBerangkat, "short")}
                  </option>
                ))}
              </Select>
            </div>

            {onePaket && (
              <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Keberangkatan</p>
                  <p className="font-semibold">{formatDate(onePaket.tanggalBerangkat, "short")}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Kepulangan</p>
                  <p className="font-semibold">{formatDate(onePaket.tanggalPulang, "short")}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Kuota / Terisi</p>
                  <p className="font-semibold">{terisi} / {onePaket.kuota}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Harga</p>
                  <p className="font-semibold">{formatCurrency(onePaket.harga)}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Maskapai</p>
                  <p className="font-semibold">{onePaket.penerbangan?.maskapai || "TBA"}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Hotel</p>
                  <p className="font-semibold">{onePaket.hotel?.nama || "TBA"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminContainer>

      {/* Daftar Jamaah yang Berangkat */}
      <AdminContainer>
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold">Daftar Jamaah Berangkat</h3>
          <span className="ml-auto text-sm text-gray-500">
            {jamaahList.filter(j => j.status !== "TIDAK_TERKONFIRMASI").length} jamaah
          </span>
        </div>

        {loadingJamaah ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : jamaahList.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaUsers size={40} className="mx-auto mb-2 opacity-30" />
            <p>Belum ada jamaah yang mendaftar untuk paket ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["No", "Nama Jamaah", "Email", "Telepon", "Status Pendaftaran", "Tgl Daftar"].map(h => (
                    <th key={h} className="px-4 py-2.5 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jamaahList.map((j, i) => (
                  <tr key={j.id} className={`border-b hover:bg-gray-50 ${j.status === "TIDAK_TERKONFIRMASI" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-2.5">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          {j.akun?.gambar ? (
                            <Image src={j.akun.gambar} alt={j.akun.nama} width={32} height={32} className="rounded-full object-cover" />
                          ) : (
                            <FaUser className="text-blue-400" size={14} />
                          )}
                        </div>
                        <span className="font-medium">{j.akun?.nama || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{j.akunEmail}</td>
                    <td className="px-4 py-2.5">{j.akun?.telepon || "-"}</td>
                    <td className="px-4 py-2.5">
                      <Badge color={STATUS_COLOR[j.status] ?? "gray"} size="sm">{j.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{formatDate(j.created, "short")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminContainer>

      {/* Pengumuman */}
      <AnnouncementPage paketId={selectedId} />
    </div>
  );
}
