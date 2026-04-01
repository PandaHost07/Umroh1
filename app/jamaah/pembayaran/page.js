"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Badge, Button, Spinner, Modal } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiUpload, HiEye, HiOutlineClipboardList, HiX } from "react-icons/hi";
import Image from "next/image";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";

// Info rekening bank pembayaran
const REKENING_BANK = [
  { bank: "BCA", noRek: "8905637289", atas: "Andi Wahyudi", logo: "🏦" },
  { bank: "BRI", noRek: "0123456789", atas: "Andi Wahyudi", logo: "🏦" },
  { bank: "Mandiri", noRek: "1234567890", atas: "Andi Wahyudi", logo: "🏦" },
  { bank: "BNI", noRek: "9876543210", atas: "Andi Wahyudi", logo: "🏦" },
];

const STATUS_COLOR = { MENUNGGU: "warning", TERVERIFIKASI: "success", DITOLAK: "failure" };
const JENIS_LABEL = { DP: "Uang Muka (30%)", CICILAN_1: "Cicilan ke-2 (30%)", PELUNASAN: "Pelunasan (40%)" };
const JENIS_ORDER = { DP: 1, CICILAN_1: 2, PELUNASAN: 3 };

export default function PembayaranPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [buktiFile, setBuktiFile] = useState(null);
  const [cancelling, setCancelling] = useState(null);

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

  const getDeadlineText = (jenis, tanggalBerangkat) => {
    const berangkat = new Date(tanggalBerangkat);
    if (jenis === "DP") return "Dalam 24 jam setelah pesan";
    if (jenis === "CICILAN_1") {
      const d = new Date(berangkat); d.setDate(d.getDate() - 60);
      return `Sebelum ${d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    }
    if (jenis === "PELUNASAN") {
      const d = new Date(berangkat); d.setDate(d.getDate() - 30);
      return `Sebelum ${d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    }
    return "";
  };

  const openUpload = (pembayaran) => {
    setSelectedPembayaran(pembayaran);
    setBuktiFile(null);
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!buktiFile || !selectedPembayaran) return;
    if (buktiFile.size > 5 * 1024 * 1024) { alertError("Ukuran file maksimal 5MB"); return; }
    if (!buktiFile.type.startsWith("image/")) { alertError("File harus berupa gambar"); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("bukti", buktiFile);
      formData.append("pembayaranId", selectedPembayaran.id);
      const res = await fetch("/api/jamaah/upload-bukti", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload");
      alertSuccess("Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.");
      setShowUploadModal(false);
      fetchPendaftaran();
    } catch (err) { alertError(err.message); }
    finally { setUploading(false); }
  };

  const handleCancel = async (pendaftaran) => {
    const hasVerified = pendaftaran.pembayaran?.some((p) => p.status === "TERVERIFIKASI");
    if (hasVerified) { alertError("Tidak bisa dibatalkan karena sudah ada pembayaran terverifikasi."); return; }

    const result = await Swal.fire({
      title: "Batalkan Pesanan?",
      text: `Batalkan pesanan paket "${pendaftaran.paket?.nama}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Tidak",
    });
    if (!result.isConfirmed) return;

    setCancelling(pendaftaran.id);
    try {
      const res = await fetch("/api/jamaah/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId: pendaftaran.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan");
      alertSuccess("Pesanan berhasil dibatalkan.");
      fetchPendaftaran();
    } catch (err) { alertError(err.message); }
    finally { setCancelling(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HiOutlineClipboardList className="text-blue-600" />
        Pembayaran
      </h1>

      {/* Info Rekening Bank */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-bold text-blue-800 mb-3">📋 Rekening Pembayaran Ada Tour Travel</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REKENING_BANK.map((r) => (
            <div key={r.bank} className="bg-white rounded-lg p-3 border border-blue-100 text-center">
              <div className="text-2xl mb-1">{r.logo}</div>
              <div className="font-bold text-blue-700">{r.bank}</div>
              <div className="font-mono text-sm font-semibold mt-1">{r.noRek}</div>
              <div className="text-xs text-gray-500 mt-0.5">a.n {r.atas}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-3">
          ⚠️ Setelah transfer, upload bukti pembayaran di bawah untuk diverifikasi admin.
        </p>
      </div>

      {pendaftaranList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <p className="text-gray-500 mb-4">Belum ada pemesanan paket.</p>
          <Button color="blue" onClick={() => router.push("/jamaah")}>Lihat Paket</Button>
        </div>
      ) : (
        pendaftaranList.map((pendaftaran) => {
          const sudahBayar = pendaftaran.pembayaran
            ?.filter((p) => p.status === "TERVERIFIKASI")
            .reduce((s, p) => s + p.jumlah, 0) ?? 0;
          const sisaBayar = (pendaftaran.paket?.harga ?? 0) - sudahBayar;
          const bisaCancel = pendaftaran.status !== "TIDAK_TERKONFIRMASI" &&
            !pendaftaran.pembayaran?.some((p) => p.status === "TERVERIFIKASI");

          return (
            <div key={pendaftaran.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{pendaftaran.paket?.nama}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>Berangkat: {formatDate(pendaftaran.paket?.tanggalBerangkat, "short")}</span>
                    <span>Pulang: {formatDate(pendaftaran.paket?.tanggalPulang, "short")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={pendaftaran.status === "TERKONFIRMASI" ? "success" : pendaftaran.status === "TIDAK_TERKONFIRMASI" ? "failure" : "warning"} size="sm">
                    {pendaftaran.status}
                  </Badge>
                  {bisaCancel && (
                    <Button size="xs" color="failure" disabled={cancelling === pendaftaran.id}
                      onClick={() => handleCancel(pendaftaran)}>
                      {cancelling === pendaftaran.id ? <Spinner size="sm" /> : <><HiX size={12} className="mr-1" />Batalkan</>}
                    </Button>
                  )}
                </div>
              </div>

              {/* Ringkasan keuangan */}
              <div className="grid grid-cols-3 divide-x border-b text-center text-sm">
                <div className="p-3">
                  <p className="text-gray-500 text-xs">Total Harga</p>
                  <p className="font-bold text-gray-800">{formatCurrency(pendaftaran.paket?.harga ?? 0)}</p>
                </div>
                <div className="p-3">
                  <p className="text-gray-500 text-xs">Sudah Dibayar</p>
                  <p className="font-bold text-green-600">{formatCurrency(sudahBayar)}</p>
                </div>
                <div className="p-3">
                  <p className="text-gray-500 text-xs">Sisa Pembayaran</p>
                  <p className={`font-bold ${sisaBayar > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {formatCurrency(sisaBayar)}
                  </p>
                </div>
              </div>

              {/* Jadwal pembayaran */}
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Jadwal Pembayaran</h4>
                {(pendaftaran.pembayaran ?? [])
                  .sort((a, b) => (JENIS_ORDER[a.jenis] ?? 9) - (JENIS_ORDER[b.jenis] ?? 9))
                  .map((p, idx) => (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 bg-gray-50 ${
                      p.status === "TERVERIFIKASI" ? "border-l-green-500" :
                      p.status === "DITOLAK" ? "border-l-red-500" : "border-l-blue-400"
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{JENIS_LABEL[p.jenis] || p.jenis}</span>
                          <Badge color={STATUS_COLOR[p.status] ?? "gray"} size="xs">{p.status}</Badge>
                          {idx === 0 && p.status === "MENUNGGU" && !p.buktiUrl && (
                            <Badge color="failure" size="xs">Segera Bayar</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                          <span>{formatCurrency(p.jumlah)}</span>
                          <span>•</span>
                          <span>{getDeadlineText(p.jenis, pendaftaran.paket?.tanggalBerangkat)}</span>
                        </div>
                        {p.buktiUrl && (
                          <button onClick={() => window.open(p.buktiUrl, "_blank")}
                            className="text-xs text-blue-600 underline mt-1 flex items-center gap-1">
                            <HiEye size={12} /> Lihat bukti
                          </button>
                        )}
                      </div>
                      <div className="ml-3">
                        {p.status === "TERVERIFIKASI" ? (
                          <span className="text-green-600 text-xs font-medium">✓ Lunas</span>
                        ) : p.status === "DITOLAK" ? (
                          <Button size="xs" color="warning" onClick={() => openUpload(p)}>
                            <HiUpload size={12} className="mr-1" /> Upload Ulang
                          </Button>
                        ) : (
                          <Button size="xs" color="blue" onClick={() => openUpload(p)}>
                            <HiUpload size={12} className="mr-1" /> Upload Bukti
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })
      )}

      {/* Modal Upload */}
      <Modal show={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <Modal.Header>Upload Bukti Pembayaran</Modal.Header>
        <Modal.Body>
          {selectedPembayaran && (
            <div className="space-y-4">
              {/* Info rekening */}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-800 mb-2">Transfer ke salah satu rekening:</p>
                {REKENING_BANK.map((r) => (
                  <div key={r.bank} className="flex justify-between text-sm py-1 border-b border-blue-100 last:border-0">
                    <span className="font-medium text-blue-700">{r.bank}</span>
                    <span className="font-mono">{r.noRek} a.n {r.atas}</span>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-yellow-800">Jumlah yang harus ditransfer:</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{formatCurrency(selectedPembayaran.jumlah)}</p>
                <p className="text-xs text-yellow-600 mt-1">{JENIS_LABEL[selectedPembayaran.jenis]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bukti Transfer</label>
                <input type="file" accept="image/*" onChange={(e) => setBuktiFile(e.target.files[0])}
                  className="w-full border border-gray-300 rounded p-2 text-sm" />
                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG — maks. 5MB</p>
              </div>
              {buktiFile && (
                <Image src={URL.createObjectURL(buktiFile)} alt="preview" width={400} height={200}
                  className="w-full h-40 object-cover rounded-lg" />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowUploadModal(false)} disabled={uploading}>Batal</Button>
          <Button color="blue" onClick={handleUpload} disabled={!buktiFile || uploading}>
            {uploading ? <Spinner size="sm" /> : "Upload Bukti"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
