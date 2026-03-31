"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { Card } from "flowbite-react";

import { AiOutlineApartment } from "react-icons/ai";
import { FaClipboardList } from "react-icons/fa";
import { MdOutlineFlipCameraAndroid, MdSpeakerNotes } from "react-icons/md";


import LineChart from "@/components/Chart/lineChart";

export default function AdminPage() {
  const salesData = [30, 50, 70, 60, 90, 80, 100, 11, 120, 130, 140, 30];

  return (
    <div className=" space-y-6 mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 xl:gap-x-6">
        <Card href="/admin/daftar-transaksi">
          <div className=" mb-3 font-medium text-sm ">Transakasi</div>
          <div className=" flex w-full justify-between items-center px-2">
            <div className=" font-semibold text-2xl">120</div>
            <MdOutlineFlipCameraAndroid className=" text-blue-500" size={35} />
          </div>
        </Card>
        <Card href="/admin/daftar-paket">
          <div className=" mb-3 font-medium text-sm ">Jumlah Paket</div>
          <div className=" flex w-full justify-between items-center px-2">
            <div className=" font-semibold text-2xl">120</div>
            <FaClipboardList className=" text-blue-500" size={35} />
          </div>
        </Card>
        <Card href="/admin/daftar-mitra">
          <div className=" mb-3 font-medium text-sm ">Jumlah Mitra</div>
          <div className=" flex w-full justify-between items-center px-2">
            <div className=" font-semibold text-2xl">8</div>
            <AiOutlineApartment className=" text-blue-500" size={35} />
          </div>
        </Card>
        <Card href="/admin/testimoni">
          <div className=" mb-3 font-medium text-sm ">Testtimoni</div>
          <div className=" flex w-full justify-between items-center px-2">
            <div className=" font-semibold text-2xl">120</div>
            <MdSpeakerNotes className=" text-blue-500" size={35} />
          </div>
        </Card>
      </div>

      <AdminContainer>
        <div className=" overflow-auto">
          <div className=" w-96 h-96 sm:w-full sm:h-full">
            <LineChart data={salesData} />
          </div>
        </div>
      </AdminContainer>
    </div>
  );
}
