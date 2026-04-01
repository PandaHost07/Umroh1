"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button, Badge, Spinner, Modal, Label, TextInput } from "flowbite-react";
import { HiUpload, HiEye, HiUser, HiDocumentText, HiStar, HiPencil, HiCamera } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Image from "next/image";

const JENIS_DOKUMEN = ["PASPOR", "KTP", "FOTO", "VAKSIN", "VISA"];
const STATUS_COLOR = { MENUNGGU: "warning", DISETUJUI: "success", DITOLAK: "failure" };

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState("profil");
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [savingProfil, setSavingProfil] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDokumen, setSelectedDokumen] = useState(null);
  const [dokumenFile, setDokumenFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showTestimoniModal, setShowTestimoniModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [pesan, setPesan] = useState("");
  const [submittingTestimoni, setSubmittingTestimoni] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setNama(session.user.nama || "");
      setTelepon(session.user.telepon || "");
    }
  }, [session]);

  const fetchPendaftaran = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session.user.email}`);
      const data = await res.json();
      if (res.ok) setPendaftaranList(data);
    } catch {}
    finally { setLoading(false); }
  }, [session?.user?.email]);

  useEffect(() => { fetchPendaftaran(); }, [fetchPendaftaran]);

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alertError("Foto maksimal 2MB"); return; }
    if (!file.type.startsWith("image/")) { alertError("File harus berupa gambar"); return; }

    setFotoPreview(URL.createObjectURL(file));
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", session.user.email);
      const res = await fetch("/api/jamaah/upload-foto", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload foto");
      alertSuccess("Foto profil berhasil diperbarui!");
      await update(); // refresh session
    } catch (err) { alertError(err.message); setFotoPreview(null); }
    finally { setUploadingFoto(false); }
  };

  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setSavingProfil(true);
    try {
      const res = await fetch(`/api/system/akun?email=${session?.user?.email}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, telepon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      alertSuccess("Profil berhasil diperbarui!");
      setEditMode(false);
      await update();
    } catch (err) { alertError(err.message); }
    finally { setSavingProfil(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { alertError("Password tidak cocok"); return; }
    if (newPass.length < 6) { alertError("Password minimal 6 karakter"); return; }
    setSavingPass(true);
    try {
      const res = await fetch(`/api/system/akun?email=${session?.user?.email}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal ganti password");
      alertSuccess("Password berhasil diubah!");
      setNewPass(""); setConfirmPass("");
    } catch (err) { alertError(err.message); }
    finally { setSavingPass(false); }
  };

  const handleUploadDokumen = async () => {
    if (!dokumenFile || !selectedDokumen) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("dokumen", dokumenFile);
      formData.append("dokumenId", selectedDokumen.isNew
        ? `${selectedDokumen.jenis}|${selectedDokumen.pendaftaranId}|${session.user.email}`
        : selectedDokumen.id
      );
      const res = await fetch("/api/jamaah/upload-dokumen", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload");
      alertSuccess("Dokumen berhasil diupload!");
      setShowUploadModal(false);
      fetchPendaftaran();
    } catch (err) { alertError(err.message); }
    finally { setUploading(false); }
  };

  const handleSubmitTestimoni = async () => {
    if (!pesan.trim() || pesan.trim().length < 10) { alertError("Pesan minimal 10 karakter"); return; }
    setSubmittingTestimoni(true);
    try {
      const res = await fetch("/api/jamaah/testimoni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ akunEmail: session.user.email, rating, pesan: pesan.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");
      alertSuccess("Testimoni berhasil dikirimkan!");
      setShowTestimoniModal(false);
      setRating(5); setPesan("");
    } catch (err) { alertError(err.message); }
    finally { setSubmittingTestimoni(false); }
  };

  const fotoUrl = fotoPreview || session?.user?.gambar || null;

  const TABS = [
    { id: "profil", label: "Data Pribadi", icon: <HiUser /> },
    { id: "dokumen", label: "Dokumen", icon: <HiDocumentText /> },
    { id: "testimoni", label: "Testimoni", icon: <HiStar /> },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile Saya</h1>

      <div className="flex gap-2 border-b overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "profil" && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          {/* Avatar dengan upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 overflow-hidden">
                {fotoUrl ? (
                  <Image src={fotoUrl} alt="foto profil" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <HiUser className="text-blue-400 w-10 h-10" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                {uploadingFoto ? <Spinner size="xs" color="white" /> : <HiCamera className="text-white w-4 h-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
              </label>
            </div>
            <div>
              <p className="font-bold text-lg">{session?.user?.nama || "-"}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Jamaah</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfil} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label value="Nama Lengkap" />
                <TextInput value={nama} onChange={(e) => setNama(e.target.value)} disabled={!editMode} className="mt-1" required />
              </div>
              <div>
                <Label value="Email" />
                <TextInput value={session?.user?.email || ""} disabled className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label value="Nomor Telepon" />
                <TextInput value={telepon} onChange={(e) => setTelepon(e.target.value)} disabled={!editMode} className="mt-1" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <Label value="Jenis Kelamin" />
                <TextInput value={session?.user?.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"} disabled className="mt-1 bg-gray-50" />
              </div>
            </div>
            <div className="flex gap-2">
              {!editMode ? (
                <Button type="button" color="blue" size="sm" onClick={() => setEditMode(true)}>
                  <HiPencil className="mr-1" /> Edit Profil
                </Button>
              ) : (
                <>
                  <Button type="submit" color="blue" size="sm" disabled={savingProfil}>
                    {savingProfil ? <Spinner size="sm" /> : "Simpan"}
                  </Button>
                  <Button type="button" color="gray" size="sm" onClick={() => { setEditMode(false); setNama(session?.user?.nama || ""); setTelepon(session?.user?.telepon || ""); }}>
                    Batal
                  </Button>
                </>
              )}
            </div>
          </form>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-sm">Ganti Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <div>
                <Label value="Password Baru" />
                <TextInput type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label value="Konfirmasi Password" />
                <TextInput type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required className="mt-1" />
              </div>
              <Button type="submit" color="blue" size="sm" disabled={savingPass}>
                {savingPass ? <Spinner size="sm" /> : "Ganti Password"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {tab === "dokumen" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size="xl" /></div>
          ) : pendaftaranList.filter(p => p.status !== "TIDAK_TERKONFIRMASI").length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
              Belum ada pemesanan paket aktif.
            </div>
          ) : (
            pendaftaranList.filter(p => p.status !== "TIDAK_TERKONFIRMASI").map((pendaftaran) => (
              <div key={pendaftaran.id} className="bg-white rounded-xl border p-5">
                <h3 className="font-bold mb-1">{pendaftaran.paket?.nama}</h3>
                <p className="text-xs text-gray-400 mb-4">Upload dokumen persyaratan umrah</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {JENIS_DOKUMEN.map((jenis) => {
                    const dok = pendaftaran.dokumen?.find((d) => d.jenis === jenis);
                    return (
                      <div key={jenis} className="border rounded-lg p-3 text-center">
                        <p className="font-semibold text-xs mb-2">{jenis}</p>
                        {dok ? (
                          <div className="space-y-1">
                            <Badge color={STATUS_COLOR[dok.status] ?? "gray"} size="xs" className="mx-auto">{dok.status}</Badge>
                            <div className="flex gap-1 justify-center mt-2">
                              {dok.url && <Button size="xs" color="light" onClick={() => window.open(dok.url, "_blank")}><HiEye size={11} /></Button>}
                              <Button size="xs" color="blue" onClick={() => { setSelectedDokumen(dok); setDokumenFile(null); setShowUploadModal(true); }}>
                                <HiUpload size={11} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="xs" color="blue" className="w-full mt-2" onClick={() => { setSelectedDokumen({ jenis, pendaftaranId: pendaftaran.id, isNew: true }); setDokumenFile(null); setShowUploadModal(true); }}>
                            <HiUpload size={11} className="mr-1" /> Upload
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "testimoni" && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <div className="text-5xl mb-3">⭐</div>
          <h3 className="text-xl font-semibold mb-2">Bagikan Pengalaman Anda</h3>
          <p className="text-gray-500 text-sm mb-6">Ceritakan pengalaman ibadah umrah Anda</p>
          <Button color="blue" onClick={() => setShowTestimoniModal(true)}>Tulis Testimoni</Button>
        </div>
      )}

      {/* Modal Upload Dokumen */}
      <Modal show={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <Modal.Header>Upload Dokumen {selectedDokumen?.jenis}</Modal.Header>
        <Modal.Body>
          <div className="space-y-3">
            <input type="file" accept="image/*,.pdf" onChange={(e) => setDokumenFile(e.target.files[0])} className="w-full border border-gray-300 rounded p-2 text-sm" />
            <p className="text-xs text-gray-400">Format: JPG, PNG, PDF — maks. 5MB</p>
            {dokumenFile && dokumenFile.type.startsWith("image/") && (
              <img src={URL.createObjectURL(dokumenFile)} alt="preview" className="w-full h-40 object-cover rounded" />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowUploadModal(false)} disabled={uploading}>Batal</Button>
          <Button color="blue" onClick={handleUploadDokumen} disabled={!dokumenFile || uploading}>
            {uploading ? <Spinner size="sm" /> : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Testimoni */}
      <Modal show={showTestimoniModal} onClose={() => setShowTestimoniModal(false)}>
        <Modal.Header>Tulis Testimoni</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label value="Rating" />
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}>
                    <FaStar size={28} className={s <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label value="Pesan Testimoni" />
              <textarea rows={4} value={pesan} onChange={(e) => setPesan(e.target.value)} placeholder="Ceritakan pengalaman ibadah umrah Anda..." className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
              <p className="text-xs text-gray-400 mt-1">{pesan.length} karakter (min. 10)</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowTestimoniModal(false)} disabled={submittingTestimoni}>Batal</Button>
          <Button color="blue" onClick={handleSubmitTestimoni} disabled={submittingTestimoni}>
            {submittingTestimoni ? <Spinner size="sm" /> : "Kirim Testimoni"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
