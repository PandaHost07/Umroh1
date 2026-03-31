"use client";

import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Button } from "flowbite-react";
import AdminContainer from "@/components/Container/adminContainer";
import { useRouter } from "next/navigation";
import { TableComponent } from "@/components/Table/table";

export default function PaketList() {
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  async function fetchPakets() {
    try {
      setLoading(true);
      const res = await fetch("/api/system/paket");
      if (!res.ok) throw new Error("Gagal memuat data paket");
      const data = await res.json();
      
      const mapped = (Array.isArray(data) ? data : []).map(p => ({
        id: p.id,
        gambar: p.gambar,
        nama: p.nama,
        harga: p.harga,
        kuota: p.kuota,
        terisi: p.pendaftaran ? p.pendaftaran.length : 0,
        keberangkatan: p.tanggalBerangkat
      }));
      setPakets(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPakets();
  }, []);

  if (loading)
    return (
      <AdminContainer>
        <div className="flex justify-center py-10">
          <Spinner aria-label="Loading paket..." size="xl" />
        </div>
      </AdminContainer>
    );

  if (error)
    return (
      <AdminContainer>
        <Alert color="failure" className="m-4">
          <span>{error}</span>
        </Alert>
      </AdminContainer>
    );

  return (
    <AdminContainer>
      <div className="w-full flex justify-end my-5">
        <Button onClick={() => router.push("/ADMIN_OPERASIONAL/daftar-paket/tambah")}>
          Tambah Paket
        </Button>
      </div>

      <TableComponent 
        data={pakets} 
        editFunct={(item) => router.push(`/ADMIN_OPERASIONAL/daftar-paket/edit/${item.id}`)}
      />

    </AdminContainer>
  );
}
