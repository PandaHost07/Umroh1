"use client";
import { useEffect, useState } from "react";
import { Button, Modal, Label, TextInput, Textarea, Spinner, Select } from "flowbite-react";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const EMPTY = { nama: "", bintang: "", lokasi: "", alamat: "", petaUrl: "", deskripsi: "" };

export default function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/hotel");
      const data = await res.json();
      setHotels(Array.isArray(data) ? data : []);
    } catch { alertError("Gagal memuat data hotel"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHotels(); }, []);

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (h) => {
    setEditId(h.id);
    setForm({ nama: h.nama, bintang: h.bintang ?? "", lokasi: h.lokasi, alamat: h.alamat ?? "", petaUrl: h.petaUrl ?? "", deskripsi: h.deskripsi ?? "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Hotel?",
      text: "Data hotel ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/system/delete?model=hotel&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      alertSuccess("Hotel dihapus");
      fetchHotels();
    } catch (err) { alertError(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.lokasi) { alertError("Nama dan lokasi wajib diisi"); return; }
    setSaving(true);
    try {
      const payload = { ...form, bintang: form.bintang ? parseInt(form.bintang) : null };
      if (editId) payload.id = editId;
      const res = await fetch("/api/system/hotel", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      alertSuccess(editId ? "Hotel diperbarui" : "Hotel ditambahkan");
      setShowModal(false);
      fetchHotels();
    } catch (err) { alertError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}>Tambah Hotel</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : hotels.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Belum ada data hotel.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>{["Nama", "Bintang", "Lokasi", "Alamat", "Aksi"].map(h => <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{h.nama}</td>
                  <td className="px-4 py-2">{h.bintang ? "⭐".repeat(h.bintang) : "-"}</td>
                  <td className="px-4 py-2">{h.lokasi}</td>
                  <td className="px-4 py-2">{h.alamat || "-"}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="xs" color="blue" onClick={() => openEdit(h)}><FaEdit /></Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(h.id)}><FaTrash /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <form onSubmit={handleSubmit}>
          <Modal.Header>{editId ? "Edit Hotel" : "Tambah Hotel"}</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div><Label value="Nama Hotel *" /><TextInput name="nama" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label value="Bintang" />
                  <Select value={form.bintang} onChange={e => setForm({...form, bintang: e.target.value})}>
                    <option value="">Pilih</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Bintang</option>)}
                  </Select>
                </div>
                <div>
                  <Label value="Lokasi *" />
                  <Select value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} required>
                    <option value="">Pilih</option>
                    <option value="MEKKAH">Mekkah</option>
                    <option value="MADINAH">Madinah</option>
                  </Select>
                </div>
              </div>
              <div><Label value="Alamat" /><TextInput value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} /></div>
              <div><Label value="URL Peta" /><TextInput value={form.petaUrl} onChange={e => setForm({...form, petaUrl: e.target.value})} placeholder="https://maps.google.com/..." /></div>
              <div><Label value="Deskripsi" /><Textarea rows={3} value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} /></div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button color="gray" onClick={() => setShowModal(false)}>Batal</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
