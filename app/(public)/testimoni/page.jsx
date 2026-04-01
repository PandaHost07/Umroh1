"use client";
import React, { useState } from "react";
import Container from "@/components/Container/container";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const DUMMY_TESTIMONI = [
  {
    nama: "Budi Santoso",
    asal: "Bandar Lampung",
    judul: "Pengalaman Ibadah yang Luar Biasa",
    deskripsi:
      "Saya sangat puas dengan layanan dari Ada Tour Travel. Semua proses dari awal hingga akhir berjalan lancar dan profesional. Pembimbing sangat sabar dan informatif. Terima kasih Ada Tour Travel!",
    rating: 5,
    tanggal: "Januari 2025",
    paket: "Paket Umrah Reguler",
  },
  {
    nama: "Siti Aminah",
    asal: "Metro, Lampung",
    judul: "Perjalanan yang Tak Terlupakan",
    deskripsi:
      "Perjalanan umrah saya bersama Ada Tour Travel benar-benar tak terlupakan. Mereka sangat memperhatikan detail dan kebutuhan kami selama di tanah suci. Hotel dekat Masjidil Haram, sangat nyaman.",
    rating: 5,
    tanggal: "Februari 2025",
    paket: "Paket Umrah Plus",
  },
  {
    nama: "Ahmad Fauzi",
    asal: "Pringsewu, Lampung",
    judul: "Pelayanan Prima dan Amanah",
    deskripsi:
      "Alhamdulillah, perjalanan umrah pertama saya berjalan dengan sangat baik. Tim Ada Tour Travel sangat profesional dan amanah. Semua jadwal tepat waktu dan fasilitas sangat memuaskan.",
    rating: 5,
    tanggal: "Maret 2025",
    paket: "Paket Umrah Reguler",
  },
  {
    nama: "Dewi Rahayu",
    asal: "Kotabumi, Lampung",
    judul: "Recommended Banget!",
    deskripsi:
      "Sudah dua kali umrah bersama Ada Tour Travel dan selalu puas. Harga terjangkau tapi kualitas tidak murahan. Pembimbing ibadah sangat berpengalaman dan sabar membimbing jamaah.",
    rating: 4,
    tanggal: "Januari 2025",
    paket: "Paket Umrah Hemat",
  },
  {
    nama: "H. Mahmud Hakim",
    asal: "Bandar Lampung",
    judul: "Sangat Memuaskan untuk Keluarga",
    deskripsi:
      "Kami sekeluarga berangkat umrah bersama Ada Tour Travel. Koordinasi sangat baik, mulai dari keberangkatan hingga kepulangan. Anak-anak pun merasa nyaman dan aman selama perjalanan.",
    rating: 5,
    tanggal: "Desember 2024",
    paket: "Paket Umrah Keluarga",
  },
  {
    nama: "Nurul Hidayah",
    asal: "Lampung Selatan",
    judul: "Pengalaman Spiritual yang Mendalam",
    deskripsi:
      "Bimbingan ibadah dari Ada Tour Travel sangat membantu saya memahami setiap ritual umrah dengan lebih khusyuk. Terima kasih telah menjadi bagian dari perjalanan spiritual saya.",
    rating: 5,
    tanggal: "November 2024",
    paket: "Paket Umrah Plus",
  },
  {
    nama: "Rizky Pratama",
    asal: "Bandar Lampung",
    judul: "Harga Sesuai Kualitas",
    deskripsi:
      "Awalnya ragu karena harga lebih terjangkau dari travel lain, tapi ternyata kualitasnya tidak kalah. Hotel bintang 4, makan enak, dan pembimbing yang ramah. Sangat direkomendasikan!",
    rating: 4,
    tanggal: "Oktober 2024",
    paket: "Paket Umrah Hemat",
  },
  {
    nama: "Fatimah Zahra",
    asal: "Way Kanan, Lampung",
    judul: "Pelayanan Terbaik dari Awal",
    deskripsi:
      "Dari proses pendaftaran hingga kepulangan, semua berjalan mulus. Staff Ada Tour Travel sangat responsif dan membantu. Dokumen diurus dengan cepat dan tepat. Insya Allah akan umrah lagi bersama Ada Tour Travel.",
    rating: 5,
    tanggal: "September 2024",
    paket: "Paket Umrah Reguler",
  },
  {
    nama: "Ust. Hamid Ridwan",
    asal: "Bandar Lampung",
    judul: "Amanah dan Terpercaya",
    deskripsi:
      "Sebagai pembimbing yang sudah beberapa kali berangkat bersama berbagai travel, Ada Tour Travel adalah yang paling amanah. Semua janji ditepati dan jamaah selalu diprioritaskan.",
    rating: 5,
    tanggal: "Agustus 2024",
    paket: "Paket Umrah Plus",
  },
  {
    nama: "Hj. Rosmawati",
    asal: "Lampung Tengah",
    judul: "Umrah Perdana yang Berkesan",
    deskripsi:
      "Ini umrah pertama saya di usia 60 tahun. Alhamdulillah Ada Tour Travel sangat memperhatikan jamaah lansia. Petugas selalu siap membantu dan tidak pernah meninggalkan jamaah sendirian.",
    rating: 5,
    tanggal: "Juli 2024",
    paket: "Paket Umrah Reguler",
  },
  {
    nama: "Irfan Maulana",
    asal: "Bandar Lampung",
    judul: "Proses Cepat dan Mudah",
    deskripsi:
      "Proses pendaftaran sangat mudah dan cepat. Semua dokumen dibantu pengurusannya. Berangkat tepat waktu dan pulang sesuai jadwal. Tidak ada kendala sama sekali selama perjalanan.",
    rating: 4,
    tanggal: "Juni 2024",
    paket: "Paket Umrah Hemat",
  },
  {
    nama: "Yuliana Putri",
    asal: "Pesawaran, Lampung",
    judul: "Sangat Profesional",
    deskripsi:
      "Ada Tour Travel benar-benar profesional dalam mengelola perjalanan umrah. Dari pemilihan hotel, transportasi, hingga bimbingan ibadah semuanya terorganisir dengan sangat baik.",
    rating: 5,
    tanggal: "Mei 2024",
    paket: "Paket Umrah Plus",
  },
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

const avgRating =
  DUMMY_TESTIMONI.reduce((a, b) => a + b.rating, 0) / DUMMY_TESTIMONI.length;

export default function Page() {
  const [option, setOption] = useState("All");

  const filtered =
    option !== "All"
      ? DUMMY_TESTIMONI.filter((item) => item.rating === option)
      : DUMMY_TESTIMONI;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-500 text-white w-full py-16 md:py-24 shadow-md text-center">
        <Container>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Testimoni Jamaah
          </h1>
          <p className="text-sm md:text-lg font-light text-blue-100 max-w-2xl mx-auto mb-8">
            Cerita inspiratif perjalanan ibadah Umrah dari jamaah yang telah
            mempercayakan perjalanan suci mereka bersama kami.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-4xl font-extrabold">{DUMMY_TESTIMONI.length}+</div>
              <div className="text-blue-200 text-sm mt-1">Ulasan Jamaah</div>
            </div>
            <div className="w-px bg-white/20 hidden md:block" />
            <div className="text-center">
              <div className="text-4xl font-extrabold flex items-center justify-center gap-1">
                {avgRating.toFixed(1)}
                <FaStar className="text-yellow-300 text-3xl" />
              </div>
              <div className="text-blue-200 text-sm mt-1">Rating Rata-rata</div>
            </div>
            <div className="w-px bg-white/20 hidden md:block" />
            <div className="text-center">
              <div className="text-4xl font-extrabold">
                {DUMMY_TESTIMONI.filter((t) => t.rating === 5).length}
              </div>
              <div className="text-blue-200 text-sm mt-1">Ulasan Bintang 5</div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Rating Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setOption("All")}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-sm text-sm ${
                option === "All"
                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Semua ({DUMMY_TESTIMONI.length})
            </button>
            {[5, 4, 3].map((num) => {
              const count = DUMMY_TESTIMONI.filter((t) => t.rating === num).length;
              return (
                <button
                  key={num}
                  onClick={() => setOption(num)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-sm text-sm ${
                    option === num
                      ? "bg-blue-600 text-white ring-2 ring-blue-300"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <FaStar
                    className={option === num ? "text-yellow-300" : "text-yellow-400"}
                    size={13}
                  />
                  {num} Bintang ({count})
                </button>
              );
            })}
          </div>

          {/* Cards */}
          {filtered.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
              {filtered.map((item, i) => (
                <div
                  key={i}
                  className="break-inside-avoid bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative"
                >
                  <FaQuoteLeft className="absolute top-5 right-5 text-blue-50" size={36} />

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <FaStar
                        key={idx}
                        size={15}
                        className={idx < item.rating ? "text-yellow-400" : "text-gray-200"}
                      />
                    ))}
                    <span className="ml-2 text-xs text-gray-400">{item.tanggal}</span>
                  </div>

                  {/* Paket badge */}
                  <span className="inline-block text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full mb-3">
                    {item.paket}
                  </span>

                  <h5 className="text-base font-bold text-gray-800 mb-2">{item.judul}</h5>

                  <p className="text-sm text-gray-500 italic leading-relaxed mb-5">
                    &ldquo;{item.deskripsi}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${
                        AVATAR_COLORS[i % AVATAR_COLORS.length]
                      }`}
                    >
                      {item.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{item.nama}</div>
                      <div className="text-xs text-gray-400">{item.asal}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400 font-medium">
              Tidak ada ulasan untuk rating ini.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
