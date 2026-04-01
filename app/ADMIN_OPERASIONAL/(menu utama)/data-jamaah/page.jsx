"use client";
import { useState, useEffect } from "react";
import AdminContainer from "@/components/Container/adminContainer";
import { TableComponent } from "@/components/Table/table";
import { Spinner } from "flowbite-react";

export default function DataJamaah() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/system/akun?role=jamaah");
        const json = await res.json();
        const formatted = (Array.isArray(json) ? json : []).map((user, i) => ({
          no: i + 1,
          nama: user.nama || "-",
          email: user.email,
          telepon: user.telepon || "-",
          jenisKelamin: user.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : user.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "-",
          bergabung: new Date(user.created).toLocaleDateString("id-ID"),
        }));
        setData(formatted);
      } catch {}
    };
    fetchData();
  }, []);

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Data Jamaah Terdaftar</h2>
        {data && <span className="text-sm text-gray-500">{data.length} jamaah</span>}
      </div>
      {data ? (
        <TableComponent data={data} searchColumn="nama" />
      ) : (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      )}
    </AdminContainer>
  );
}
