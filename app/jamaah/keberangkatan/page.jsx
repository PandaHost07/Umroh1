"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, Badge, Timeline, Alert, Spinner } from "flowbite-react";
import formatDate from "@/components/Date/formatDate";
import { HiCalendar, HiClock, HiLocationMarker, HiUserGroup } from "react-icons/hi";

export default function KeberangkatanPage() {
  const { data: session } = useSession();
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendaftaran();
  }, []);

  const fetchPendaftaran = async () => {
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session?.user?.email}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data");
      }

      setPendaftaranList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "MENUNGGU": return "yellow";
      case "TERKONFIRMASI": return "green";
      case "TIDAK_TERKONFIRMASI": return "red";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HiCalendar className="text-blue-600" />
          Jadwal Keberangkatan
        </h1>
        <p className="text-gray-600 mt-2">Lihat itinerary lengkap dan jadwal keberangkatan paket umrah</p>
      </div>

      {error && <Alert color="failure" className="mb-4">{error}</Alert>}

      {pendaftaranList.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Belum ada pemesanan paket</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendaftaranList.map((pendaftaran) => (
            <Card key={pendaftaran.id}>
              {/* Header Paket */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{pendaftaran.paket.nama}</h3>
                    <p className="text-gray-600">{pendaftaran.paket.deskripsi}</p>
                  </div>
                  <Badge color={getStatusColor(pendaftaran.status)} size="lg">
                    {pendaftaran.status}
                  </Badge>
                </div>

                {/* Informasi Utama */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <HiCalendar className="text-blue-600 text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Berangkat</p>
                      <p className="font-semibold">{formatDate(pendaftaran.paket.tanggalBerangkat, "long")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <HiClock className="text-green-600 text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Pulang</p>
                      <p className="font-semibold">{formatDate(pendaftaran.paket.tanggalPulang, "long")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <HiLocationMarker className="text-purple-600 text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Hotel</p>
                      <p className="font-semibold">{pendaftaran.paket.hotel?.nama || "TBA"}</p>
                    </div>
                  </div>
                </div>

                {/* Detail Penerbangan */}
                {pendaftaran.paket.penerbangan && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HiUserGroup className="text-gray-600" />
                      Informasi Penerbangan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Maskapai:</span>
                        <p className="font-medium">{pendaftaran.paket.penerbangan.maskapai || "TBA"}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Berangkat dari:</span>
                        <p className="font-medium">{pendaftaran.paket.penerbangan.bandaraBerangkat}</p>
                      </div>
                      {pendaftaran.paket.penerbangan.waktuBerangkat && (
                        <div>
                          <span className="text-gray-600">Waktu Berangkat:</span>
                          <p className="font-medium">
                            {new Date(pendaftaran.paket.penerbangan.waktuBerangkat).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Itinerary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Itinerary Perjalanan</h4>
                {pendaftaran.iternary.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Itinerary belum tersedia</p>
                    <p className="text-sm text-gray-500 mt-1">Admin akan mengupdate itinerary sesaat sebelum keberangkatan</p>
                  </div>
                ) : (
                  <Timeline>
                    {pendaftaran.iternary
                      .sort((a, b) => a.hariKe - b.hariKe)
                      .map((item) => (
                        <Timeline.Item key={item.id}>
                          <Timeline.Point />
                          <Timeline.Content>
                            <Timeline.Time className="text-sm text-gray-600">
                              Hari ke-{item.hariKe}
                              {item.waktuMulai && (
                                <span className="ml-2">
                                  {new Date(item.waktuMulai).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  {item.waktuSelesai && (
                                    <span> - {new Date(item.waktuSelesai).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  )}
                                </span>
                              )}
                            </Timeline.Time>
                            <Timeline.Title className="text-lg font-semibold">
                              {item.aktivitas}
                            </Timeline.Title>
                            <Timeline.Body>
                              {item.lokasi && (
                                <p className="text-sm text-gray-600 mb-1">
                                  📍 {item.lokasi}
                                </p>
                              )}
                              <p className="text-gray-700">{item.aktivitas}</p>
                            </Timeline.Body>
                          </Timeline.Content>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                )}
              </div>

              {/* Catatan Penting */}
              <div className="border-t pt-4 mt-6">
                <h4 className="font-semibold mb-3 text-orange-600">📌 Catatan Penting</h4>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Pastikan semua dokumen lengkap H-30 sebelum keberangkatan</li>
                    <li>• Datang ke bandara 3 jam sebelum waktu penerbangan</li>
                    <li>• Bawa paspor, visa, dan dokumen kesehatan yang diperlukan</li>
                    <li>• Ikuti instruksi dari tour guide selama perjalanan</li>
                    <li>• Simpan nomor kontak darurat tour leader</li>
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
