"use client";

import { Button, Card, Carousel } from "flowbite-react";
import Image from "next/image";
import { FaStar } from "react-icons/fa6";

import Container from "@/components/Container/container";
import formatDate from "@/components/Date/formatDate";
import Skeleton from "@/components/Skeleton/skeleton";
import WhymeComponent from "@/components/WhyWe/whyme";
import kabah from "../../public/kabah.png";
import logoImage from '../../public/logo_badge.png';
import testimoniImg from "../../public/testimoni.jpg";

import { FaPhoneAlt } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";

const testimoni = [
  {
    id: "TSN1",
    nama: "Budi Santoso",
    judul: "Pengalaman Ibadah yang Luar Biasa",
    deskripsi: "Saya sangat puas dengan layanan dari Ada Tour Travel. Semua proses dari awal hingga akhir berjalan lancar dan profesional. Terima kasih Ada Tour Travel!",
    rating: 5,
  },
  {
    id: "TSN2",
    nama: "Siti Aminah",
    judul: "Perjalanan yang Tak Terlupakan",
    deskripsi: "Perjalanan umrah saya bersama Ada Tour Travel benar-benar tak terlupakan. Mereka sangat memperhatikan detail dan kebutuhan kami selama di tanah suci.",
    rating: 4,
  }
]

