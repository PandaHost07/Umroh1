"use client";
import Image from "next/image";
import trusted from "../../public/trusted.svg";
import plane from "../../public/plane.svg";
import hotel from "../../public/hotel.svg";
import food from "../../public/food.svg";
import userislamic from "../../public/user-islamic.svg";
import etc from "../../public/etc.svg";

function WhymeComponent() {
  return (
    <>
      <div className="grid grid-cols-4 md:grid-cols-6 p-3 gap-3 md:gap-6">
        {whyMe.map((e, i) => {
          return (
            <div
              className="col-span-2 px-0 p-3 rounded-lg bg-slate-100 hover:bg-slate-300 flex flex-col justify-between lg:px-7 dark:text-black"
              key={i}
            >
              <div className="flex justify-center items-center h-3/5">
                <Image
                  src={e.icon}
                  alt={e.title}
                  width="0"
                  height="0"
                  priority={true}
                />
              </div>
              <div className="flex flex-col items-center pt-2">
                <div className="text-sm md:text-md font-bold py-2 md:py-1">
                  {e.title}
                </div>
                <div className="text-xs px-1 md:text-sm text-center md:p-2 pb-4">
                  {e.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default WhymeComponent;

const whyMe = [
  {
    icon: trusted,
    title: "Terpercaya",
    content:
      "Resmi terdaftar di Kementrian Agama Republik Indonesia PPIU No. 235 Tahun 2020",
  },
  {
    icon: plane,
    title: "Fasilitas Nyaman",
    content:
      "Penerbangan menggunakan maskapai Garuda Indonesia dan Transportasi Bus full AC",
  },
  {
    icon: hotel,
    title: "Hotel Berbintang",
    content: "Fasilitas hotel setaraf bintang empat (*4) dan lima (*5) ",
  },
  {
    icon: food,
    title: "Makanan Terbaik ",
    content:
      "Waktu makan 3 kali sehari dengan pemilihan makanan terbaik untuk jamaah",
  },
  {
    icon: userislamic,
    title: "Pembimbing",
    content:
      "Pembimbing langsung dari orang yang berpengalaman, amanah dan berkompetan",
  },
  {
    icon: etc,
    title: "Fasilitas Lainnya",
    content:
      "Air zam-zam 5 liter, city tour kota mekkah dan madinah, pasport, visa dan lain-lain",
  },
];
