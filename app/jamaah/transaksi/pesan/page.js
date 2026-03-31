"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, Alert, Spinner, Timeline } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiCalendar, HiClock, HiLocationMarker, HiUserGroup, HiInformationCircle } from "react-icons/hi";

export default function PemesananPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [paket, setPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const paketId = searchParams.get("pesan");

  useEffect(() => {
    if (paketId) {
      fetchPaketDetail();
    } else {
      setError("Paket tidak ditemukan");
      setLoading(false);
    }
  }, [paketId]);

  const fetchPaketDetail = async () => {
    try {
      const res = await fetch(`/api/public/paket/${paketId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data paket");
      }
      
      setPaket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePesan = async () => {
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/jamaah/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paketId: paketId,
          akunEmail: session.user.email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan pemesanan");
      }

      setSuccess("Pemesanan berhasil! Silakan lanjutkan ke pembayaran.");
      
      // Redirect ke halaman pembayaran setelah 2 detik
      setTimeout(() => {
        router.push("/pembayaran");
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error && !paket) {
    return (
      <div className="p-6">
        <Alert color="failure">{error}</Alert>
        <Button 
          color="blue" 
          className="mt-4"
          onClick={() => router.push("/")}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          color="gray" 
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Kembali
        </Button>
        <h1 className="text-3xl font-bold">Form Pemesanan Paket Umrah</h1>
      </div>

      {error && <Alert color="failure" className="mb-4">{error}</Alert>}
      {success && <Alert color="success" className="mb-4">{success}</Alert>}

      {paket && (
        <div className="space-y-6">
          {/* Detail Paket */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Detail Paket</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img 
                  src={paket.gambar} 
                  alt={paket.nama}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{paket.nama}</h3>
                <p className="text-gray-600">{paket.deskripsi}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Berangkat:</span>
                    <span className="font-medium">{formatDate(paket.tanggalBerangkat, "long")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pulang:</span>
                    <span className="font-medium">{formatDate(paket.tanggalPulang, "long")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durasi:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(paket.tanggalPulang) - new Date(paket.tanggalBerangkat)) / (1000 * 60 * 60 * 24))} Hari
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sisa Kuota:</span>
                    <span className="font-medium">{paket.kuota} orang</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Harga:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(paket.harga)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Informasi Jadwal */}
          <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <HiCalendar className="text-blue-600" />
              Informasi Jadwal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <HiCalendar className="text-blue-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Berangkat</p>
                  <p className="font-semibold">{formatDate(paket.tanggalBerangkat, "long")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <HiClock className="text-green-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pulang</p>
                  <p className="font-semibold">{formatDate(paket.tanggalPulang, "long")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <HiLocationMarker className="text-purple-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Hotel</p>
                  <p className="font-semibold">{paket.hotel?.nama || "TBA"}</p>
                </div>
              </div>
            </div>

            {/* Detail Penerbangan */}
            {paket.penerbangan && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <HiUserGroup className="text-gray-600" />
                  Informasi Penerbangan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Maskapai:</span>
                    <p className="font-medium">{paket.penerbangan.maskapai || "TBA"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Berangkat dari:</span>
                    <p className="font-medium">{paket.penerbangan.bandaraBerangkat}</p>
                  </div>
                  {paket.penerbangan.waktuBerangkat && (
                    <div>
                      <span className="text-gray-600">Waktu Berangkat:</span>
                      <p className="font-medium">
                        {new Date(paket.penerbangan.waktuBerangkat).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {paket.penerbangan.waktuTiba && (
                    <div>
                      <span className="text-gray-600">Waktu Tiba:</span>
                      <p className="font-medium">
                        {new Date(paket.penerbangan.waktuTiba).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Timeline Perjalanan */}
          <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <HiCalendar className="text-blue-600" />
              Timeline Perjalanan
            </h2>
            <Timeline>
              <Timeline.Item>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>{formatDate(paket.tanggalBerangkat, "long")}</Timeline.Time>
                  <Timeline.Title>Keberangkatan dari Indonesia</Timeline.Title>
                  <Timeline.Body>
                    Berkumpul di {paket.penerbangan?.bandaraBerangkat} untuk penerbangan menuju Jeddah.
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>Hari 2-3</Timeline.Time>
                  <Timeline.Title>Tiba di Jeddah</Timeline.Title>
                  <Timeline.Body>
                    Tiba di Bandara King Abdulaziz, proses imigrasi, dan transfer ke hotel di Mekkah.
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>Hari 4-10</Timeline.Time>
                  <Timeline.Title>Ibadah Umrah di Mekkah</Timeline.Title>
                  <Timeline.Body>
                    Melaksanakan ibadah umrah, ziarah ke tempat-tempat bersejarah, dan program keagamaan.
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>Hari 11-13</Timeline.Time>
                  <Timeline.Title>Perjalanan ke Madinah</Timeline.Title>
                  <Timeline.Body>
                    Berangkat ke Madinah, ziarah ke Masjid Nabawi dan tempat-tempat bersejarah.
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>{formatDate(paket.tanggalPulang, "long")}</Timeline.Time>
                  <Timeline.Title>Kepulangan ke Indonesia</Timeline.Title>
                  <Timeline.Body>
                    Transfer ke bandara Jeddah untuk penerbangan kembali ke Indonesia.
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* Informasi Pemesan */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Informasi Pemesan</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={session?.user?.nama || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <input
                    type="text"
                    value={session?.user?.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan" || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={session?.user?.telepon || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Syarat & Ketentuan */}
          <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <HiInformationCircle className="text-blue-600" />
              Syarat & Ketentuan
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">📅 Jadwal Pembayaran</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• DP 30% dalam 24 jam setelah pemesanan</li>
                    <li>• Cicilan 2 (30%) H-60 sebelum keberangkatan</li>
                    <li>• Pelunasan (40%) H-30 sebelum keberangkatan</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">📄 Dokumen Persyaratan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Paspor (masih berlaku 6 bulan)</li>
                    <li>• KTP dan Foto 4x6 (background putih)</li>
                    <li>• Sertifikat vaksin terbaru</li>
                    <li>• Bukti booking (setelah pembayaran DP)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">⚠️ Penting!</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pemesanan bersifat mengikat dan tidak dapat dibatalkan secara sepihak</li>
                  <li>• Kelengkapan dokumen harus diserahkan H-60 sebelum keberangkatan</li>
                  <li>• Biaya tambahan mungkin berlaku jika ada perubahan regulasi pemerintah</li>
                  <li>• Jadwal dapat berubah sesuai kondisi dan regulasi terkini</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-4">
            <Button 
              color="gray" 
              onClick={() => router.back()}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button 
              color="blue" 
              onClick={handlePesan}
              disabled={submitting || success}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Memproses...
                </>
              ) : success ? (
                "✓ Berhasil Dipesan"
              ) : (
                "Konfirmasi Pemesanan"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
