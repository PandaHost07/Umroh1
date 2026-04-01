"use client";
import { useEffect, useState } from "react";
import { Button, Spinner, Badge } from "flowbite-react";
import { alertError, alertSuccess } from "@/components/Alert/alert";

const JENIS_DOKUMEN = ["PASPOR", "KTP", "FOTO", "VAKSIN", "VISA"];

const STATUS_COLOR = {
  MENUNGGU: "warning",
  DISETUJUI: "success",
  DITOLAK: "failure",
};

export default function DokumenTable({ paketId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/document?paket=${paketId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengambil data");
      setData(result);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch("/api/system/document", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal update");
      alertSuccess(`Dokumen ${status === "DISETUJUI" ? "disetujui" : "ditolak"}`);
      fetchData();
    } catch (err) {
      alertError(err.message);
    }
  };

  useEffect(() => { if (paketId) fetchData(); }, [paketId]);

  if (loading) return <div className="flex justify-center py-10"><Spinner size="xl" /></div>;
  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-6">Belum ada jamaah terdaftar untuk paket ini.</p>;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Kelengkapan Dokumen Jamaah</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border font-semibold">Nama Jamaah</th>
              {JENIS_DOKUMEN.map((j) => (
                <th key={j} className="px-3 py-2 border font-semibold text-center">{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const map = {};
              row.dokumen.forEach((d) => { map[d.jenis] = d; });
              return (
                <tr key={row.pendaftaranId} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 border font-medium">{row.akun?.nama || row.akun?.email || "-"}</td>
                  {JENIS_DOKUMEN.map((jenis) => {
                    const doc = map[jenis];
                    return (
                      <td key={jenis} className="px-3 py-2 border text-center">
                        {doc ? (
                          <div className="flex flex-col items-center gap-1">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Lihat</a>
                            <Badge color={STATUS_COLOR[doc.status] ?? "gray"} size="xs">{doc.status}</Badge>
                            {doc.status === "MENUNGGU" && (
                              <div className="flex gap-1 mt-1">
                                <Button size="xs" color="success" onClick={() => handleUpdateStatus(doc.id, "DISETUJUI")}>✓</Button>
                                <Button size="xs" color="failure" onClick={() => handleUpdateStatus(doc.id, "DITOLAK")}>✗</Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
