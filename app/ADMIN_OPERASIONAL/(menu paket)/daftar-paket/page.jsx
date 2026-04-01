"use client";

import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Button } from "flowbite-react";
import AdminContainer from "@/components/Container/adminContainer";
import { useRouter } from "next/navigation";
import { TableComponent } from "@/components/Table/table";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";

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
      
      const mapped = (Array.isArray(data) ? data : []).map(p => {
        const terisi = p.pendaftaran
          ? p.pendaftaran.filter(d => ["MENUNGGU", "TERKONFIRMASI"].includes(d.status)).length
          : 0;
        return {
          id: p.id,
          gambar: p.gambar,
          nama: p.nama,
          harga: p.harga,
          kuota: p.kuota,
          terisi,
          isPenuh: terisi >= p.kuota,
          keberangkatan: p.tanggalBerangkat,
          status: p.status,
        };
      });
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
        delFunct={async (item) => {
          const result = await Swal.fire({
            title: "Hapus Paket?",
            text: `Paket "${item.nama}" akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
          });
          if (!result.isConfirmed) return;
          try {
            const res = await fetch(`/api/system/delete?model=paket&id=${item.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus paket");
            alertSuccess("Paket berhasil dihapus");
            fetchPakets();
          } catch (err) {
            alertError(err.message);
          }
        }}
      />

    </AdminContainer>
  );
}
