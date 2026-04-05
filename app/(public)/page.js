"use client";

import { Button } from "flowbite-react";
import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import { FaPhoneAlt, FaQuoteLeft } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { useEffect, useState } from "react";

import Container from "@/components/Container/container";
import WhymeComponent from "@/components/WhyWe/whyme";
import kabah from "../../public/kabah.png";
import logoImage from "../../public/logo_badge.png";

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-amber-500"];

export default function Page() {
  const [testimoniList, setTestimoniList] = useState([]);

  useEffect(() => {
    fetch("/api/jamaah/testimoni?limit=3")
      .then((r) => r.json())
      .then((d) => { if (d?.testimoni) setTestimoniList(d.testimoni); })
      .catch(() => {});
  }, []);
  return (
    <>
      {/* HERO */}
      <div className="relative flex max-w-full justify-center items-center">
        <div className="relative w-full h-[30rem] lg:h-screen">
          <Image
            src={kabah}
            alt="kabah"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className="absolute flex flex-col items-center justify-center bg-black/80 w-full h-full text-white">
          <p className="md:text-xl lg:text-3xl font-bold my-3 text-center uppercase">
            WELCOME TO <br /> Ada Tour Travel
          </p>
          <p className="px-4 text-xs md:text-lg text-center mt-2 md:mt-5">
            Percayakan perjalanan ibadah haji dan umrah Anda pada travel kami
            <br />
            kami siap melayani Anda
          </p>
          <div className="flex justify-center my-6 w-full text-center">
            <Button color="info" href="/paket">
              Pesan Sekarang
            </Button>
          </div>
        </div>
      </div>

      {/* TENTANG KAMI */}
      <Container className="bg-slate-100">
        <div className="text-xl font-medium p-3 text-black">Tentang Kami</div>
        <div className="grid grid-cols-2 p-3 md:mb-8 mt-5 gap-3">
          <div className="col-span-2 md:col-span-1 flex flex-col space-y-3">
            <div className="text-4xl font-semibold">
              Perjalanan 20 tahun <br /> Ada Tour Travel
            </div>
            <div className="text-sm text-justify md:text-base py-3 md:mr-12 space-y-3 text-gray-700">
              <p>
                Perusahaan kami berdiri secara resmi pada Tahun 2012 dengan nama
                Erahajj Indonesia. Kami adalah perusahaan Travel professional
                telah 10 tahun lebih berkecimpung di dunia haji dan umrah.
              </p>
              <p>
                Kami bergerak di bidang Jasa Umrah & Haji, Provider visa, Land
                Arrangement, Paket Umrah Plus, Paket Haji Furoda dan Paket Haji
                Khusus.
              </p>
            </div>
            <div className="my-3">
              <Button href="/tentang-kami" className="w-fit">
                Selengkapnya
              </Button>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col justify-center items-center">
            <Image
              src={logoImage}
              alt="logo Ada Tour Travel"
              width={300}
              height={300}
              priority
              className="h-auto mb-7 md:mb-0"
            />
            <div className="text-3xl font-semibold mt-10">Ada Tour Travel</div>
          </div>
        </div>
      </Container>

      {/* MENGAPA MEMILIH KAMI */}
      <Container className="bg-white">
        <div className="text-xl font-medium p-3 text-black">
          Mengapa Memilih Kami ?
        </div>
        <WhymeComponent />
      </Container>

      {/* KONTAK */}
      <Container className="bg-slate-100">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold lg:text-3xl">Kontak</h2>
          <hr className="border-2 border-sky-700 w-1/6 mt-3 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex flex-col space-y-6 py-10 md:pl-12">
              <a
                target="_blank"
                href="https://wa.me/62857252255159"
                className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
              >
                <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 transition-all">
                  <FaPhoneAlt size={21} />
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-sky-700 transition-colors">
                    Telepon
                  </div>
                  <div className="text-sm">0857 2522 5519</div>
                </div>
              </a>

              <a
                target="_blank"
                href="https://maps.app.goo.gl/wbocDg4mpHjrH2ui9"
                className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
              >
                <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 transition-all">
                  <IoLocationOutline size={25} />
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-sky-700 transition">
                    Lokasi
                  </div>
                  <div className="text-sm leading-5">
                    Jl. ZA. Pagar Alam No.46b, Labuhan Ratu, Kec. Kedaton,
                    Kota Bandar Lampung, Lampung
                  </div>
                </div>
              </a>

              <a
                target="_blank"
                href="https://share.google/epMBRhdF8AYm9GNck"
                className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
              >
                <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 transition-all">
                  <IoMdTime size={25} />
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-sky-700 transition">
                    Jam Operasional
                  </div>
                  <div className="text-sm">Senin–Jumat (08.00–15.00)</div>
                </div>
              </a>

              <a
                target="_blank"
                href="mailto:adhatourtravel27@gmail.com"
                className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
              >
                <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 transition-all">
                  <MdOutlineMail size={25} />
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-red-700 transition">
                    Email
                  </div>
                  <div className="text-sm">adhatourtravel27@gmail.com</div>
                </div>
              </a>
            </div>

            <div className="lg:px-4">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.7747806265825!2d105.30558957408584!3d-5.45112005435948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40d954102c6f09%3A0x58a52ab9decc2e25!2sAda%20Tour%20%26%20Travel%20Mitra%20Resmi!5e0!3m2!1sid!2sid!4v1745849831989!5m2!1sid!2sid"
                  className="w-full h-[25rem] md:h-96"
                  loading="lazy"
                  title="Lokasi Ada Tour Travel"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* TESTIMONI */}
      <Container className="bg-white">
        <div className="text-xl font-medium p-3 text-black">Testimoni</div>
        <div className="text-3xl font-medium px-3 text-black mb-8">
          Apa Kata Mereka?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 md:mb-12">
          {testimoniList.length === 0 ? (
            // Fallback jika belum ada testimoni di DB
            [
              { nama: "Budi Santoso", pesan: "Saya sangat puas dengan layanan dari Ada Tour Travel. Semua proses dari awal hingga akhir berjalan lancar dan profesional.", rating: 5 },
              { nama: "Siti Aminah", pesan: "Perjalanan umrah saya bersama Ada Tour Travel benar-benar tak terlupakan. Mereka sangat memperhatikan detail dan kebutuhan kami.", rating: 4 },
              { nama: "Ahmad Fauzi", pesan: "Alhamdulillah, perjalanan umrah pertama saya berjalan dengan sangat baik. Tim Ada Tour Travel sangat profesional dan amanah.", rating: 5 },
            ].map((ts, i) => (
              <div key={i} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <FaQuoteLeft className="absolute top-4 right-4 text-blue-50" size={32} />
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <FaStar key={j} size={14} className={j < ts.rating ? "text-yellow-400" : "text-gray-200"} />)}
                </div>
                <p className="text-sm text-gray-500 italic mb-4">&ldquo;{ts.pesan}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {ts.nama.charAt(0)}
                  </div>
                  <div className="font-semibold text-sm text-gray-700">{ts.nama}</div>
                </div>
              </div>
            ))
          ) : (
            testimoniList.map((ts, i) => (
              <div key={ts.id || i} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <FaQuoteLeft className="absolute top-4 right-4 text-blue-50" size={32} />
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <FaStar key={j} size={14} className={j < ts.rating ? "text-yellow-400" : "text-gray-200"} />)}
                </div>
                <p className="text-sm text-gray-500 italic mb-4">&ldquo;{ts.pesan}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {(ts.akun?.nama || ts.akunEmail || "?").charAt(0)}
                  </div>
                  <div className="font-semibold text-sm text-gray-700">{ts.akun?.nama || ts.akunEmail}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center pb-8">
          <Button href="/testimoni" color="light">
            Lihat Semua Testimoni
          </Button>
        </div>
      </Container>
    </>
  );
}
