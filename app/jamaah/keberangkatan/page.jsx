"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Badge, Spinner, Alert } from "flowbite-react";
import formatDate from "@/components/Date/formatDate";
import { HiCalendar, HiClock, HiLocationMarker, HiUserGroup } from "react-icons/hi";
import { useRouter } from "next/navigation";

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const target = new Date(targetDate);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return { hari: 0, jam: 0, menit: 0, detik: 0, lewat: true };
      return {
        hari: Math.floor(diff / 86400000),
        jam: Math.floor((diff % 86400000) / 3600000),
        menit: Math.floor((diff % 3600000) / 60000),
        detik: Math.floor((diff % 60000) / 1000),
        lewat: false,
      };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!mounted) return null;

  if (timeLeft.lewat) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
        <p className="text-gray-600 font-semibold text-lg">✈️ Jadwal keberangkatan telah berlalu</p>
        <p className="text-xs text-gray-400 mt-1">Tanggal keberangkatan sudah terlewati</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white text-center">
      <p className="text-sm font-medium text-blue-200 mb-3">⏳ Hitung Mundur Keberangkatan</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { val: timeLeft.hari, label: "Hari" },
          { val: timeLeft.jam, label: "Jam" },
          { val: timeLeft.menit, label: "Menit" },
          { val: timeLeft.detik, label: "Detik" },
        ].map(({ val, label }) => (
          <div key={label} className="bg-white/20 rounded-lg p-2">
            <div className="text-2xl font-bold tabular-nums">{String(val).padStart(2, "0")}</div>
            <div className="text-xs text-blue-200">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
};

export default function KeberangkatanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendaftaran = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session.user.email}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data");
      setPendaftaranList(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [session?.user?.email]);

  useEffect(() => { fetchPendaftaran(); }, [fetchPendaftaran]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  // Filter hanya yang aktif (bukan dibatalkan)
  const aktif = pendaftaranList.filter((p) => p.status !== "TIDAK_TERKONFIRMASI");

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HiCalendar className="text-blue-600" />
        Jadwal Keberangkatan
      </h1>

      {error && <Alert color="failure">{error}</Alert>}

      {aktif.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center">
          <div className="text-5xl mb-3">✈️</div>
          <p className="text-gray-500 mb-4">Belum ada paket yang dipesan.</p>
          <button onClick={() => router.push("/jamaah")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Lihat Paket Umrah
          </button>
        </div>
      ) : (
        aktif.map((pendaftaran) => (
          <div key={pendaftaran.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{pendaftaran.paket?.nama}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{pendaftaran.paket?.deskripsi}</p>
              </div>
              <Badge color={STATUS_COLOR[pendaftaran.status] ?? "gray"} size="sm">
                {pendaftaran.status}
              </Badge>
            </div>

            <div className="p-4 space-y-4">
              {/* Countdown */}
              {pendaftaran.paket?.tanggalBerangkat && (
                <CountdownTimer targetDate={pendaftaran.paket.tanggalBerangkat} />
              )}

              {/* Info utama */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <HiCalendar className="text-blue-600 text-xl shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Berangkat</p>
                    <p className="font-semibold text-sm">{formatDate(pendaftaran.paket?.tanggalBerangkat, "long")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <HiClock className="text-green-600 text-xl shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Pulang</p>
                    <p className="font-semibold text-sm">{formatDate(pendaftaran.paket?.tanggalPulang, "long")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <HiLocationMarker className="text-purple-600 text-xl shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Hotel</p>
                    <p className="font-semibold text-sm">{pendaftaran.paket?.hotel?.nama || "TBA"}</p>
                    {pendaftaran.paket?.hotel?.lokasi && (
                      <p className="text-xs text-purple-600">{pendaftaran.paket.hotel.lokasi}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info penerbangan */}
              {pendaftaran.paket?.penerbangan && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <HiUserGroup className="text-gray-600" /> Informasi Penerbangan
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      { label: "Maskapai", val: pendaftaran.paket.penerbangan.maskapai },
                      { label: "Bandara Berangkat", val: pendaftaran.paket.penerbangan.bandaraBerangkat },
                      { label: "Bandara Tujuan", val: pendaftaran.paket.penerbangan.bandaraTiba },
                      {
                        label: "Waktu Berangkat",
                        val: pendaftaran.paket.penerbangan.waktuBerangkat
                          ? new Date(pendaftaran.paket.penerbangan.waktuBerangkat).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                          : null,
                      },
                      {
                        label: "Waktu Tiba",
                        val: pendaftaran.paket.penerbangan.waktuTiba
                          ? new Date(pendaftaran.paket.penerbangan.waktuTiba).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                          : null,
                      },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="font-medium">{val || "TBA"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {pendaftaran.iternary?.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">📋 Itinerary Perjalanan</h4>
                  <div className="space-y-2">
                    {pendaftaran.iternary.sort((a, b) => a.hariKe - b.hariKe).map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-700">H-{item.hariKe}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.aktivitas}</p>
                          {item.lokasi && <p className="text-xs text-gray-500 mt-0.5">📍 {item.lokasi}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catatan */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-orange-700 mb-1">📌 Catatan Penting</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Pastikan semua dokumen lengkap H-30 sebelum keberangkatan</li>
                  <li>• Datang ke bandara 3 jam sebelum penerbangan</li>
                  <li>• Bawa paspor, visa, dan dokumen kesehatan</li>
                </ul>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
