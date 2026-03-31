"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Label, TextInput, Spinner } from "flowbite-react";

export default function FlightPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state (disesuaikan dengan schema Prisma)
  const [form, setForm] = useState({
    maskapai: "",
    bandaraBerangkat: "Raden Intan Lampung",
    bandaraTiba: "",
    waktuBerangkat: "",
    waktuTiba: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Fetch penerbangan
  const fetchFlights = async () => {
    setLoading(true);
    const res = await fetch("/api/system/penerbangan");
    if (res.ok) {
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!form.maskapai || !form.bandaraTiba || !form.waktuBerangkat || !form.waktuTiba) {
      setFormError("Semua field wajib diisi");
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        waktuBerangkat: new Date(form.waktuBerangkat),
        waktuTiba: new Date(form.waktuTiba),
      };

      const res = await fetch("/api/system/penerbangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menambah penerbangan");
      }

      setForm({
        maskapai: "",
        bandaraBerangkat: "Raden Intan Lampung",
        bandaraTiba: "",
        waktuBerangkat: "",
        waktuTiba: "",
      });

      setShowModal(false);
      fetchFlights();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className="mb-6 ms-auto">
        Tambah Penerbangan
      </Button>

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" />
        </div>
      ) : flights.length === 0 ? (
       <div className="flex justify-center my-20">
          <p>Tidak ada data hotel</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Maskapai</th>
                <th className="px-4 py-3">Bandara Berangkat</th>
                <th className="px-4 py-3">Bandara Tiba</th>
                <th className="px-4 py-3">Waktu Berangkat</th>
                <th className="px-4 py-3">Waktu Tiba</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-2">{f.maskapai || "-"}</td>
                  <td className="px-4 py-2">{f.bandaraBerangkat || "-"}</td>
                  <td className="px-4 py-2">{f.bandaraTiba || "-"}</td>
                  <td className="px-4 py-2">
                    {f.waktuBerangkat
                      ? new Date(f.waktuBerangkat).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {f.waktuTiba
                      ? new Date(f.waktuTiba).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah Penerbangan */}
      <Modal show={showModal} size="3xl" popup onClose={() => setShowModal(false)}>
        <Modal.Header>Tambah Penerbangan</Modal.Header>
        <Modal.Body>
          {formError && (
            <div className="mb-4 text-red-600 font-medium">{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="maskapai" value="Maskapai" className="mb-2" />
              <TextInput
                id="maskapai"
                name="maskapai"
                value={form.maskapai}
                onChange={handleChange}
                placeholder="Contoh: Garuda Indonesia"
                required
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="bandaraBerangkat"
                value="Bandara Keberangkatan"
                className="mb-2"
              />
              <TextInput
                id="bandaraBerangkat"
                name="bandaraBerangkat"
                value={form.bandaraBerangkat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="bandaraTiba" value="Bandara Tujuan" className="mb-2" />
              <TextInput
                id="bandaraTiba"
                name="bandaraTiba"
                value={form.bandaraTiba}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="waktuBerangkat" value="Waktu Berangkat" className="mb-2" />
              <TextInput
                id="waktuBerangkat"
                name="waktuBerangkat"
                type="datetime-local"
                value={form.waktuBerangkat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="waktuTiba" value="Waktu Tiba" className="mb-2" />
              <TextInput
                id="waktuTiba"
                name="waktuTiba"
                type="datetime-local"
                value={form.waktuTiba}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => setShowModal(false)}
                disabled={formLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Menyimpan..." : "Tambah Penerbangan"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
