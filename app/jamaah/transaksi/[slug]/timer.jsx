"use client";
import formatCurrency from "@/components/Currency/currency";
import { Button, FileInput, Spinner } from "flowbite-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { alertError, alertSuccess } from "@/components/Alert/alert";
import formatStatus from "@/components/Status/status";
import formatDate from "@/components/Date/formatDate";
import { useRouter } from "next/navigation";

export default function CountdownTimer({ data }) {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);
  const [urlFile, setUrlFile] = useState(null);
  const [modal, setModal] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [isvalidation, setisvalidation] = useState(data.status === "TERKONFIRMASI");

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data) return null;

  const handleCloseModal = () => setModal(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUrlFile(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingUpload(true);

    if (!file) {
      alertError("File bukti transfer wajib diunggah.");
      setLoadingUpload(false);
      return;
    }

    try {
      const form = {
        pendaftaranId: data.id, // ID dari pendaftaran / transaksi
        jumlah: 5000000, // Kirim nominal 5 juta
      };

      const formData = new FormData();
      formData.append("form", JSON.stringify(form));
      formData.append("file", file);

      const res = await fetch("/api/system/pembayaran", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alertSuccess("Pembayaran berhasil dikirim.");
        router.refresh();
      } else {
        alertError(result.error || "Gagal mengirim pembayaran.");
      }
    } catch (err) {
      console.error("Error saat kirim:", err);
      alertError("Terjadi kesalahan.");
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div>
      <ViewCountdownTimer
        initialSeconds={isvalidation ? 0 : hitungDetikDariSekarang(new Date(data.created))}
        isvalidation={isvalidation}
      />

      <div className="grid grid-cols-3 gap-x-8 my-10">
        {/* Gambar Paket */}
        <div className="flex col-span-1 h-96 rounded dark:bg-gray-700 justify-center">
          <div className="relative w-72 h-full">
            <Image
              src={data.paket.gambar}
              alt={data.paket.nama}
              fill
              objectFit="cover"
              className="rounded-t"
            />
          </div>
        </div>

        {/* Detail dan Form */}
        <div className="col-span-2 flex flex-col">
          <span className="mb-2 font-medium text-lg">Nominal Pembayaran</span>
          <div className="ms-4 mb-4 font-bold p-1 text-2xl">
            {formatCurrency(5000000)}
          </div>

          <span className="mb-2 font-medium text-lg">Status</span>
          <span className="ms-4 mb-4">{formatStatus(data.status)}</span>

          <span className="mb-2 font-medium text-lg">Tanggal Pemesanan</span>
          <span className="ms-4 text-lg mb-4">{formatDate(data.created)}</span>

          <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4 mt-4">
            <div className="flex space-x-3 items-center">
              <FileInput
                id="file"
                name="file"
                onChange={handleFileChange}
                className="w-full"
                required
                accept=".png, .jpg, .jpeg"
              />
              <Button
                type="button"
                disabled={!urlFile}
                onClick={() => setModal(true)}
              >
                Lihat
              </Button>
            </div>

            <Button
              type="submit"
              className="w-fit"
              disabled={loadingUpload || !file || isvalidation}
            >
              {loadingUpload ? <Spinner /> : "Kirim Bukti Pembayaran"}
            </Button>
          </form>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={handleCloseModal}
        >
          <div className="relative w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh]">
            <button
              className="absolute top-0 right-0 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-80 p-2 rounded-full"
              onClick={handleCloseModal}
            >
              <IoClose size={24} />
            </button>
            <div className="relative w-full h-[60vh] md:h-[70vh] rounded-md overflow-hidden">
              <Image
                src={urlFile}
                alt="Preview Bukti Transfer"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function hitungDetikDariSekarang(input) {
  input.setDate(input.getDate() + 3); // tambah 3 hari
  return Math.floor((input - Date.now()) / 1000);
}

function ViewCountdownTimer({ initialSeconds = 0, onComplete = () => {}, isvalidation = false }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const pad = (num) => String(num).padStart(2, "0");
  const formatTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(days)} hari ${pad(hours)} jam ${pad(minutes)} menit ${pad(seconds)} detik`;
  };

  return (
    <div
      className={`${
        isvalidation ? "bg-green-200" : "bg-red-200"
      } text-yellow-800 p-4 rounded-md my-4 text-center font-semibold`}
    >
      {isvalidation ? (
        "Pembayaran Berhasil Diverifikasi"
      ) : (
        <>
          ⏳ Waktu tersisa untuk pembayaran:{" "}
          <span className="font-bold">{formatTime(secondsLeft)}</span>
        </>
      )}
    </div>
  );
}
