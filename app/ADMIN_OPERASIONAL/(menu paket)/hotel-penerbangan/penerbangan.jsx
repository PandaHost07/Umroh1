"use client";
import { useEffect, useState } from "react";
import { Button, Modal, Label, TextInput, Spinner } from "flowbite-react";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import { FaEdit, FaTrash } from "react-icons/fa";

const EMPTY = { maskapai: "", bandaraBerangkat: "Raden Intan Lampung", bandaraTiba: "", waktuBerangkat: "", waktuTiba: "" };

const toDatetimeLocal = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

export default function FlightPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/penerbangan");
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
    } catch { alertError("Gagal memuat data penerbangan"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFlights(); }, []);

  const openAdd = () => { setEditId(null); setForm(EMPTY); setError(null); setShowModal(true); };
  const openEdit = (f) => {
    setEditId(f.id);
    setForm({ maskapai: f.maskapai ?? "", bandaraBerangkat: f.bandaraBerangkat ?? "", bandaraTiba: f.bandaraTiba ?? "", waktuBerangkat: toDatetimeLocal(f.waktuBerangkat), waktuTiba: toDatetimeLocal(f.waktuTiba) });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus penerbangan ini?")) return;
    try {
      const res = await fetch(`/api/system/delete?model=penerbangan&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      alertSuccess("Penerbangan dihapus");
      fetchFlights();
    } catch (err) { alertError(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.maskapai || !form.bandaraTiba || !form.waktuBerangkat || !form.waktuTiba) {
      setError("Semua field wajib diisi"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, waktuBerangkat: new Date(form.waktuBerangkat), waktuTiba: new Date(form.waktuTiba) };
      if (editId) payload.id = editId;
      const res = await fetch("/api/system/penerbangan", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      alertSuccess(editId ? "Penerbangan diperbarui" : "Penerbangan ditambahkan");
      setShowModal(false);
      fetchFlights();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const fmt = (iso) => iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "-";

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}>Tambah Penerbangan</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : flights.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Belum ada data penerbangan.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>{["Maskapai", "Bandara Berangkat", "Bandara Tiba", "Waktu Berangkat", "Waktu Tiba", "Aksi"].map(h => <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{f.maskapai || "-"}</td>
                  <td className="px-4 py-2">{f.bandaraBerangkat || "-"}</td>
                  <td className="px-4 py-2">{f.bandaraTiba || "-"}</td>
                  <td className="px-4 py-2">{fmt(f.waktuBerangkat)}</td>
                  <td className="px-4 py-2">{fmt(f.waktuTiba)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="xs" color="blue" onClick={() => openEdit(f)}><FaEdit /></Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(f.id)}><FaTrash /></Button>
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
          <Modal.Header>{editId ? "Edit Penerbangan" : "Tambah Penerbangan"}</Modal.Header>
          <Modal.Body>
            {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
            <div className="space-y-4">
              <div><Label value="Maskapai *" /><TextInput value={form.maskapai} onChange={e => setForm({...form, maskapai: e.target.value})} placeholder="Garuda Indonesia" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label value="Bandara Berangkat *" /><TextInput value={form.bandaraBerangkat} onChange={e => setForm({...form, bandaraBerangkat: e.target.value})} required /></div>
                <div><Label value="Bandara Tiba *" /><TextInput value={form.bandaraTiba} onChange={e => setForm({...form, bandaraTiba: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label value="Waktu Berangkat *" /><TextInput type="datetime-local" value={form.waktuBerangkat} onChange={e => setForm({...form, waktuBerangkat: e.target.value})} required /></div>
                <div><Label value="Waktu Tiba *" /><TextInput type="datetime-local" value={form.waktuTiba} onChange={e => setForm({...form, waktuTiba: e.target.value})} required /></div>
              </div>
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
