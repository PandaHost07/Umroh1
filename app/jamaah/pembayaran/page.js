"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge, Alert, Spinner, Modal } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiOutlineClipboardList, HiUpload, HiEye, HiUser, HiDocumentText, HiStar } from "react-icons/hi";
import Image from "next/image";

export default function PembayaranPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [buktiFile, setBuktiFile] = useState(null);

  const fetchPendaftaran = useCallback(async () => {
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
  }, [session?.user?.email]);

  useEffect(() => {
    fetchPendaftaran();
  }, [fetchPendaftaran]);

  const getStatusColor = (status) => {
    switch (status) {
      case "MENUNGGU": return "yellow";
      case "TERVERIFIKASI": return "green";
      case "DITOLAK": return "red";
      default: return "gray";
    }
  };

  const getJenisLabel = (jenis) => {
    switch (jenis) {
      case "DP": return "Uang Muka (30%)";
      case "CICILAN_1": return "Cicilan ke-2 (30%)";
      case "PELUNASAN": return "Pelunasan (40%)";
      default: return jenis;
    }
  };

  const getDeadlineText = (jenis, tanggalBerangkat) => {
    const berangkat = new Date(tanggalBerangkat);
    switch (jenis) {
      case "DP":
        return "Dalam 24 jam";
      case "CICILAN_1":
        const deadline1 = new Date(berangkat);
        deadline1.setDate(deadline1.getDate() - 60);
        return `Sebelum ${deadline1.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      case "PELUNASAN":
        const deadline2 = new Date(berangkat);
        deadline2.setDate(deadline2.getDate() - 30);
        return `Sebelum ${deadline2.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      default:
        return "";
    }
  };

  const openUploadModal = (pembayaran) => {
    setSelectedPembayaran(pembayaran);
    setShowUploadModal(true);
    setBuktiFile(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedPembayaran(null);
    setBuktiFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi file
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("Ukuran file maksimal 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("File harus berupa gambar");
        return;
      }
      setBuktiFile(file);
    }
  };

  const handleUploadBukti = async () => {
    if (!buktiFile || !selectedPembayaran) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append('bukti', buktiFile);
      formData.append('pembayaranId', selectedPembayaran.id);

      const res = await fetch('/api/jamaah/upload-bukti', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal upload bukti pembayaran");
      }

      setSuccess("Bukti pembayaran berhasil diupload!");
      closeUploadModal();
      fetchPendaftaran(); // Refresh data

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
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
          <HiOutlineClipboardList className="text-blue-600" />
          Pembayaran
        </h1>
        <p className="text-gray-600 mt-2">Kelola pembayaran DP dan cicilan paket umrah</p>
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
              onClick={() => router.push("/")}
            >
              Lihat Paket Umrah
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendaftaranList.map((pendaftaran) => (
            <Card key={pendaftaran.id}>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{pendaftaran.paket.nama}</h3>
                    <p className="text-gray-600">{pendaftaran.paket.deskripsi}</p>
                  </div>
                  <Badge color={pendaftaran.status === "TERKONFIRMASI" ? "green" : "yellow"}>
                    {pendaftaran.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Berangkat:</span>
                    <p className="font-medium">{formatDate(pendaftaran.paket.tanggalBerangkat, "short")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Pulang:</span>
                    <p className="font-medium">{formatDate(pendaftaran.paket.tanggalPulang, "short")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Harga:</span>
                    <p className="font-bold text-green-600">{formatCurrency(pendaftaran.paket.harga)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{pendaftaran.status}</p>
                  </div>
                </div>
              </div>

              {/* Daftar Pembayaran */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Jadwal Pembayaran</h4>
                {pendaftaran.pembayaran.length === 0 ? (
                  <p className="text-gray-600">Belum ada jadwal pembayaran</p>
                ) : (
                  <div className="space-y-3">
                    {pendaftaran.pembayaran
                      .sort((a, b) => {
                        // Urutkan berdasarkan jenis pembayaran
                        const order = { "DP": 1, "CICILAN_1": 2, "PELUNASAN": 3 };
                        return (order[a.jenis] || 99) - (order[b.jenis] || 99);
                      })
                      .map((pembayaran, index) => (
                      <div key={pembayaran.id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 ${
                        pembayaran.status === "TERVERIFIKASI" ? "border-l-green-500" :
                        pembayaran.status === "DITOLAK" ? "border-l-red-500" : "border-l-blue-500"
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">{getJenisLabel(pembayaran.jenis)}</span>
                            <Badge color={getStatusColor(pembayaran.status)} size="sm">
                              {pembayaran.status}
                            </Badge>
                            {index === 0 && pembayaran.status === "MENUNGGU" && (
                              <Badge color="red" size="sm">
                                Prioritas
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Jumlah: {formatCurrency(pembayaran.jumlah)}</span>
                            <span>•</span>
                            <span>Deadline: {getDeadlineText(pembayaran.jenis, pendaftaran.paket.tanggalBerangkat)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Dibuat: {formatDate(pembayaran.created, "short")}
                          </p>
                          {pembayaran.buktiUrl && (
                            <Button
                              size="xs"
                              color="light"
                              className="mt-2"
                              onClick={() => window.open(pembayaran.buktiUrl, '_blank')}
                            >
                              <HiEye className="mr-1" />
                              Lihat Bukti
                            </Button>
                          )}
                        </div>
                        
                        {pembayaran.status === "MENUNGGU" ? (
                          <Button
                            size="sm"
                            color="blue"
                            onClick={() => openUploadModal(pembayaran)}
                          >
                            <HiUpload className="mr-1" />
                            Upload Bukti
                          </Button>
                        ) : pembayaran.status === "DITOLAK" ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge color="failure" size="sm">Ditolak</Badge>
                            <Button
                              size="sm"
                              color="warning"
                              onClick={() => openUploadModal(pembayaran)}
                            >
                              <HiUpload className="mr-1" />
                              Upload Ulang
                            </Button>
                          </div>
                        ) : (
                          <div className="text-green-600 font-medium text-sm flex items-center gap-1">
                            ✓ Terverifikasi
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Pembayaran */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total yang harus dibayar:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(pendaftaran.paket.harga)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Sudah dibayar:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      pendaftaran.pembayaran
                        .filter(p => p.status === "TERVERIFIKASI")
                        .reduce((sum, p) => sum + p.jumlah, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Sisa pembayaran:</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(
                      pendaftaran.paket.harga - 
                      pendaftaran.pembayaran
                        .filter(p => p.status === "TERVERIFIKASI")
                        .reduce((sum, p) => sum + p.jumlah, 0)
                    )}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Upload Bukti */}
      <Modal show={showUploadModal} onClose={closeUploadModal}>
        <Modal.Header>Upload Bukti Pembayaran</Modal.Header>
        <Modal.Body>
          {selectedPembayaran && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Jumlah Pembayaran:</p>
                <p className="text-lg font-bold">{formatCurrency(selectedPembayaran.jumlah)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bukti Transfer
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, maksimal 5MB
                </p>
              </div>

              {buktiFile && (
                <div>
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <Image
                    src={URL.createObjectURL(buktiFile)}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={closeUploadModal}
            disabled={uploading}
          >
            Batal
          </Button>
          <Button
            color="blue"
            onClick={handleUploadBukti}
            disabled={!buktiFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Mengupload...
              </>
            ) : (
              "Upload Bukti"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
