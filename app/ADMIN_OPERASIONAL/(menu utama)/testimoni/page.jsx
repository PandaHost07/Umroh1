"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import { Button, Badge, Spinner } from "flowbite-react";
import { FaStar } from "react-icons/fa";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import Swal from "sweetalert2";

export default function TestimoniAdminPage() {
  const [list, setList] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/jamaah/testimoni");
      const data = await res.json();
      setList(data.testimoni || []);
    } catch { setList([]); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Testimoni?",
      text: "Testimoni ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/system/delete?model=testimoni&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      alertSuccess("Testimoni dihapus");
      fetchData();
    } catch (err) { alertError(err.message); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AdminContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Testimoni Jamaah</h2>
        {list && <span className="text-sm text-gray-500">{list.length} testimoni</span>}
      </div>

      {list === null ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : list.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">Belum ada testimoni.</p>
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div key={t.id} className="border rounded-xl p-4 bg-white flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{t.akun?.nama || t.akunEmail}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={12} className={i < t.rating ? "text-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
                  <Badge color={t.status === "PUBLIK" ? "success" : "gray"} size="xs">{t.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 italic">"{t.pesan}"</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(t.created).toLocaleDateString("id-ID")}</p>
              </div>
              <Button size="xs" color="failure" onClick={() => handleDelete(t.id)}>Hapus</Button>
            </div>
          ))}
        </div>
      )}
    </AdminContainer>
  );
}
