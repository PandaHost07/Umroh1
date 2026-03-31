"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import CountdownTimer from "./timer";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

export default function page({ params }) {
    const [mounted, setMounted] = useState(false);
    const [data, setdata] = useState(null);
    const [method, setmethod] = useState("POST");

    const router = useRouter();

    useEffect(() => {
        const fetchOptions = async () => {
            const { slug } = await params;
            if (slug) {
                const res = await fetch(
                    `/api/system/order?id=${slug}`
                );
                const resJson = await res.json();
                
                if (resJson.length == 0) {
                    router.push("/JAMAAH/transaksi");
                }else{
                    if (resJson && resJson.pembayaran?.length > 0){ setmethod("PATCH"); }
                    
                    setdata(resJson);
                }
            } else {
                router.push("/JAMAAH/transaksi");
            }
        };

        setMounted(true);
        fetchOptions();
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div>
            <AdminContainer>
                {data ? (<CountdownTimer data={data} method={method} />) : (<Spinner />)}
            </AdminContainer>
        </div>
    );
}
