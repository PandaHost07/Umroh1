"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  Spinner,
  Select,
} from "flowbite-react";

export default function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Form state (disesuaikan dengan schema Prisma)
  const [form, setForm] = useState({
    nama: "",
    bintang: "",
    lokasi: "",
    alamat: "",
    petaUrl: "",
    deskripsi: "",
  });

  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch hotel data
  const fetchHotels = async () => {
    setLoading(true);
    const res = await fetch("/api/system/hotel");
    if (res.ok) {
      const data = await res.json();
      setHotels(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit tambah hotel
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    // Validasi sederhana
    if (!form.nama || !form.lokasi) {
      setFormError("Nama dan lokasi wajib diisi");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/system/hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bintang: form.bintang ? parseInt(form.bintang) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menambah hotel");
      }

      // Clear form & close modal
      setForm({
        nama: "",
        bintang: "",
        lokasi: "",
        alamat: "",
        petaUrl: "",
        deskripsi: "",
      });
      setShowModal(false);

      // Refresh hotel list
      fetchHotels();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className="mb-6 ms-auto">
        Tambah Hotel
      </Button>

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="flex justify-center my-20">
          <p>Tidak ada data hotel</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Bintang</th>
                <th className="px-4 py-3">Lokasi</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Peta URL</th>
                <th className="px-4 py-3">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="border-t">
                  <td className="px-4 py-2">{hotel.nama}</td>
                  <td className="px-4 py-2">{hotel.bintang ?? "-"}</td>
                  <td className="px-4 py-2">{hotel.lokasi}</td>
                  <td className="px-4 py-2">{hotel.alamat ?? "-"}</td>
                  <td className="px-4 py-2">
                    {hotel.petaUrl ? (
                      <a
                        href={hotel.petaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Lihat Peta
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">{hotel.deskripsi ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah Hotel */}
      <Modal show={showModal} size="3xl" popup onClose={() => setShowModal(false)}>
        <Modal.Header>Tambah Hotel Baru</Modal.Header>
        <Modal.Body>
          {formError && (
            <div className="mb-4 text-red-600 font-medium">{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="nama" value="Nama Hotel" className="mb-2" />
              <TextInput
                id="nama"
                name="nama"
                placeholder="Masukkan nama hotel"
                value={form.nama}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="bintang" value="Bintang (1-5)" className="mb-2" />
              <Select
                id="bintang"
                name="bintang"
                value={form.bintang}
                onChange={handleChange}
              >
                <option value="">Pilih Bintang</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="lokasi" value="Lokasi Hotel" className="mb-2" />
              <Select
                id="lokasi"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Lokasi</option>
                <option value="MEKKAH">Mekkah</option>
                <option value="MADINAH">Madinah</option>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="alamat" value="Alamat" className="mb-2" />
              <TextInput
                id="alamat"
                name="alamat"
                placeholder="Alamat hotel"
                value={form.alamat}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="petaUrl" value="URL Peta (Google Maps)" className="mb-2" />
              <TextInput
                id="petaUrl"
                name="petaUrl"
                placeholder="https://maps.google.com/..."
                value={form.petaUrl}
                onChange={handleChange}
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="deskripsi" value="Deskripsi" className="mb-2" />
              <Textarea
                id="deskripsi"
                name="deskripsi"
                placeholder="Deskripsi hotel"
                value={form.deskripsi}
                onChange={handleChange}
                rows={3}
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
                {formLoading ? "Menyimpan..." : "Tambah Hotel"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
