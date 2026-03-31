"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, Button, Badge, Alert, Spinner, Modal } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiX, HiTrash, HiCalendar, HiUser } from "react-icons/hi";

export default function TransaksiPage() {
  const { data: session } = useSession();
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPendaftaran, setSelectedPendaftaran] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchPendaftaran = useCallback(async () => {
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session?.user?.email}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data");
      }

      setPendaftaranList(data);
      console.log("Pendaftaran data:", data); // Debug log
    } catch (err) {
      console.error("Error fetching pendaftaran:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchPendaftaran();
  }, [fetchPendaftaran]);

  const getStatusColor = (status) => {
    switch (status) {
      case "MENUNGGU": return "yellow";
      case "TERKONFIRMASI": return "green";
      case "TIDAK_TERKONFIRMASI": return "red";
      case "DIBATALKAN": return "gray";
      default: return "gray";
    }
  };

  const openCancelModal = (pendaftaran) => {
    setSelectedPendaftaran(pendaftaran);
    setShowCancelModal(true);
    setCancelReason("");
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedPendaftaran(null);
    setCancelReason("");
  };

  const handleCancel = async () => {
    if (!selectedPendaftaran) return;

    setCancelling(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch('/api/jamaah/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendaftaranId: selectedPendaftaran.id,
          alasan: cancelReason
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membatalkan pemesanan");
      }

      setSuccess(`Pemesanan berhasil dibatalkan! Refund: ${formatCurrency(data.refundAmount)} (${data.refundPercentage}%)`);
      closeCancelModal();
      fetchPendaftaran();

    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (pendaftaran) => {
    const verifiedPayments = pendaftaran.pembayaran?.filter(p => p.status === "TERVERIFIKASI") || [];
    return verifiedPayments.length === 0 && pendaftaran.status !== "DIBATALKAN";
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
        <h1 className="text-3xl font-bold">Daftar Pemesanan Saya</h1>
        <p className="text-gray-600 mt-2">Kelola dan pantau semua pemesanan paket umrah Anda</p>
      </div>

      {error && <Alert color="failure" className="mb-4">{error}</Alert>}
      {success && <Alert color="success" className="mb-4">{success}</Alert>}

      {pendaftaranList.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Belum ada pemesanan paket</p>
            <Button 
              color="blue" 
              className="mt-4"
              onClick={() => window.location.href = "/"}
            >
              Lihat Paket Umrah
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendaftaranList.map((pendaftaran) => (
            <Card key={pendaftaran.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{pendaftaran.paket.nama}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pendaftaran.paket.deskripsi}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tanggal Pesan:</span>
                        <p className="font-medium">{formatDate(pendaftaran.created, "short")}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Keberangkatan:</span>
                        <p className="font-medium">{formatDate(pendaftaran.paket.tanggalBerangkat, "short")}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Kepulangan:</span>
                        <p className="font-medium">{formatDate(pendaftaran.paket.tanggalPulang, "short")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <span className="text-gray-600">Total Harga:</span>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(pendaftaran.paket.harga)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge color={getStatusColor(pendaftaran.status)} size="lg">
                          {pendaftaran.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {pendaftaran.status === "MENUNGGU" && (
                      <Button
                        size="sm"
                        color="blue"
                        onClick={() => window.location.href = `/transaksi/pesan?pesan=${pendaftaran.paket.id}`}
                      >
                        <HiCalendar className="mr-1" />
                        Lihat Detail
                      </Button>
                    )}
                    
                    {canCancel(pendaftaran) && (
                      <Button
                        size="sm"
                        color="failure"
                        onClick={() => openCancelModal(pendaftaran)}
                      >
                        <HiTrash className="mr-1" />
                        Batalkan
                      </Button>
                    )}

                    {pendaftaran.status === "DIBATALKAN" && (
                      <Badge color="gray" size="sm">
                        <HiX className="mr-1" />
                        Dibatalkan
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress Pembayaran */}
                {pendaftaran.pembayaran && pendaftaran.pembayaran.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-3">Progress Pembayaran</h4>
                    <div className="space-y-2">
                      {pendaftaran.pembayaran.map((pembayaran) => (
                        <div key={pembayaran.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(pembayaran.jumlah)}</span>
                            <Badge color={getStatusColor(pembayaran.status)} size="sm">
                              {pembayaran.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatDate(pembayaran.created, "short")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Cancel */}
      <Modal show={showCancelModal} onClose={closeCancelModal} size="md">
        <Modal.Header>
          <div className="flex items-center gap-2">
            <HiTrash className="text-red-600" />
            Batalkan Pemesanan
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedPendaftaran && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Konfirmasi Pembatalan</h4>
                <p className="text-red-800 text-sm">
                  Anda yakin ingin membatalkan pemesanan untuk paket <strong>{selectedPendaftaran.paket.nama}</strong>?
                </p>
                <div className="mt-3 text-sm text-red-700">
                  <p><strong>Kebijakan Refund:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>• 100% refund jika dibatalkan dalam 7 hari</li>
                    <li>• 50% refund jika dibatalkan 8-30 hari</li>
                    <li>• 25% refund jika dibatalkan &gt; 30 hari</li>
                    <li>• Tidak ada refund jika sudah ada pembayaran terverifikasi</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Pembatalan (opsional)
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan alasan pembatalan..."
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={closeCancelModal}
            disabled={cancelling}
          >
            Batal
          </Button>
          <Button
            color="failure"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Memproses...
              </>
            ) : (
              "Ya, Batalkan Pemesanan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
