"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container/container";
import Skeleton from "@/components/Skeleton/skeleton";

import { FaHotel, FaRegCalendarAlt } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { PiAirplaneTiltFill } from "react-icons/pi";
import { FaStar } from "react-icons/fa6";
import { Button, Progress } from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import formatDate from "@/components/Date/formatDate";

const hitungHari = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

function PaketComponentPage() {
  const [listPaket, setListPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetching = async () => {
      try {
        const res = await fetch(`/api/public/paket`);
        const resJson = await res.json();
        if (res.ok && resJson.paket) {
          setListPaket(resJson.paket);
          setLoading(false);
        } else {
          setFailed("Terjadi Kesalahan!!! Silahkan Refresh Ulang Halaman");
        }
      } catch {
        setFailed("Terjadi Kesalahan!!! Silahkan Refresh Ulang Halaman");
      }
    };
    fetching();
  }, []);

  return (
    <Container>
      <div className="flex pb-10 text-3xl font-semibold justify-center md:justify-start">
        Paket Umrah
      </div>

      {loading ? (
        <Skeleton.ListItem />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 border p-5">
          {listPaket && listPaket.length > 0 ? (
            listPaket.map((paket) => (
              <div
                key={paket.id}
                className="w-full h-full flex flex-col bg-white rounded overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="relative h-96">
                  {paket.gambar && paket.gambar !== "" ? (
                    <Image
                      src={paket.gambar}
                      alt={"Image " + paket.nama}
                      fill
                      className="object-cover object-top rounded-t-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded sm:w-full dark:bg-gray-700">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-30 rounded-t-lg"></div>
                  {/* Badge kuota */}
                  <div className="absolute top-2 right-2">
                    {paket.isAvailable ? (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {paket.kuotaTersedia} Seat
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Penuh
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-5 flex flex-col flex-grow">
                  <div className="font-bold text-xl md:text-2xl mb-2 capitalize line-clamp-3">
                    {paket.nama}
                  </div>

                  <div className="text-gray-600 text-xs md:text-sm mt-3 space-y-2 mb-6">
                    <div className="flex justify-between items-center pb-1">
                      <div className="flex items-center">
                        <FaRegCalendarAlt size={15} className="mr-2" />
                        <div className="hidden sm:flex">Keberangkatan</div>
                        <div className="sm:hidden">Berangkat</div>
                      </div>
                      <div>
                        {formatDate(paket.tanggalBerangkat, "short")}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-1">
                      <div className="flex items-center">
                        <MdAccessTime size={15} className="mr-2" />
                        <div>Durasi</div>
                      </div>
                      <div>
                        {hitungHari(
                          paket.tanggalBerangkat,
                          paket.tanggalPulang
                        )}{" "}
                        Hari
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-1">
                      <div className="flex items-center">
                        <PiAirplaneTiltFill size={15} className="mr-2" />
                        <div>Maskapai</div>
                      </div>
                      <div>{paket.penerbangan?.maskapai ?? "-"}</div>
                    </div>

                    <div className="flex justify-between items-center pb-1">
                      <div className="flex items-center">
                        <FaHotel size={15} className="mr-2" />
                        Hotel
                      </div>
                      <div className="flex">
                        {[...Array(paket.hotel?.bintang || 0)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-yellow-300"
                            size={16}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="font-medium text-gray-700 text-sm">
                      Seat Terisi : {paket.quotaUsage?.used ?? (paket.registrasi?.length || 0)} dari {paket.kuota}
                      <Progress
                        progress={Math.min(100, ((paket.quotaUsage?.used ?? paket.registrasi?.length ?? 0) / paket.kuota) * 100)}
                        size="sm"
                        className="mt-2"
                      />
                    </div>

                    <div className="font-medium text-gray-700 text-sm">
                      Harga Mulai :
                      <div className="text-red-500 mt-1 text-2xl font-bold">
                        {formatCurrency(paket.harga)}
                      </div>
                    </div>

                    <Button
                      href={`/paket/detail/${paket.id}`}
                      className="w-full mt-2"
                      color="info"
                    >
                      Detail Paket
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>Tidak Ada Data</>
          )}
        </div>
      )}
    </Container>
  );
}

export default PaketComponentPage;
