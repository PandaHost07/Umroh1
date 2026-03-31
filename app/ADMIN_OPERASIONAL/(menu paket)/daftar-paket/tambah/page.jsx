"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  TextInput,
  Textarea,
  FileInput,
  Select,
} from "flowbite-react";

function formatRupiah(value) {
  if (!value) return "";
  let angka = value.toString().replace(/\D/g, "");
  return angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PaketForm({ onSuccess, initialData = null, editMode = false }) {
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    tanggalBerangkat: "",
    tanggalPulang: "",
    harga: "",
    kuota: "",
    hotelId: "",
    penerbanganId: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);

  // Isi form ketika mode edit
  useEffect(() => {
    if (initialData) {
      setForm({
        nama: initialData.nama || "",
        deskripsi: initialData.deskripsi || "",
        tanggalBerangkat: initialData.tanggalBerangkat?.split("T")[0] || "",
        tanggalPulang: initialData.tanggalPulang?.split("T")[0] || "",
        harga: initialData.harga ? formatRupiah(initialData.harga) : "",
        kuota: initialData.kuota || "",
        hotelId: initialData.hotelId || "",
        penerbanganId: initialData.penerbanganId || "",
      });
    }
  }, [initialData]);

  // Ambil data hotel dan penerbangan
  useEffect(() => {
    async function fetchHotels() {
      const res = await fetch("/api/system/hotel");
      if (res.ok) {
        const data = await res.json();
        setHotels(Array.isArray(data) ? data : []);
      }
    }

    async function fetchFlights() {
      const res = await fetch("/api/system/penerbangan");
      if (res.ok) {
        const data = await res.json();
        setFlights(Array.isArray(data) ? data : []);
      }
    }

    fetchHotels();
    fetchFlights();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "harga") {
      const formatted = formatRupiah(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanHarga = parseInt(form.harga.replace(/\./g, ""), 10);
      if (isNaN(cleanHarga)) throw new Error("Harga tidak valid");
      if (cleanHarga > 2000000000) throw new Error("Harga terlalu besar! Maksimal Rp 2.000.000.000 (Dua Miliar). Toleransi limit sistem.");

      const body = {
        ...form,
        harga: cleanHarga,
        kuota: parseInt(form.kuota, 10),
        tanggalBerangkat: new Date(form.tanggalBerangkat).toISOString(),
        tanggalPulang: new Date(form.tanggalPulang).toISOString(),
      };
      if (initialData?.id) {
        body.id = initialData.id;
      }

      const formData = new FormData();
      formData.append("form", JSON.stringify(body));
      if (file) formData.append("file", file);

      const res = await fetch(`/api/system/paket`, {
        method: editMode ? "PATCH" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan paket");
      }

      const data = await res.json();

      if (!editMode) {
        setForm({
          nama: "",
          deskripsi: "",
          tanggalBerangkat: "",
          tanggalPulang: "",
          harga: "",
          kuota: "",
          hotelId: "",
          penerbanganId: "",
        });
        setFile(null);
      }

      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 bg-white rounded shadow max-w-6xl">
      <h2 className="text-2xl font-semibold mb-6">
        {editMode ? "Edit Paket" : "Tambah Paket Baru"}
      </h2>

      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

      <div className="mb-6">
        <Label htmlFor="nama" value="Nama Paket" className="mb-2" />
        <TextInput
          id="nama"
          name="nama"
          placeholder="Masukkan nama paket"
          value={form.nama}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="tanggalBerangkat" value="Tanggal Berangkat" className="mb-2" />
          <TextInput
            id="tanggalBerangkat"
            name="tanggalBerangkat"
            type="date"
            value={form.tanggalBerangkat}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="tanggalPulang" value="Tanggal Pulang" className="mb-2" />
          <TextInput
            id="tanggalPulang"
            name="tanggalPulang"
            type="date"
            value={form.tanggalPulang}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="harga" value="Harga (Rp)" className="mb-2" />
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-600 select-none">Rp</span>
            <input
              id="harga"
              name="harga"
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={form.harga}
              onChange={handleChange}
              required
              className="pl-10 w-full rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="kuota" value="Kuota" className="mb-2" />
          <TextInput
            id="kuota"
            name="kuota"
            type="number"
            min={1}
            value={form.kuota}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="hotelId" value="Hotel" className="mb-2" />
          <Select
            id="hotelId"
            name="hotelId"
            value={form.hotelId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Hotel</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.nama}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="penerbanganId" value="Penerbangan" className="mb-2" />
          <Select
            id="penerbanganId"
            name="penerbanganId"
            value={form.penerbanganId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Penerbangan</option>
            {flights.map((flight) => (
              <option key={flight.id} value={flight.id}>
                {flight.maskapai ?? flight.bandaraBerangkat}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-6">
        {editMode && initialData?.gambar && (
          <div className="mb-4">
            <Label value="Gambar Paket Saat Ini" className="mb-2 block font-semibold" />
            <img src={initialData.gambar} alt="Thumbnail Paket" className="h-40 w-auto rounded object-cover shadow border" />
            <p className="text-xs text-gray-500 mt-2">Gambar sudah ada. Biarkan kosong jika tidak ingin mengubah.</p>
          </div>
        )}
        <Label htmlFor="file" value="Upload Gambar Paket Baru (Opsional)" className="mb-2" />
        <FileInput id="file" name="file" onChange={handleFileChange} />
      </div>

      <div className="mb-6">
        <Label htmlFor="deskripsi" value="Deskripsi" className="mb-2" />
        <Textarea
          id="deskripsi"
          name="deskripsi"
          placeholder="Deskripsi paket"
          value={form.deskripsi}
          onChange={handleChange}
          required
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (editMode ? "Menyimpan..." : "Menambahkan...") : editMode ? "Simpan Perubahan" : "Tambah Paket"}
      </Button>
    </form>
  );
}
