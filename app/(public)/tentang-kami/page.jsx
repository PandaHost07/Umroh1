import React from "react";
import Container from "@/components/Container/container";
import Image from "next/image";
import { FaMapMarkerAlt, FaRegClock, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import logoImage from "../../../public/logo_badge.png";

const perusahaan = {
  namaTravel: "Ada Tour Travel",
  image: logoImage,
  jam: "08.00 - 16.00 WIB",
  lokasi: "Jl. ZA. Pagar Alam No.46b, Labuhan Ratu, Kec. Kedaton, Kota Bandar Lampung, Lampung",
  email: "adhatourtravel27@gmail.com",
  whatssapp: "0857252255159",
  maps: "https://maps.app.goo.gl/wbocDg4mpHjrH2ui9",
  embededMaps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.7747806265825!2d105.30558957408584!3d-5.45112005435948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40d954102c6f09%3A0x58a52ab9decc2e25!2sAda%20Tour%20%26%20Travel%20Mitra%20Resmi!5e0!3m2!1sid!2sid!4v1745849831989!5m2!1sid!2sid",
  deskripsi: `<p>Perusahaan kami berdiri secara resmi pada Tahun 2012 dengan nama Erahajj Indonesia. Kami adalah perusahaan Travel professional telah 10 tahun lebih berpengalaman di dunia haji dan umrah.</p><p>Kami adalah Perusahaan yang bergerak di bidang Jasa Umrah & Haji, Provider visa, Land Arrangement, Paket Umrah Plus, Paket Haji Furoda dan Paket Haji Khusus.</p>`,
};

export default function Page() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-500 text-white w-full py-16 md:py-24 shadow-lg">
        <Container>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center">
            Mengenal Kami Lebih Dekat
          </h1>
          <p className="text-lg md:text-xl font-light text-blue-100 max-w-2xl mx-auto text-center">
            Pelayanan ibadah haji & umrah terpercaya untuk kenyamanan perjalanan spiritual Anda.
          </p>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Logo & Deskripsi */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-shrink-0 w-48 h-48 lg:w-64 lg:h-64 relative bg-gray-50 flex items-center justify-center rounded-2xl overflow-hidden shadow-inner p-4">
                <Image
                  src={perusahaan.image}
                  alt="Logo Ada Tour Travel"
                  width={220}
                  height={220}
                  priority
                  className="object-contain"
                />
              </div>
              <div className="flex-grow text-gray-700 leading-relaxed">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2 inline-block">
                  Profil Perusahaan
                </h2>
                <div
                  dangerouslySetInnerHTML={{ __html: perusahaan.deskripsi }}
                  className="prose prose-lg max-w-none text-gray-600 space-y-4"
                />
              </div>
            </div>
          </div>

          {/* Lokasi & Kontak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-96 relative">
              <div className="absolute top-0 left-0 bg-blue-600 text-white py-2 px-6 rounded-br-2xl font-bold z-10 shadow-md">
                Peta Lokasi Kantor
              </div>
              <iframe
                title="Google Maps"
                src={perusahaan.embededMaps}
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Kontak Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
                  <FaMapMarkerAlt size={28} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Alamat Lengkap</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{perusahaan.lokasi}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center text-center">
                <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4">
                  <FaRegClock size={28} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Jam Operasional</h3>
                <p className="text-gray-600 text-sm font-medium">{perusahaan.jam}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center text-center">
                <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                  <FaEnvelope size={28} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Alamat Email</h3>
                <p className="text-gray-600 text-sm font-medium">{perusahaan.email}</p>
              </div>

              <a
                href={`https://wa.me/${perusahaan.whatssapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center text-center text-white"
              >
                <div className="bg-white p-3 rounded-full text-green-600 mb-4 shadow-sm">
                  <FaWhatsapp size={28} />
                </div>
                <h3 className="font-bold mb-1">Hubungi Kami</h3>
                <p className="text-green-100 text-sm font-medium">{perusahaan.whatssapp}</p>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
