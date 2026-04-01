"use client";
import { useEffect, useState } from "react";
import { Button, Modal, Label, TextInput, Textarea, Spinner } from "flowbite-react";
import { HiSpeakerphone } from "react-icons/hi";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import formatDate from "@/components/Date/formatDate";
import AdminContainer from "@/components/Container/adminContainer";

export default function AnnouncementPage({ paketId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ judul: "", isi: "", tanggalMulai: "", tanggalSelesai: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/pengumuman");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat pengumuman");
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      const res = await fetch(`/api/system/delete?model=pengumuman&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      alertSuccess("Pengumuman dihapus");
      fetchData();
    } catch (err) {
      alertError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/system/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.judul,
          content: form.isi,
          startDate: form.tanggalMulai,
          endDate: form.tanggalSelesai || null,
          pendaftaranId: paketId || "global",
          createdById: "admin-operasional",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      alertSuccess("Pengumuman berhasil ditambahkan");
      setModalOpen(false);
      setForm({ judul: "", isi: "", tanggalMulai: "", tanggalSelesai: "" });
      fetchData();
    } catch (err) {
      alertError(err.message);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <HiSpeakerphone className="text-blue-600" size={22} />
          Pengumuman Jamaah
        </h3>
        <Button size="sm" onClick={() => setModalOpen(true)}>Tambah Pengumuman</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Belum ada pengumuman.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Judul", "Isi", "Tgl Mulai", "Tgl Selesai", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-2 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{a.judul}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{a.isi}</td>
                  <td className="px-4 py-2">{formatDate(a.tanggalMulai, "short")}</td>
                  <td className="px-4 py-2">{a.tanggalSelesai ? formatDate(a.tanggalSelesai, "short") : "-"}</td>
                  <td className="px-4 py-2">
                    <Button color="failure" size="xs" onClick={() => handleDelete(a.id)}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Modal.Header>Tambah Pengumuman</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label value="Judul" />
                <TextInput value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
              </div>
              <div>
                <Label value="Isi Pengumuman" />
                <Textarea rows={4} value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label value="Tanggal Mulai" />
                  <TextInput type="date" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} required />
                </div>
                <div>
                  <Label value="Tanggal Selesai (Opsional)" />
                  <TextInput type="date" value={form.tanggalSelesai} onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })} />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Simpan</Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>Batal</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </AdminContainer>
  );
}
