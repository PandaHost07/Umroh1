"use client";
import { useState, useEffect } from "react";
import AdminContainer from "@/components/Container/adminContainer";
import { TableComponent } from "@/components/Table/table";
import { Button, Modal, Label, TextInput } from "flowbite-react";
import { FaPlus } from "react-icons/fa";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";

export default function KelolaMitra() {
  const [data, setData] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ id: "", nama: "", telepon: "", alamat: "", layanan: "" });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/system/mitra");
      const json = await res.json();
      if (json.success) {
        setData(json.mitra.map((m, i) => ({
          no: i + 1, id: m.id, nama: m.nama,
          telepon: m.telepon || "-", alamat: m.alamat || "-", layanan: m.layanan || "-",
        })));
      }
    } catch { alertError("Gagal memuat data mitra"); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch("/api/system/mitra", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan mitra");
      alertSuccess(isEdit ? "Mitra berhasil diperbarui" : "Mitra berhasil ditambahkan");
      setOpenModal(false);
      fetchData();
    } catch (err) { alertError(err.message); }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Hapus Mitra?",
      text: `Hapus mitra "${item.nama}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/system/mitra?id=${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus mitra");
      alertSuccess("Mitra berhasil dihapus");
      fetchData();
    } catch (err) { alertError(err.message); }
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, nama: item.nama,
      telepon: item.telepon !== "-" ? item.telepon : "",
      alamat: item.alamat !== "-" ? item.alamat : "",
      layanan: item.layanan !== "-" ? item.layanan : "",
    });
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setFormData({ id: "", nama: "", telepon: "", alamat: "", layanan: "" });
    setIsEdit(false);
    setOpenModal(true);
  };

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Data Mitra (Partner)</h2>
        <Button onClick={handleAdd} color="blue">
          <FaPlus className="mr-2" /> Tambah Mitra
        </Button>
      </div>

      {data && (
        <TableComponent data={data} searchColumn="nama" editFunct={handleEdit} delFunct={handleDelete} />
      )}

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={handleSubmit}>
          <Modal.Header>{isEdit ? "Edit Mitra" : "Tambah Mitra Baru"}</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div><Label value="Nama Perusahaan / Mitra *" /><TextInput name="nama" value={formData.nama} onChange={handleChange} required /></div>
              <div><Label value="Layanan (Contoh: Maskapai, Hotel, Bus)" /><TextInput name="layanan" value={formData.layanan} onChange={handleChange} /></div>
              <div><Label value="Nomor Telepon" /><TextInput name="telepon" value={formData.telepon} onChange={handleChange} /></div>
              <div><Label value="Alamat" /><TextInput name="alamat" value={formData.alamat} onChange={handleChange} /></div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" color="blue">Simpan</Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>Batal</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </AdminContainer>
  );
}