export default function Page() {

  return (
    <>
      {/* WELCOME */}
      <div className="relative flex max-w-full justify-center items-center">
        <div className="relative w-full h-[30rem] lg:h-screen">
          <Image
            src={kabah}
            alt="kabah"
            layout="fill"
            objectFit="cover"
            priority={true}
          />
        </div>
        <div className="absolute flex flex-col items-center justify-center bg-black w-full h-full bg-opacity-80 text-white">
          <p className="md:text-xl lg:text-3xl font-bold my-3 text-center uppercase">
            WELCOME TO <br /> Ada Tour Travel
          </p>
          <p className=" px-4 text-xs md:text-lg text-center mt-2 md:mt-5">
            Percayakan perjalanan ibadah haji dan umrah Anda pada travel kami
            <br />
            kami siap melayani Anda
          </p>

          <div className=" flex justify-center my-6 w-full text-center">
            <Button color="info" href="/paket">Pesan Sekarang</Button>
          </div>
        </div>
      </div>

      {/* TENTANG KAMI */}
      <Container className={`bg-slate-100`}>
        <div className="text-xl font-medium p-3 text-black ">Tentang Kami</div>
        <div className="grid grid-cols-2 p-3 md:mb-8 mt-5 gap-3">
          <div className="col-span-2 md:col-span-1 flex flex-col space-y-3 ">
            <>
              <div className=" text-4xl font-semibold">Perjalanan 20 tahun <br /> Ada Tour Travel</div>
              <div className="text-sm text-justify md:text-base py-3 md:mr-12 space-y-3 text-gray-700">
                <p>Perusahaan kami berdiri secara resmi pada Tahun 2012 dengan nama Erahajj Indonesia. Kami adalah perusahaan Travel professional telah 10 tahun lebih berkecimpung di dunia haji dan umrah</p>
                <p>Kami adalah Perusahaan yang bergerak di bidang Jasa Umrah & Haji, Provider visa, Land Arrangement, Paket Umrah Plus, Paket Haji Furoda dan Paket Haji Khusus.</p>
              </div>
            </>
            <div className="my-3">
              <Button href="/tentang-kami" className="w-fit">Selengkapnya</Button>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col justify-center md:justify-start items-center">
            {logoImage ? (
              <>
                <Image
                  src={logoImage}
                  alt="logo"
                  width={300}
                  height="0"
                  priority={true}
                  className="h-auto mb-7 md:mb-0"
                />
                <div className=" text-3xl font-semibold mt-10">Ada Tour Travel</div>
              </>
            ) : (
              <Skeleton.Circle width="200px" />
            )}
          </div>

        </div>
      </Container>

      {/* Mengapa Memilih Kami */}
      <Container className={`bg-white`}>
        <div className="text-xl font-medium p-3 text-black ">
          Mengapa Memilih Kami ?
        </div>
        <WhymeComponent />
      </Container>

      {/* Contact Section */}
      <Container className={`bg-slate-100`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold lg:text-3xl">Kontak</h2>
          <hr className="border-2 border-sky-700 w-1/6 mt-3 mb-10" />

          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Kontak Info (kiri) */}
              <div className="flex flex-col space-y-6 py-10 md:pl-12">

                {/* TELEPON */}
                <a target="_blank"
                  href="https://wa.me/+62895330731972"
                  className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
                >
                  <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 group-hover:shadow-md transition-all">
                    <FaPhoneAlt size={21} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold group-hover:text-sky-700 transition-colors">
                      Telepon
                    </div>
                    <div className="text-sm">+62895330731972</div>
                  </div>
                </a>

                {/* LOKASI */}
                <a target="_blank"
                  href="https://maps.app.goo.gl/wbocDg4mpHjrH2ui9"
                  className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
                >
                  <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 group-hover:shadow-md transition-all">
                    <IoLocationOutline size={25} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold group-hover:text-sky-700 transition">
                      Lokasi
                    </div>
                    <div className="text-sm leading-5">
                      JJl. ZA. Pagar Alam No.46b, Labuhan Ratu, Kec. Kedaton, Kota Bandar Lampung, Lampung
                    </div>
                  </div>
                </a>

                {/* JAM OPERASIONAL */}
                <a target="_blank"
                  href="https://share.google/epMBRhdF8AYm9GNck"
                  className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
                >
                  <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 group-hover:shadow-md transition-all">
                    <IoMdTime size={25} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold group-hover:text-sky-700 transition">
                      Jam Operasional
                    </div>
                    <div className="text-sm">Senin–Jumat (08.00–15.00)</div>
                  </div>
                </a>

                {/* EMAIL */}
                <a target="_blank"
                  href="mailto:adhatourtravel27@gmail.com"
                  className="flex items-center space-x-4 group hover:scale-[1.02] transition-all"
                >
                  <div className="p-4 rounded-full bg-sky-100 text-sky-700 shadow group-hover:bg-sky-200 group-hover:shadow-md transition-all">
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

              {/* MAP */}
              <div className="lg:px-4">
                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.7747806265825!2d105.30558957408584!3d-5.45112005435948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40d954102c6f09%3A0x58a52ab9decc2e25!2sAda%20Tour%20%26%20Travel%20Mitra%20Resmi!5e0!3m2!1sid!2sid!4v1745849831989!5m2!1sid!2sid"
                    className="w-full h-[25rem] md:h-96 md:w-[33rem]"
                  ></iframe>
                </div>
              </div>

            </div>
          </section>
        </div>
      </Container>

      {/* TESTIMONI */}
      <Container className={`bg-white`}>
        <div className="text-xl font-medium p-3 text-black">Testimoni</div>
        <div className="text-3xl font-medium px-3 text-black mb-6">Apa Kata Mereka?</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-3 md:mb-12">
          {/* Carousel Testimoni */}
          <div className="col-span-1 h-96 md:h-full">
            {testimoni && testimoni.length != 0 ?
              <Carousel slideInterval={4000} className="rounded-lg overflow-hidden shadow-md">
                {testimoni.map((ts, i) => (
                  <Card
                    key={i}
                    className="flex flex-col justify-between h-full p-3 md:p-6 bg-white border border-gray-200 shadow-sm"
                  >
                    <div>
                      <h5 className="text-lg font-bold text-gray-800 mb-2 capitalize">
                        {ts.judul}
                      </h5>
                      <div className="flex mb-3">
                        {[...Array(ts.rating)].map((_, j) => (
                          <FaStar key={j} className="text-yellow-400" size={16} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {ts.deskripsi}
                      </p>
                    </div>
                    <div className="mt-4 text-sm font-semibold uppercase text-gray-700">
                      {ts.nama} - {formatDate(ts.tanggal, "short")}
                    </div>
                  </Card>
                ))}
              </Carousel> : (<></>)}
          </div>

          {/* Gambar Testimoni */}
          <div className="col-span-1">
            <div className="relative w-full h-56 md:h-96 rounded-lg overflow-hidden shadow-md">
              <Image
                src={testimoniImg}
                alt="Testimoni Image"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </Container>

    </>
  );
}
