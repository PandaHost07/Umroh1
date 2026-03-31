"use client";

import { useEffect, useState } from "react";
import { Table, Spinner, Button } from "flowbite-react";
import { alertError, alertSuccess } from "@/components/Alert/alert";

const PERLENGKAPAN_LIST = [
  "KOPER",
  "BAJU_IHRAM",
  "MUKENA",
  "NAMETAG",
  "BUKU_DOA_DAN_PANDUAN",
  "SYAL",
  "TAS_TRAVEL",
];

export default function PerlengkapanTable({ paketId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKeys, setUpdatingKeys] = useState(new Set());

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

  const handleToggle = async (registrationId, perlengkapan, currentStatus) => {
    const key = `${registrationId}-${perlengkapan}`;
    setUpdatingKeys((prev) => new Set(prev.add(key)));

    try {
      const res = await fetch("/api/system/perlengkapan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          perlengkapan,
          isReceived: !currentStatus,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal update status");

      alertSuccess("Status perlengkapan diperbarui");
      await fetchData();
    } catch (err) {
      alertError(err.message);
    } finally {
      setUpdatingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (paketId) fetchData();
  }, [paketId]);

  return (
    <div className="overflow-x-auto mt-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Distribusi Perlengkapan Jamaah</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Nama</Table.HeadCell>
            {PERLENGKAPAN_LIST.map((item) => (
              <Table.HeadCell key={`head-${item}`}>{item}</Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body>
            {data.map((row, index) => {
              const perlengkapanMap = {};
              row.perlengkapan.forEach((p) => {
                perlengkapanMap[p.perlengkapan] = p;
              });

              return (
                <Table.Row key={`${row.registrationId}-${index}`}>
                  <Table.Cell>{row.user.name}</Table.Cell>
                  {PERLENGKAPAN_LIST.map((item) => {
                    const itemData = perlengkapanMap[item];
                    const received = itemData?.isReceived || false;
                    const key = `${row.registrationId}-${item}`;
                    const isUpdating = updatingKeys.has(key);

                    return (
                      <Table.Cell key={key}>
                        <Button
                          size="xs"
                          color={received ? "success" : "gray"}
                          onClick={() =>
                            handleToggle(row.registrationId, item, received)
                          }
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Spinner size="sm" />
                          ) : received ? (
                            "✔️ Diterima"
                          ) : (
                            "❌ Belum"
                          )}
                        </Button>
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
