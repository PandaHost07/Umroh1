"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useEffect, useState } from "react";
import CountdownTimer from "./timer";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

export default function Page({ params }) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOptions = async () => {
      const { slug } = await params;
      if (!slug) {
        router.push("/jamaah/transaksi");
        return;
      }
      const res = await fetch(`/api/system/order?id=${slug}`);
      const resJson = await res.json();
      if (!resJson || resJson.length === 0) {
        router.push("/jamaah/transaksi");
      } else {
        setData(resJson);
      }
    };
    setMounted(true);
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <AdminContainer>
      {data ? <CountdownTimer data={data} /> : <Spinner />}
    </AdminContainer>
  );
}
