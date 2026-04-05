"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Spinner, Badge } from "flowbite-react";
import Image from "next/image";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { alertError, alertSuccess } from "@/components/Alert/alert";
import { HiArrowLeft } from "react-icons/hi";

export default function PesanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paketId = searchParams.get("pesan");

  const [paket, setPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!paketId) { router.push("/jamaah"); return; }
    const fetchPaket = async () => {
      try {
        const res = await fetch(`/api/public/paket/${paketId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Paket tidak ditemukan");
        setPaket(data);
      } catch (err) {
        alertError(err.message);
        router.push("/jamaah");
      } finally {
        setLoading(false);
      }
    };
    fetchPaket();
  }, [paketId, router]);

  const handlePesan = async () => {
    if (!session?.user?.email || !paketId) return;
    if (!paket?.isAvailable) { alertError("Maaf, seat sudah penuh."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/jamaah/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ akunEmail: session.user.email, paketId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memesan");
      alertSuccess("Paket berhasil dipesan! Silakan lanjutkan ke pembayaran.");
      setTimeout(() => router.push("/jamaah/pembayaran"), 1500);
    } catch (err) {
      alertError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Spinner size="xl" /></div>
  );

  if (!paket) return null;

  const hitungHari = (s, e) => Math.ceil(Math.abs(new Date(e) - new Date(s)) / 86400000) + 1;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <HiArrowLeft /> Kembali
      </button>

      <h1 className="text-2xl font-bold">Konfirmasi Pemesanan</h1>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {paket.gambar && (
          <div className="relative h-48 w-full">
            <Image src={paket.gambar} alt={paket.nama} fill className="object-cover" />
          </div>
        )}
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{paket.nama}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{paket.deskripsi}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Keberangkatan", val: formatDate(paket.tanggalBerangkat, "short") },
              { label: "Kepulangan", val: formatDate(paket.tanggalPulang, "short") },
              { label: "Durasi", val: `${hitungHari(paket.tanggalBerangkat, paket.tanggalPulang)} Hari` },
              { label: "Maskapai", val: paket.penerbangan?.maskapai || "TBA" },
              { label: "Hotel", val: paket.hotel?.nama || "TBA" },
              { label: "Seat Tersisa", val: `${paket.kuotaTersedia} dari ${paket.kuota}` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold">{val}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Total Harga</p>
            <p className="text-3xl font-bold text-red-500">{formatCurrency(paket.harga)}</p>
          </div>

          {/* Jadwal pembayaran */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-800 mb-2">Jadwal Pembayaran Otomatis:</p>
            <div className="space-y-1 text-blue-700">
              <div className="flex justify-between">
                <span>DP (30%)</span>
                <span className="font-semibold">{formatCurrency(Math.round(paket.harga * 0.3))}</span>
              </div>
              <div className="flex justify-between">
                <span>Cicilan (30%)</span>
                <span className="font-semibold">{formatCurrency(Math.round(paket.harga * 0.3))}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelunasan (40%)</span>
                <span className="font-semibold">{formatCurrency(paket.harga - Math.round(paket.harga * 0.3) * 2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
            ⚠️ Setelah memesan, Anda akan diarahkan ke halaman pembayaran untuk melakukan DP.
          </div>

          <Button
            color={paket.isAvailable ? "blue" : "gray"}
            className="w-full"
            disabled={!paket.isAvailable || submitting}
            onClick={handlePesan}
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            {paket.isAvailable ? "Konfirmasi Pesan" : "Seat Penuh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
