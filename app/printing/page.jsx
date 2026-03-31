"use client"
import PDFPrint from "@/components/PDF/print"
import { useRef } from "react";

export default function Page() {
    const pdfRef = useRef();
    return (
        <div className="w-screen h-screen border">
            <div className="w-full">


            <div style={{ left: 0, top: 0 }}>
                <PDFPrint ref={pdfRef} data={[]} />
            </div>
            </div>

        </div>
    )
}
