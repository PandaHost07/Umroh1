"use client";

import Container from "@/components/Container/container";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Button,
  Progress,
  Spinner,
  Modal,
  Label,
  TextInput,
} from "flowbite-react";
import formatCurrency from "@/components/Currency/currency";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import formatDate from "@/components/Date/formatDate";

import {
  FaHotel,
  FaRegCalendarAlt,
  FaFacebookSquare,
  FaTwitter,
  FaEnvelope,
  FaInstagramSquare,
  FaStar,
} from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { PiAirplaneTiltFill } from "react-icons/pi";
import { alertError, alertSuccess } from "@/components/Alert/alert";

const hitungHari = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function Page({ params }) {
  const [paket, setPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [failed, setFailed] = useState(null);
  const { data, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [nama, setNama] = useState("");
  const [nomorHp, setNomorHp] = useState("");

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const fetchPaket = async () => {
      const { slug } = await params;
      if (!slug) return;

      try {
        // Gunakan public API yang sudah hitung kuota real-time
        const res = await fetch(`/api/public/paket/${slug}`);
        const resJson = await res.json();
        if (res.ok) {
          setPaket(resJson);
        } else {
          setFailed("Terjadi kesalahan saat mengambil data paket.");
        }
      } catch {
        setFailed("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaket();
  }, [params]);

  useEffect(() => {
    if (data) {
      setNama(data.user?.name || "");
      setNomorHp(data.user?.telepon || "");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paket || !data) return;

    if (!paket.isAvailable) {
      alertError("Maaf, seat sudah penuh.");
      return;
    }

    try {
      setLoadingSubmit(true);

      const res = await fetch("/api/jamaah/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          akunEmail: data.user.email,
          paketId: paket.id,
        }),
      });

      const result = await res.json();

      if (!res.ok || result?.error) {
        alertError(result.error || "Gagal memesan paket");
      } else {
        alertSuccess("Paket berhasil dipesan! Silakan lanjutkan ke pembayaran.");
        closeModal();
        setTimeout(() => router.push("/jamaah/pembayaran"), 1500);
      }
    } catch {
      alertError("Terjadi kesalahan saat memesan");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Container>
      <div className="flex py-7 text-3xl font-semibold justify-center md:justify-start">
        Detail Paket Umrah
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" />
        </div>
      ) : failed ? (
        <div className="text-red-500">{failed}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-5">
          {/* LEFT - Gambar & Detail */}
          <div className="w-full flex flex-col justify-center col-span-2 md:p-3 space-y-5">
            <a
              href={paket.gambar}
              target="_blank"
              className="relative w-full h-[32rem] border overflow-hidden bg-gray-100"
            >
              <Image
                src={paket.gambar}
                alt={`Gambar ${paket.nama}`}
                fill
                className="object-contain"
              />
            </a>

            <div className="border p-3">
              <div className="text-xl font-bold">Detail Paket</div>
              <div className="text-gray-600 text-sm md:text-base mt-3 mx-5">
                <div className="flex justify-between pb-1">
                  <div className="flex items-center">
                    <FaRegCalendarAlt size={15} className="mr-2" />
                    Keberangkatan
                  </div>
                  <div>{formatDate(paket.tanggalBerangkat, "short")}</div>
                </div>

                <div className="flex justify-between pb-1">
                  <div className="flex items-center">
                    <MdAccessTime size={15} className="mr-2" />
                    Durasi
                  </div>
                  <div>
                    {hitungHari(paket.tanggalBerangkat, paket.tanggalPulang)} Hari
                  </div>
                </div>

                <div className="flex justify-between pb-1">
                  <div className="flex items-center">
                    <PiAirplaneTiltFill size={15} className="mr-2" />
                    Maskapai
                  </div>
                  <div>{paket.penerbangan?.maskapai ?? "-"}</div>
                </div>

                <div className="flex justify-between pb-1">
                  <div className="flex items-center">
                    <FaHotel size={15} className="mr-2" />
                    Hotel
                  </div>
                  <div className="flex">
                    {[...Array(paket.hotel?.bintang || 0)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-300" size={16} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xl font-bold mt-7">Deskripsi</div>
              <div className="text-gray-600 text-sm md:text-base mt-3 mx-5">
                {paket.deskripsi}
              </div>
            </div>
          </div>

          {/* RIGHT - Info & Form */}
          <div className="font-medium py-4">
            <div className="flex flex-col">
              <div className="bg-sky-600 p-3 text-white flex justify-center font-semibold">
                Informasi Paket
              </div>
              <div className="p-4 border">
                <div className="mb-3">
                  <div className="text-sm">Harga Paket</div>
                  <div className="text-red-500 font-bold p-1 text-2xl">
                    {formatCurrency(paket.harga)}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-600">Seat Tersedia</div>
                  <div className="mt-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Terisi: <span className="font-semibold text-gray-800">{paket.quotaUsage?.used ?? 0}</span></span>
                      <span className="text-gray-500">Total: <span className="font-semibold text-gray-800">{paket.kuota}</span></span>
                    </div>
                    <Progress
                      progress={Math.min(100, paket.quotaUsage?.percentage ?? 0)}
                      size="sm"
                      color={paket.quotaUsage?.percentage >= 80 ? "red" : paket.quotaUsage?.percentage >= 50 ? "yellow" : "blue"}
                    />
                    <div className="mt-1.5 text-center">
                      {paket.isAvailable ? (
                        <span className="text-green-600 font-semibold text-sm">✓ {paket.kuotaTersedia} seat tersedia</span>
                      ) : (
                        <span className="text-red-600 font-semibold text-sm">✗ Seat penuh</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {paket.isAvailable ? (
                    <Button
                      onClick={() => status === "authenticated" ? openModal() : router.push("/login")}
                      className="w-full"
                      color="blue"
                    >
                      Pesan Sekarang
                    </Button>
                  ) : (
                    <Button disabled className="w-full" color="gray">
                      Seat Penuh
                    </Button>
                  )}
                </div>
              </div>

              {/* Bagikan */}
              <div className="mt-5 font-semibold">Bagikan Paket :</div>
              <div className="mt-2 flex gap-3">
                <a
                  href={`mailto:?subject=Paket Umrah Menarik&body=Cek paket ini: ${
                    typeof window !== "undefined"
                      ? encodeURIComponent(window.location.href)
                      : ""
                  }`}
                  title="Kirim via Gmail"
                >
                  <FaEnvelope size={30} className="text-[#000000] hover:opacity-80" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${
                    typeof window !== "undefined"
                      ? encodeURIComponent(window.location.href)
                      : ""
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Bagikan ke Facebook"
                >
                  <FaFacebookSquare size={30} className="text-[#1877F2] hover:opacity-80" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${
                    typeof window !== "undefined"
                      ? encodeURIComponent(window.location.href)
                      : ""
                  }&text=Lihat+Paket+Umrah+Ini`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Bagikan ke Twitter"
                >
                  <FaTwitter size={30} className="text-[#1DA1F2] hover:opacity-80" />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Lihat di Instagram"
                >
                  <FaInstagramSquare size={30} className="text-pink-500 hover:opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pemesanan */}
      <Modal show={showModal} onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <Modal.Header>Form Pemesanan</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" value="Nama Lengkap" />
                <TextInput
                  id="nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomorHp" value="Nomor HP" />
                <TextInput
                  id="nomorHp"
                  type="tel"
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? <Spinner /> : "Pesan Paket"}
            </Button>
            <Button color="gray" onClick={closeModal}>
              Batal
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
}
