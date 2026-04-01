"use client";
import React, { useState, useEffect } from "react";
import Container from "@/components/Container/container";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { Spinner } from "flowbite-react";
import { FaSearch } from "react-icons/fa";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [images, setImages] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPaketImages = async () => {
      try {
        const res = await fetch("/api/public/paket");
        const data = await res.json();
        if (data?.paket && data.paket.length > 0) {
          const imgs = data.paket.map((p) => ({
            src: p.gambar,
            label: p.nama,
            tanggal: p.tanggalBerangkat
              ? new Date(p.tanggalBerangkat).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })
              : "",
          }));
          setImages(imgs);
        } else {
          setImages([]);
        }
      } catch {
        setImages([]);
      }
    };
    fetchPaketImages();
  }, []);

  const filtered = images
    ? images.filter((img) =>
        img.label.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const handleImageClick = (img) => {
    setSelectedImage(img.src);
    setSelectedLabel(img.label);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedImage(null);
      setSelectedLabel("");
    }, 300);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-500 text-white w-full py-16 md:py-24 shadow-md text-center">
        <Container>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Galeri Momen Perjalanan
          </h1>
          <p className="text-lg md:text-xl font-light text-blue-100 max-w-2xl mx-auto mb-8">
            Abadikan detik-detik spiritual langkah demi langkah di Tanah Suci.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama paket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-gray-800 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {filtered === null ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Spinner size="xl" color="info" />
              <p className="text-gray-400 font-medium animate-pulse">Memuat galeri...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-40 text-gray-400 font-medium">
              {search ? `Tidak ada foto untuk "${search}".` : "Belum ada foto tersedia."}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Menampilkan <span className="font-semibold text-blue-500">{filtered.length}</span> foto
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filtered.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer group hover:-translate-y-1 transition-all duration-500 bg-gray-100"
                    onClick={() => handleImageClick(img)}
                  >
                    <Image
                      src={img.src}
                      alt={img.label || `Galeri ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                      <span className="text-white text-sm font-semibold translate-y-3 group-hover:translate-y-0 transition-transform duration-500 line-clamp-2">
                        {img.label}
                      </span>
                      {img.tanggal && (
                        <span className="text-blue-200 text-xs mt-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          {img.tanggal}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Container>

      {/* Lightbox Modal */}
      {modalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={handleCloseModal}
        >
          <div className="relative w-[95vw] md:w-[80vw] lg:w-[65vw] flex flex-col items-center">
            <button
              className="absolute -top-12 right-0 z-50 text-white bg-white/10 hover:bg-white/30 hover:rotate-90 transition-all duration-300 p-3 rounded-full"
              onClick={handleCloseModal}
            >
              <IoClose size={28} />
            </button>
            <div
              className="relative w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt={selectedLabel || "Foto Galeri"}
                fill
                className="object-contain"
                quality={90}
              />
            </div>
            {selectedLabel && (
              <p className="mt-4 text-white text-sm font-medium text-center px-4">
                {selectedLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
