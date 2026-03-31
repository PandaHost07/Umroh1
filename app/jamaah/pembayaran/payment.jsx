"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Table,
  Modal,
  Label,
  TextInput,
  FileInput,
} from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { HiOutlineCreditCard } from "react-icons/hi";
import { alertError, alertSuccess } from "@/components/Alert/alert";

export default function PaymentListPage({ registrationId, role = "JAMAAH" }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pendaftaranId: registrationId,
    jumlah: "",
    file: null,
  });
  const [loadingValidationId, setLoadingValidationId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/pembayaran?pendaftaranId=${registrationId}`);
      const data = await res.json();
      console.log(data);
      
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data pembayaran");
      setPayments(data);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (registrationId) {
      fetchPayments();
    }
  }, [registrationId]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus pembayaran ini?")) return;

    try {
      const res = await fetch(`/api/system/delete?model=pembayaran&&id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pembayaran");

      alertSuccess("Pembayaran berhasil dihapus");
      fetchPayments();
    } catch (err) {
      alertError(err.message);
    }
  };

  const handleValidation = async (id) => {
    if (!confirm("Validasi pembayaran ini?")) return;

    try {
      setLoadingValidationId(id);
      const res = await fetch("/api/system/pembayaran", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: "TERVERIFIKASI" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memvalidasi pembayaran");

      alertSuccess("Pembayaran berhasil divalidasi");
      fetchPayments();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoadingValidationId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = new FormData();
      body.append(
        "form",
        JSON.stringify({
          pendaftaranId: formData.pendaftaranId,
          jumlah: Number(formData.jumlah),
        })
      );

      if (formData.file) {
        body.append("file", formData.file);
      }

      const res = await fetch("/api/system/pembayaran", {
        method: "POST",
        body,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menyimpan pembayaran");

      alertSuccess("Pembayaran berhasil ditambahkan");
      setModalOpen(false);
      setFormData({
        pendaftaranId: formData.pendaftaranId,
        jumlah: "",
        file: null,
      });
      fetchPayments();
    } catch (err) {
      alertError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <HiOutlineCreditCard className="text-blue-600" size={24} />
          Daftar Pembayaran
        </h1>
        <Button onClick={() => setModalOpen(true)}>Tambah Pembayaran</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          Belum ada data pembayaran
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>Nama Jamaah</Table.HeadCell>
              <Table.HeadCell>Jumlah</Table.HeadCell>
              <Table.HeadCell>Tanggal</Table.HeadCell>
              <Table.HeadCell>Bukti</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              {role !== "JAMAAH" && <Table.HeadCell>Aksi</Table.HeadCell>}
            </Table.Head>
            <Table.Body>
              {payments.map((payment) => (
                <Table.Row key={payment.id}>
                  <Table.Cell>
                    {payment.pendaftaran?.akun?.nama || "-"}
                  </Table.Cell>
                  <Table.Cell>{formatCurrency(payment.jumlah)}</Table.Cell>
                  <Table.Cell>{formatDate(payment.created)}</Table.Cell>
                  <Table.Cell>
                    {payment.buktiUrl ? (
                      <a
                        href={payment.buktiUrl}
                        target="_blank"
                        className="text-blue-500 underline"
                        rel="noopener noreferrer"
                      >
                        Lihat Bukti
                      </a>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>{payment.status}</Table.Cell>
                  {role !== "JAMAAH" && (
                    <Table.Cell className="flex gap-2">
                      <Button
                        color="success"
                        size="xs"
                        disabled={
                          loadingValidationId === payment.id ||
                          payment.status === "TERVERIFIKASI"
                        }
                        onClick={() => handleValidation(payment.id)}
                      >
                        {loadingValidationId === payment.id ? (
                          <Spinner size="sm" />
                        ) : payment.status === "TERVERIFIKASI" ? (
                          "Tervalidasi"
                        ) : (
                          "Validasi"
                        )}
                      </Button>
                      <Button
                        color="failure"
                        size="xs"
                        onClick={() => handleDelete(payment.id)}
                      >
                        Hapus
                      </Button>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Modal Tambah */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Modal.Header>Tambah Pembayaran</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jumlah" value="Jumlah Pembayaran" />
                <TextInput
                  id="jumlah"
                  type="number"
                  value={formData.jumlah}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="file"
                  value="Upload Bukti Pembayaran (Opsional)"
                />
                <FileInput
                  id="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Simpan</Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
