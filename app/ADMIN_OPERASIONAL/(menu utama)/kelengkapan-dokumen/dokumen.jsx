"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Spinner,
  Button,
  Modal,
  Label,
  Select,
  FileInput,
} from "flowbite-react";
import { alertError, alertSuccess } from "@/components/Alert/alert";

const DOCUMENT_TYPES = ["PASPOR", "KTP", "FOTO", "VAKSIN", "VISA"];

export default function DocumentPerUser({ paketId }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal upload
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    registrationId: "",
    type: "",
    file: null,
  });

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/document?paket=${paketId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      setRegistrations(json); // array of registrations
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paketId) {
      fetchRegistrations();
    }
  }, [paketId]);

  const openUploadModal = (registrationId) => {
    setUploadData({ registrationId, type: "", file: null });
    setModalOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const { registrationId, type, file } = uploadData;
    if (!registrationId || !type || !file) {
      alertError("Registration, tipe, dan file harus diisi");
      return;
    }

    try {
      const formObj = { registrationId, type };
      const body = new FormData();
      body.append("form", JSON.stringify(formObj));
      body.append("file", file);

      const res = await fetch("/api/system/document", {
        method: "POST",
        body,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal upload");
      alertSuccess("Upload berhasil");
      setModalOpen(false);
      fetchRegistrations();
    } catch (err) {
      alertError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Dokumen Jamaah per Paket</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Nama</Table.HeadCell>
            {DOCUMENT_TYPES.map((type) => (
              <Table.HeadCell key={type}>{type}</Table.HeadCell>
            ))}
            <Table.HeadCell>Aksi</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {registrations.map((reg) => (
              <Table.Row key={reg.id}>
                <Table.Cell>{reg.user?.name || "-"}</Table.Cell>
                {DOCUMENT_TYPES.map((type) => {
                  const doc = reg.documents?.find((d) => d.type === type);
                  return (
                    <Table.Cell key={type}>
                      {doc?.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-gray-400">null</span>
                      )}
                    </Table.Cell>
                  );
                })}
                <Table.Cell>
                  <Button size="xs" onClick={() => openUploadModal(reg.id)}>
                    Upload
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleUpload}>
          <Modal.Header>Upload Dokumen</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" value="Tipe Dokumen" />
                <Select
                  id="type"
                  required
                  value={uploadData.type}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, type: e.target.value })
                  }
                >
                  <option value="">Pilih tipe</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="file" value="Pilih File" />
                <FileInput
                  id="file"
                  accept="application/pdf,image/*"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Upload</Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
