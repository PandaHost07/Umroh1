"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, Button, Alert, Spinner, Modal, Tabs } from "flowbite-react";
import { HiUpload, HiEye, HiUser, HiDocumentText, HiStar } from "react-icons/hi";
import formatDate from "@/components/Date/formatDate";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDokumen, setSelectedDokumen] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dokumenFile, setDokumenFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [testimoniForm, setTestimoniForm] = useState({
    rating: 5,
    pesan: ""
  });
  const [showTestimoniModal, setShowTestimoniModal] = useState(false);
  const [submittingTestimoni, setSubmittingTestimoni] = useState(false);

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
      case "DISETUJUI": return "green";
      case "DITOLAK": return "red";
      default: return "gray";
    }
  };

  const openUploadModal = (dokumen) => {
    setSelectedDokumen(dokumen);
    setShowUploadModal(true);
    setDokumenFile(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedDokumen(null);
    setDokumenFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("Ukuran file maksimal 5MB");
        return;
      }
      setDokumenFile(file);
    }
  };

  const handleUploadDokumen = async () => {
    if (!dokumenFile || !selectedDokumen) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append('dokumen', dokumenFile);
      
      if (selectedDokumen.isNew) {
        // Untuk dokumen baru
        formData.append('dokumenId', `${selectedDokumen.jenis}|${selectedDokumen.pendaftaranId}|${selectedDokumen.akunEmail}`);
      } else {
        // Untuk update dokumen existing
        formData.append('dokumenId', selectedDokumen.id);
      }

      const res = await fetch('/api/jamaah/upload-dokumen', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal upload dokumen");
      }

      setSuccess("Dokumen berhasil diupload!");
      closeUploadModal();
      fetchPendaftaran();

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTestimoni = async () => {
    if (!testimoniForm.pesan.trim()) {
      setError("Pesan testimoni tidak boleh kosong");
      return;
    }

    setSubmittingTestimoni(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch('/api/jamaah/testimoni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          akunEmail: session.user.email,
          ...testimoniForm
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim testimoni");
      }

      setSuccess("Testimoni berhasil dikirim!");
      setShowTestimoniModal(false);
      setTestimoniForm({ rating: 5, pesan: "" });

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingTestimoni(false);
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
        <h1 className="text-3xl font-bold">Profile Saya</h1>
        <p className="text-gray-600 mt-2">Kelola data pribadi dan dokumen persyaratan</p>
      </div>

      {error && <Alert color="failure" className="mb-4">{error}</Alert>}
      {success && <Alert color="success" className="mb-4">{success}</Alert>}

      <Tabs.Group onActiveTabChange={setActiveTab}>
        <Tabs.Item active={activeTab === "profile"} title="Data Pribadi" icon={HiUser}>
          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Informasi Akun</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={session?.user?.nama || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <input
                    type="text"
                    value={session?.user?.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan" || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={session?.user?.telepon || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button color="blue">
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Item>

        <Tabs.Item active={activeTab === "dokumen"} title="Dokumen" icon={HiDocumentText}>
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
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{pendaftaran.paket.nama}</h3>
                    <p className="text-gray-600 text-sm">Upload dokumen persyaratan</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {["PASPOR", "KTP", "FOTO", "VAKSIN", "VISA"].map((jenisDokumen) => {
                      const dokumen = pendaftaran.dokumen.find(d => d.jenis === jenisDokumen);
                      
                      return (
                        <div key={jenisDokumen} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{jenisDokumen}</h4>
                            {dokumen && (
                              <Badge color={getStatusColor(dokumen.status)} size="sm">
                                {dokumen.status}
                              </Badge>
                            )}
                          </div>
                          
                          {dokumen ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                Upload: {formatDate(dokumen.created, "short")}
                              </p>
                              {dokumen.url && (
                                <Button
                                  size="xs"
                                  color="light"
                                  onClick={() => window.open(dokumen.url, '_blank')}
                                >
                                  <HiEye className="mr-1" />
                                  Lihat
                                </Button>
                              )}
                              {dokumen.status === "MENUNGGU" && (
                                <Button
                                  size="xs"
                                  color="blue"
                                  onClick={() => openUploadModal(dokumen)}
                                >
                                  <HiUpload className="mr-1" />
                                  Ganti
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              color="blue"
                              onClick={() => openUploadModal({ 
                                jenis: jenisDokumen, 
                                pendaftaranId: pendaftaran.id,
                                akunEmail: session.user.email,
                                isNew: true
                              })}
                            >
                              <HiUpload className="mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📋 Panduan Upload Dokumen:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Paspor: Masih berlaku minimal 6 bulan</li>
                      <li>• KTP: Foto jelas, semua informasi terbaca</li>
                      <li>• Foto: Background putih, wajah jelas</li>
                      <li>• Vaksin: Sertifikat vaksin terakhir</li>
                      <li>• Visa: Jika sudah ada</li>
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Tabs.Item>

        <Tabs.Item active={activeTab === "testimoni"} title="Testimoni" icon={HiStar}>
          <Card>
            <div className="text-center py-8">
              <HiStar className="text-6xl text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bagikan Pengalaman Anda</h3>
              <p className="text-gray-600 mb-4">
                Ceritakan pengalaman ibadah umrah Anda dan bantu jamaah lain
              </p>
              <Button 
                color="blue"
                onClick={() => setShowTestimoniModal(true)}
              >
                Tulis Testimoni
              </Button>
            </div>
          </Card>
        </Tabs.Item>
      </Tabs.Group>

      {/* Modal Upload Dokumen */}
      <Modal show={showUploadModal} onClose={closeUploadModal}>
        <Modal.Header>
          Upload Dokumen {selectedDokumen?.jenis}
        </Modal.Header>
        <Modal.Body>
          {selectedDokumen && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File {selectedDokumen.jenis}
                </label>
                <input
                  type="file"
                  accept={selectedDokumen.jenis === "FOTO" ? "image/*" : "image/*,.pdf"}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, PDF (maksimal 5MB)
                </p>
              </div>

              {dokumenFile && (
                <div>
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  {dokumenFile.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(dokumenFile)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-lg text-center">
                      <p className="text-sm text-gray-600">{dokumenFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(dokumenFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
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
            onClick={handleUploadDokumen}
            disabled={!dokumenFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Mengupload...
              </>
            ) : (
              "Upload Dokumen"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Testimoni */}
      <Modal show={showTestimoniModal} onClose={() => setShowTestimoniModal(false)}>
        <Modal.Header>Tulis Testimoni</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTestimoniForm(prev => ({ ...prev, rating: star }))}
                    className="text-3xl focus:outline-none"
                  >
                    <span className={star <= testimoniForm.rating ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pesan Testimoni
              </label>
              <textarea
                rows={4}
                value={testimoniForm.pesan}
                onChange={(e) => setTestimoniForm(prev => ({ ...prev, pesan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bagikan pengalaman ibadah umrah Anda..."
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => setShowTestimoniModal(false)}
            disabled={submittingTestimoni}
          >
            Batal
          </Button>
          <Button
            color="blue"
            onClick={handleSubmitTestimoni}
            disabled={submittingTestimoni}
          >
            {submittingTestimoni ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Mengirim...
              </>
            ) : (
              "Kirim Testimoni"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
