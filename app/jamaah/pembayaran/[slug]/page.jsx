"use client";

import { useEffect, useState } from "react";
import PaymentListPage from "../payment";
import { Spinner } from "flowbite-react";

export default function Page({ params }) {
    const [id, setid] = useState(null)

    useEffect(() => {
        const fetchPaket = async () => {
            const { slug } = await params;
            if (!slug) return;
            setid(slug);
        };
        fetchPaket();
    }, [params]);

    return (
        <>
            {id ? <PaymentListPage registrationId={id} /> : <Spinner />}
        </>
    );
}
