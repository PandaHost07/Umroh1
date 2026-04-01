"use client";
import { useEffect, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { alertError, alertSuccess } from "@/components/Alert/alert";

const JENIS_LIST = ["KOPER", "BAJU_IHRAM", "MUKENA", "NAMETAG", "BUKU_DOA_DAN_PANDUAN", "SYAL", "TAS_TRAVEL"];
const LABEL = {
  KOPER: "Koper",
  BAJU_IHRAM: "Baju Ihram",
  MUKENA: "Mukena",
  NAMETAG: "Nametag",
  BUKU_DOA_DAN_PANDUAN: "Buku Doa",
  SYAL: "Syal",
  TAS_TRAVEL: "Tas Travel",
};

export default function PerlengkapanTable({ paketId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/perlengkapan?paket=${paketId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengambil data");
      setData(result);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (pendaftaranId, jenis, currentStatus) => {
    const key = `${pendaftaranId}-${jenis}`;
    setUpdating((prev) => new Set(prev).add(key));
    try {
      const res = await fetch("/api/system/perlengkapan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId, jenis, sudahDiterima: !currentStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal update");
      alertSuccess("Status diperbarui");
      await fetchData();
    } catch (err) {
      alertError(err.message);
    } finally {
      setUpdating((prev) => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  useEffect(() => { if (paketId) fetchData(); }, [paketId]);

  if (loading) return <div className="flex justify-center py-10"><Spinner size="xl" /></div>;
  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-6">Belum ada jamaah terdaftar untuk paket ini.</p>;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Distribusi Perlengkapan Jamaah</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border font-semibold">Nama Jamaah</th>
              {JENIS_LIST.map((j) => (
                <th key={j} className="px-3 py-2 border font-semibold text-center text-xs">{LABEL[j]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const map = {};
              row.perlengkapan.forEach((p) => { map[p.jenis] = p; });
              return (
                <tr key={row.pendaftaranId} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 border font-medium">{row.akun?.nama || row.akun?.email || "-"}</td>
                  {JENIS_LIST.map((jenis) => {
                    const item = map[jenis];
                    const received = item?.sudahDiterima ?? false;
                    const key = `${row.pendaftaranId}-${jenis}`;
                    return (
                      <td key={jenis} className="px-3 py-2 border text-center">
                        <Button
                          size="xs"
                          color={received ? "success" : "gray"}
                          onClick={() => handleToggle(row.pendaftaranId, jenis, received)}
                          disabled={updating.has(key)}
                        >
                          {updating.has(key) ? <Spinner size="sm" /> : received ? "✓" : "✗"}
                        </Button>
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
