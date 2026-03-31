"use client";

import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { Badge, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // <-- import useRouter
import { useEffect, useState } from "react";
import { HiOutlineClipboardList } from "react-icons/hi";

export default function OrderListPage() {
    const router = useRouter(); // initialize router
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { data: session } = useSession();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/system/order");
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Gagal memuat data");

                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "yellow";
            case "CONFIRMED": return "green";
            case "NOTCONFIRMED": return "red";
            default: return "gray";
        }
    };

    // Fungsi untuk handle klik order -> redirect ke halaman pembayaran/idTransaksi
    const handleClickOrder = (order) => {
        // misal order.id adalah idTransaksi
        router.push(`/${session.user.role}/pembayaran/${order.id}`);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2 mb-4">
                <HiOutlineClipboardList className="text-blue-600" size={26} />
                Daftar Transaksi / Pemesanan
            </h1>

            {loading ? (
                <div className="flex justify-center py-10"><Spinner size="xl" /></div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : orders.length === 0 ? (
                <div className="text-gray-600 text-center py-10">Belum ada transaksi</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border p-4 rounded-md shadow-sm hover:shadow cursor-pointer transition duration-200"
                          onClick={() => handleClickOrder(order)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-semibold text-lg">{order.paket?.nama} - {order.akun?.nama || order.akunEmail}</div>
                                <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                                <div>Tanggal Pesan: {formatDate(order.created, "long")}</div>
                                <div>Keberangkatan: {formatDate(order.paket?.tanggalBerangkat)}</div>
                                <div>Kepulangan: {formatDate(order.paket?.tanggalPulang)}</div>
                                <div className="mt-1 font-medium text-black">Harga: {formatCurrency(order.paket?.harga)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
