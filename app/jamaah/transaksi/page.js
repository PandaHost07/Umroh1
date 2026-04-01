"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Badge, Button, Modal, Spinner } from "flowbite-react";
import formatDate from "@/components/Date/formatDate";
import { HiTrash } from "react-icons/hi";

const STATUS_COLOR = {
  MENUNGGU: "warning",
  TERKONFIRMASI: "success",
  TIDAK_TERKONFIRMASI: "failure",
  DIBATALKAN: "gray",
};

export default function TransaksiPage() {
  const { data: session } = useSession();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/jamaah/pendaftaran?email=${session.user.email}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data");
      setList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCancel = (item) => {
    setSelected(item);
    setCancelReason("");
    setShowModal(true);
  };

  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/jamaah/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId: selected.id, alasan: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan");
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (item) =>
    item.status !== "DIBATALKAN" &&
    (item.pembayaran?.filter((p) => p.status === "TERVERIFIKASI") || []).length === 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">Transaksi</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-300 rounded">
        <table className="w-full text-sm text-left">
          <thead className="bg-white border-b border-gray-300">
            <tr>
              {["No", "Email", "Nama", "Tgl Pesanan", "Paket", "Status", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10">
                  <Spinner size="md" />
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  Belum ada transaksi.
                </td>
              </tr>
            ) : (
              list.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200 text-center">{i + 1}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.akunEmail}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.akun?.nama ?? "-"}</td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {formatDate(item.created, "short")}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 max-w-[180px]">
                    <span className="line-clamp-2">{item.paket?.nama ?? "-"}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <Badge color={STATUS_COLOR[item.status] ?? "gray"} size="sm">
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="xs"
                        color="blue"
                        href={`/jamaah/transaksi/${item.id}`}
                      >
                        Detail
                      </Button>
                      {canCancel(item) && (
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => openCancel(item)}
                        >
                          <HiTrash size={12} className="mr-1" />
                          Batal
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Batalkan */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <Modal.Header>Batalkan Pemesanan</Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Batalkan pemesanan paket{" "}
                <span className="font-semibold">{selected.paket?.nama}</span>?
              </p>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Alasan pembatalan (opsional)..."
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowModal(false)} disabled={cancelling}>
            Tutup
          </Button>
          <Button color="failure" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? <Spinner size="sm" /> : "Ya, Batalkan"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
