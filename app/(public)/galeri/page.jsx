"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Container/container";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { getData } from "@/lib/CRUD";
import { Spinner } from "flowbite-react";

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [galeri, setGaleri] = useState(null);

    useEffect(() => {
        const fetching = async () => {
            const getGaleri = await getData("galeri")
            if (getGaleri) setGaleri(getGaleri)
        };

        fetching();
    }, []);

    const handleImageClick = (img) => {
        setSelectedImage(img);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedImage(null);
    };

    return (
        <Container>
            <div className="flex pb-10 text-3xl font-semibold justify-center md:justify-start">
                Galeri
            </div>

            <div className="p-3 md:p-5 border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-3 md:mb-12">
                    {
                        galeri ? (<>
                            {galeri.map((img, i) => (
                                <div
                                    key={i}
                                    className="relative w-full h-56 md:h-80 rounded-lg overflow-hidden shadow-md cursor-pointer group"
                                    onClick={() => handleImageClick(img.image)}
                                >
                                    <Image
                                        src={img.image}
                                        alt={`Image ${img.image}`}
                                        fill
                                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Overlay hitam & teks */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm md:text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Lihat Gambar
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </>) : (
                            <div className="flex w-full h-full justify-center items-center col-span-2 md:col-span-4">
                                <Spinner size="xl"></Spinner>
                            </div>
                        )
                    }

                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
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
                                src={selectedImage}
                                alt="Selected Image"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
}
