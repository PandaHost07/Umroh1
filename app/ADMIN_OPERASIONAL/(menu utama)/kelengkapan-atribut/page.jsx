"use client";
import AdminContainer from "@/components/Container/adminContainer";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";
import { Label, Select, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PerlengkapanTable from "./perlengkapan";

export default function Page() {
  const [isPostData, setisPostData] = useState(false);
  const [paket, setpaket] = useState(null);
  const [onePaket, setonePaket] = useState(null);
  const [display, setdisplay] = useState(null);
  const session = useSession()

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/system/paket`);
      const data = await res.json();
      setpaket(data);
      data.length != 0 && setonePaket(data[0]);

    };
    fetchData();
  }, [isPostData]);

  const handleChange = (e) => {
    setonePaket(e.value);
  };

  return (
    paket && onePaket ? (
      <>
        <AdminContainer>
          <div className="grid grid-cols-3 gap-4">
            <a href={onePaket.image} target="_blank" className="relative w-full h-auto border overflow-hidden bg-gray-100 col-span-1" >
              <Image
                src={onePaket.image}
                alt={"Image" + onePaket.id}
                fill
                className="object-contain"
              />
            </a>
            <div className=" space-y-3 p-6">
              <div className="space-y-2">
                <Label htmlFor="jenisPaket" value={"Jenis Paket"} />
                <Select
                  id="jenisPaket"
                  name="jenisPaket"
                  value={onePaket}
                  onChange={handleChange}
                  required
                >
                  {paket.map((option) => (
                    <option key={option.id} value={option} className="capitalize" >
                      {option.nama} {`(Keberangkatan ${formatDate(option.tglKeberangkatan)})`}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="jenisPaket" value={"Sisa Seat"} />
                <p>{onePaket.seatTerisi}/{onePaket.totalSeat}</p>
              </div>
              <div>
                <Label htmlFor="jenisPaket" value={"Keberangkatan"} />
                <p>{formatDate(onePaket.tglKeberangkatan, "short")}</p>
              </div>
              <div>
                <Label htmlFor="jenisPaket" value={"Harga"} />
                <p>{formatCurrency(onePaket.harga)}</p>
              </div>
            </div>
          </div>

        </AdminContainer>
        <AdminContainer>
         <PerlengkapanTable paketId={onePaket.id} />
        </AdminContainer>
      </>
    ) : (
      <AdminContainer>
        <Spinner />
      </AdminContainer>
    )
  )
}
