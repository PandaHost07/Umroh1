"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Badge, Button, Spinner, Modal, Label, TextInput, FileInput } from "flowbite-react";
import { useEffect, useState } from "react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import { HiOutlineCreditCard, HiEye } from "react-icons/hi";
import Image from "next/image";

const STATUS_COLOR = { MENUNGGU: "warning", TERVERIFIKASI: "success", DITOLAK: "failure" };
const JENIS_LABEL = { DP: "DP (30%)", CICILAN_1: "Cicilan (30%)", PELUNASAN: "Pelunasan (40%)" };

export default function PembayaranAdminPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("MENUNGGU");
  const [validating, setValidating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPendaftaranId, setSelectedPendaftaranId] = useState(null);
  const [form, setForm] = useState({ jumlah: "", file: null });
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/pembayaran");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch { alertError("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleValidasi = async (id, status) => {
    if (!confirm(`${status === "TERVERIFIKASI" ? "Verifikasi" : "Tolak"} pembayaran ini?`)) return;
    setValidating(id);
    try {
      const res = await fetch("/api/system/pembayaran", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      alertSuccess(status === "TERVERIFIKASI" ? "Pembayaran diverifikasi" : "Pembayaran ditolak");
      fetchData();
    } catch (err) { alertError(err.message); }
    finally { setValidating(null); }
  };

  const handleTambah = async (e) => {
    e.preventDefault();
    if (!form.jumlah || !selectedPendaftaranId) return;
    setSaving(true);
    try {
      const body = new FormData();
      body.append("form", JSON.stringify({ pendaftaranId: selectedPendaftaranId, jumlah: Number(form.jumlah) }));
      if (form.file) body.append("file", form.file);
      const res = await fetch("/api/system/pembayaran", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      alertSuccess("Pembayaran ditambahkan");
      setShowModal(false);
      setForm({ jumlah: "", file: null });
      fetchData();
    } catch (err) { alertError(err.message); }
    finally { setSaving(false); }
  };

  const filtered = filter === "ALL" ? list : list.filter((p) => p.status === filter);

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HiOutlineCreditCard className="text-blue-600" size={22} />
          Kelola Pembayaran
        </h2>
        <span className="text-sm text-gray-500">{filtered.length} data</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["ALL", "Semua"], ["MENUNGGU", "Menunggu"], ["TERVERIFIKASI", "Terverifikasi"], ["DITOLAK", "Ditolak"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {label} ({val === "ALL" ? list.length : list.filter(p => p.status === val).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Tidak ada data pembayaran.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>{["Jamaah", "Paket", "Jenis", "Jumlah", "Bukti", "Status", "Tgl", "Aksi"].map(h => (
                <th key={h} className="px-3 py-2 font-semibold text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.pendaftaran?.akun?.nama || "-"}</div>
                    <div className="text-xs text-gray-400">{p.pendaftaran?.akunEmail}</div>
                  </td>
                  <td className="px-3 py-2 max-w-[130px]"><span className="line-clamp-2 text-xs">{p.pendaftaran?.paket?.nama || "-"}</span></td>
                  <td className="px-3 py-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{JENIS_LABEL[p.jenis] || p.jenis || "-"}</span></td>
                  <td className="px-3 py-2 font-semibold">{formatCurrency(p.jumlah)}</td>
                  <td className="px-3 py-2">
                    {p.buktiUrl ? (
                      <button onClick={() => setPreviewUrl(p.buktiUrl)} className="text-blue-600 underline text-xs flex items-center gap-1">
                        <HiEye size={14} /> Lihat
                      </button>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2"><Badge color={STATUS_COLOR[p.status] ?? "gray"} size="sm">{p.status}</Badge></td>
                  <td className="px-3 py-2 text-xs text-gray-500">{formatDate(p.created, "short")}</td>
                  <td className="px-3 py-2">
                    {p.status === "MENUNGGU" && (
                      <div className="flex gap-1">
                        <Button size="xs" color="success" disabled={validating === p.id} onClick={() => handleValidasi(p.id, "TERVERIFIKASI")}>
                          {validating === p.id ? <Spinner size="sm" /> : "✓"}
                        </Button>
                        <Button size="xs" color="failure" disabled={validating === p.id} onClick={() => handleValidasi(p.id, "DITOLAK")}>✗</Button>
                      </div>
                    )}
                    {p.status !== "MENUNGGU" && <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview bukti modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-[90vw] max-w-lg h-[70vh] rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Image src={previewUrl} alt="Bukti Pembayaran" fill className="object-contain" />
            <button onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center">✕</button>
          </div>
        </div>
      )}
    </AdminContainer>
  );
}
