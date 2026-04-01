"use client";
import AdminContainer from "@/components/Container/adminContainer";
import formatDate from "@/components/Date/formatDate";
import { Label, Select, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import DokumenTable from "./dokumen";

export default function Page() {
  const [paket, setPaket] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/system/paket");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPaket(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <AdminContainer><div className="flex justify-center py-10"><Spinner size="xl" /></div></AdminContainer>;

  return (
    <AdminContainer>
      <h2 className="text-xl font-bold mb-4">Kelengkapan Dokumen Jamaah</h2>

      {paket.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada paket umrah.</p>
      ) : (
        <>
          <div className="mb-6 max-w-sm">
            <Label value="Pilih Paket" />
            <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="mt-1">
              {paket.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — {formatDate(p.tanggalBerangkat, "short")}
                </option>
              ))}
            </Select>
          </div>
          {selectedId && <DokumenTable paketId={selectedId} />}
        </>
      )}
    </AdminContainer>
  );
}
