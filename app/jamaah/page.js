"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Badge, Alert, Progress } from "flowbite-react";
import Image from "next/image";
import {
  FaMoneyBillWave,
  FaUser,
  FaHotel,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { PiAirplaneTiltFill } from "react-icons/pi";
import { FaStar } from "react-icons/fa6";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";

const hitungHari = (start, end) => {
  const diffTime = Math.abs(new Date(end) - new Date(start));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function JamaahDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [paketList, setPaketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    const fetchPaket = async () => {
      try {
        const res = await fetch("/api/public/paket");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat paket");
        setPaketList(data.paket || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaket();
  }, [session]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard Jamaah</h1>
        <p className="text-blue-100 text-sm">
          Selamat datang, {session?.user?.nama || "Jamaah"}!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <MdOutlineFlipCameraAndroid size={28} className="text-blue-600" />,
            label: "Transaksi",
            sub: "Kelola pemesanan",
            href: "/jamaah/transaksi",
          },
          {
            icon: <FaMoneyBillWave size={28} className="text-green-600" />,
            label: "Pembayaran",
            sub: "DP & Cicilan",
            href: "/jamaah/pembayaran",
          },
          {
            icon: <RiCalendarScheduleFill size={28} className="text-purple-600" />,
            label: "Keberangkatan",
            sub: "Jadwal & Itinerary",
            href: "/jamaah/keberangkatan",
          },
          {
            icon: <FaUser size={28} className="text-orange-600" />,
            label: "Profile",
            sub: "Data & Dokumen",
            href: "/jamaah/profile-saya",
          },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(item.href)}
            className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {item.icon}
            <span className="font-semibold text-sm mt-2">{item.label}</span>
            <span className="text-xs text-gray-500 mt-0.5">{item.sub}</span>
          </button>
        ))}
      </div>

      {/* Paket Tersedia */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Paket Umrah Tersedia</h2>
          <a href="/paket" className="text-sm text-blue-600 hover:underline">
            Lihat di halaman publik →
          </a>
        </div>

        {error && <Alert color="failure" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : paketList.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
            Belum ada paket umrah tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paketList.map((paket) => (
              <div
                key={paket.id}
                className="flex flex-col bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Gambar */}
                <div className="relative h-48">
                  {paket.gambar ? (
                    <Image
                      src={paket.gambar}
                      alt={paket.nama}
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 rounded-t-xl" />
                  {/* Badge kuota */}
                  <div className="absolute top-2 right-2">
                    <Badge color={paket.isAvailable ? "success" : "failure"} size="sm">
                      {paket.isAvailable ? `${paket.kuotaTersedia} Seat` : "Penuh"}
                    </Badge>
                  </div>
                </div>

                {/* Konten */}
                <div className="px-4 py-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg mb-3 line-clamp-2 capitalize">
                    {paket.nama}
                  </h3>

                  <div className="text-gray-600 text-sm space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <FaRegCalendarAlt size={13} />
                        <span>Keberangkatan</span>
                      </div>
                      <span className="font-medium">
                        {formatDate(paket.tanggalBerangkat, "short")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <MdAccessTime size={14} />
                        <span>Durasi</span>
                      </div>
                      <span className="font-medium">
                        {hitungHari(paket.tanggalBerangkat, paket.tanggalPulang)} Hari
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <PiAirplaneTiltFill size={14} />
                        <span>Maskapai</span>
                      </div>
                      <span className="font-medium">
                        {paket.penerbangan?.maskapai ?? "-"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <FaHotel size={13} />
                        <span>Hotel</span>
                      </div>
                      <div className="flex">
                        {[...Array(paket.hotel?.bintang || 0)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-400" size={13} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="text-sm text-gray-600">
                      Seat Terisi: {paket.quotaUsage?.used ?? 0} dari {paket.kuota}
                      <Progress
                        progress={Math.min(100, paket.quotaUsage?.percentage ?? 0)}
                        size="sm"
                        color={paket.quotaUsage?.percentage >= 80 ? "red" : "blue"}
                        className="mt-1"
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      Harga Mulai:
                      <div className="text-red-500 text-xl font-bold">
                        {formatCurrency(paket.harga)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        href={`/paket/detail/${paket.id}`}
                        color="light"
                        size="sm"
                        className="flex-1"
                      >
                        Detail
                      </Button>
                      <Button
                        color={paket.isAvailable ? "blue" : "gray"}
                        size="sm"
                        className="flex-1"
                        disabled={!paket.isAvailable}
                        onClick={() =>
                          paket.isAvailable &&
                          router.push(`/jamaah/transaksi/pesan?pesan=${paket.id}`)
                        }
                      >
                        {paket.isAvailable ? "Pesan" : "Penuh"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
