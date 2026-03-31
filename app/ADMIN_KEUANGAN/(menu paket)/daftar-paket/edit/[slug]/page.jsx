"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaketForm from "../../tambah/page";
import AdminContainer from "@/components/Container/adminContainer";

export default function Page({ params }) {
    const [dataPaket, setDataPaket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPaket = async () => {
            const { slug } = await params;

            if (!slug) return;

            try {
                const res = await fetch(`/api/system/paket?id=${slug}`);
                if (!res.ok) {
                    throw new Error("Gagal mengambil data paket");
                }

                const data = await res.json();
                setDataPaket(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPaket();
    }, [params]);

    if (loading) return <AdminContainer>Memuat data paket...</AdminContainer>;
    if (error) return <AdminContainer>Error: {error}</AdminContainer>;
    if (!dataPaket) return <AdminContainer>Paket tidak ditemukan</AdminContainer>;

    return (
        <div>
            <PaketForm
                editMode={true}
                initialData={dataPaket}
                onSuccess={() => router.push("/ADMIN_KEUANGAN/daftar-paket/")}
            />
        </div>
    );
}
