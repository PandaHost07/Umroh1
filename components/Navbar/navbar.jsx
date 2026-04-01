"use client";

import { Button } from "flowbite-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineArrowUp } from "react-icons/ai";
import { FaWhatsapp, FaUser } from "react-icons/fa";
import { HiBars3 } from "react-icons/hi2";
import logoImage from '../../public/logo_badge.png';
import Skeleton from "../Skeleton/skeleton";

function NavbarComponent({ navbar_list, logo, title = "ADA Tour Travel" }) {
  const { data } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setToUp(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [ToUp, setToUp] = useState(false);
  const [bars, setbars] = useState(false);
  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <nav className="bg-white sticky w-full z-20 top-0 left-0 shadow-lg dark:text-black ">
      <div className=" bg-white md:bg-transparent max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3 dark:text-black">
        {/* LOGO AND TITLE */}
        <a href="/" className="flex items-center">
          {!logo ? (
            <Skeleton.Circle className="mx-auto" />
          ) : (
            <Image
              src={logoImage}
              width={70}
              height={50}
              className="me-3 w-full h-auto"
              alt="logo travel"
            />
          )}
          <span className="self-center text-base font-semibold whitespace-nowrap uppercase">
            {!title ? (
              <Skeleton.MultipleLines sumLine="1" className={"w-20 ms-3 "} />
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: title.replace(/ /, "<br />"),
                }}
              />
            )}
          </span>
        </a>

        {/* BARS ICON */}
        <div className="flex md:order-2 md:hidden">
          <Button
            onClick={() => {
              setbars(!bars);
            }}
            color="light"
          >
            <HiBars3 className="text-xl" />
          </Button>
        </div>

        {/* NAVBAR */}
        <div
          className={`${bars ? "top-12" : "-top-72"
            } items-center justify-between w-full -z-20 md:z-20 absolute duration-1000 md:static left-0 md:flex md:w-auto md:order-1`}
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 bg-gray-50 md:flex-row md:space-x-7 md:mt-0 md:border-0 md:bg-white ">
            {navbar_list.map((e, index) => {
              return (
                <li key={index} className="ms-auto flex items-center">
                  <a
                    href={e.link}
                    className={` ${`/${pathname.split("/")[1]}` == e.link ? "text-blue-800 underline" : "text-gray-900"
                      } block py-2 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-800 md:p-0`}
                  >
                    {e.name}
                  </a>
                </li>
              );
            })}

            <li className="pt-4 md:pt-0 ms-auto">
              {data ? (
                <a href={data && `/${data.user.role}`}>
                  {data && data.user.gambar ? (
                    <Image
                      src={data.user.gambar}
                      width={47}
                      height={47}
                      className="rounded-full border-black border-[1px]"
                      alt={data.user.nama}
                    />
                  ) : (
                    <div className="w-[45px] h-[45px] bg-gray-200 rounded-full flex items-center justify-center border border-gray-400 overflow-hidden">
                      <FaUser className="text-gray-400 w-full h-full mt-2" />
                    </div>
                  )}
                </a>
              ) : (
                <Button
                  href="/login"
                >
                  Login
                </Button>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* WHATSSAPP BUTTON */}
      <div className="fixed left-[80%] top-[89%] lg:left-[94%] lg:top-[88%]">
        <a href={linkWa} target="_blank" className=" bg-green-500 rounded-full w-full h-full flex p-2"   >
          <FaWhatsapp size={45} color="white" />
        </a>
      </div>

      {/* BUTTON TO TOP */}
      {ToUp && (
        <div className="fixed left-[80%] top-[79%] lg:left-[94%] lg:top-[78%]">
          <Button onClick={scrollUp}>
            <AiOutlineArrowUp size={27} color="white" />
          </Button>
        </div>
      )}
    </nav>
  );
}

const number = "+6282269630025"
const textMessage = "Assalamualaikum Saya Ingin Bertanya Tentang Paket Umrah Yang Ada Di ADA Tour & Travel"
const linkWa = `https://api.whatsapp.com/send/?phone=${number}&text=${textMessage}`

export default NavbarComponent;
