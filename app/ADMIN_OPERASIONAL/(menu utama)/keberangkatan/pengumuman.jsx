"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  Table,
  Spinner,
  Datepicker,
} from "flowbite-react";
import { HiSpeakerphone } from "react-icons/hi";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import formatDate from "@/components/Date/formatDate";

export default function AnnouncementPage({ userId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/announcement");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memuat data");
      setAnnouncements(result);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus pengumuman ini?")) return;

    try {
      const res = await fetch(`/api/system/delete?model=announcement&id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus data");
      alertSuccess("Pengumuman dihapus");
      fetchData();
    } catch (err) {
      alertError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/system/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdById: userId,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menambah pengumuman");

      alertSuccess("Pengumuman berhasil ditambahkan");
      setModalOpen(false);
      setForm({ title: "", content: "", startDate: "", endDate: "" });
      fetchData();
    } catch (err) {
      alertError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <HiSpeakerphone className="text-blue-600" size={26} />
          Daftar Pengumuman
        </h1>
        <Button onClick={() => setModalOpen(true)}>Tambah Pengumuman</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : announcements.length === 0 ? (
        <div className="text-center text-gray-600 py-10">Belum ada pengumuman</div>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Judul</Table.HeadCell>
            <Table.HeadCell>Isi</Table.HeadCell>
            <Table.HeadCell>Tanggal Mulai</Table.HeadCell>
            <Table.HeadCell>Tanggal Akhir</Table.HeadCell>
            <Table.HeadCell>Aksi</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {announcements.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell>{a.title}</Table.Cell>
                <Table.Cell>{a.content}</Table.Cell>
                <Table.Cell>{formatDate(a.startDate)}</Table.Cell>
                <Table.Cell>{a.endDate ? formatDate(a.endDate) : "-"}</Table.Cell>
                <Table.Cell>
                  <Button color="failure" size="xs" onClick={() => handleDelete(a.id)}>
                    Hapus
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Modal.Header>Tambah Pengumuman</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" value="Judul" />
                <TextInput
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content" value="Isi Pengumuman" />
                <Textarea
                  id="content"
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate" value="Tanggal Mulai" />
                <TextInput
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate" value="Tanggal Akhir (Opsional)" />
                <TextInput
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Simpan</Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>Batal</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
