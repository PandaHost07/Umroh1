"use client";
import AdminContainer from "@/components/Container/adminContainer";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { Label, Select, Spinner, Badge } from "flowbite-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AnnouncementPage from "./pengumuman";

export default function Page() {
  const [paket, setPaket] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

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
              <Select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-1"
              >
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

      {/* Pengumuman */}
      <AnnouncementPage paketId={selectedId} />
    </div>
  );
}
