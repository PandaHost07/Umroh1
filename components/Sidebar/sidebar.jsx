"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { PiSignOut } from "react-icons/pi";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { IoKeyOutline } from "react-icons/io5";
import { CiSun } from "react-icons/ci";
import { FaGlobeAmericas, FaUser } from "react-icons/fa";
import BreadcrumbComponent from "../Breadcumb/breadcumb";
import Image from "next/image";
import { useTheme } from "next-themes";
import Skeleton from "../Skeleton/skeleton";
import NotifBadgePembayaran from "./notifBadge";

export default function Sidebar({ children, list = [], role = "admin" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [profile, setprofile] = useState(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        const response = await fetch(`/api/system/akun?email=${session.user.email}`);
        const responseJson = await response.json();
        setprofile(responseJson)
      };
      fetchData().catch((err) => console.error("Error fetching data: ", err));
    }
  }, [session])


  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const token = session?.user?.sessionToken;

    if (!token) {
      alert("Session token tidak ditemukan");
      return;
    }

    await Promise.all([
      logoutUser(token),
      signOut({ callbackUrl: "/login" })
    ]);
  };

  return (
    <div>
      {/* Bars Icon */}
      <button
        onClick={handleOpen}
        type="button"
        className=" fixed top-4 left-3 z-50 p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-white dark:hover:bg-gray-500 dark:focus:ring-gray-600"
      >
        <HiMiniBars3BottomLeft size={24} />
      </button>

      {/* Overlay hitam transparan */}
      {isOpen && (
        <div
          onClick={handleOpen}
          className="fixed inset-0 bg-black opacity-50 z-20"
        ></div>
      )}

      {/* Side Bar */}
      <aside
        className={` ${isOpen ? "translate-x-0" : "-translate-x-full"
          } fixed top-0 left-0 z-30 w-72 h-screen transition-transform sm:translate-x-0 shadow-md `}
      >
        <div className="h-full px-5 py-4 pb-8 overflow-y-auto bg-white-prime text-dark-prime dark:bg-dark-prime dark:text-white-prime shadow-lg ">
          <ul className="space-y-2 font-medium">
            <div className="flex py-3 font-semibold capitalize items-center justify-center">
              {role.replace("-", " ").replace("_", " ").toLowerCase()} Page
            </div>
          </ul>

          <ul className="space-y-3 font-medium my-7">
            {list.map((items, i) => {
              return (
                <div key={i}>
                  <span className="flex text-prime py-2 font-bold dark:text-slate6 text-base">
                    {items.title}
                  </span>
                  <ul className="space-y-1">
                    {items.list.map((e, i) => {
                      const isActive = (pathname.split("/")[2] || "") === e.link.replace("/", "");
                      return (
                        <li key={i}>
                          <a
                            href={"/" + role + e.link}
                            className={`flex items-center p-2 text-sm rounded-lg text-gray-900 group ${isActive
                              ? "bg-prime text-white dark:bg-gray6 dark:text-dark-prime"
                              : "dark:text-white-prime hover:bg-prime hover:text-white-prime dark:hover:bg-gray6 dark:hover:text-dark-prime "
                              }`}
                          >
                            <div className="me-2">{e.icon}</div>
                            <span className="flex-1">{e.title}</span>
                            {/* Badge notifikasi pembayaran untuk admin keuangan */}
                            {role === "ADMIN_KEUANGAN" && e.link === "/pembayaran" && (
                              <NotifBadgePembayaran />
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Top Bar */}
      <div className=" overflow-y-auto sm:ml-72 absolute h-full w-full sm:max-w-[calc(100%-18rem)] bg-second-prime dark:bg-gray9 dark:text-gray2 ">
        <div className=" z-40 fixed flex justify-end p-3 items-center shadow-lg w-full sm:w-[calc(100%-18rem)] bg-white-prime text-dark-prime dark:bg-dark-prime dark:text-white-prime ">
          <a
            href="/"
            className="hidden md:flex me-auto bg-prime py-3 px-4 text-white-prime text-sm font-semibold items-center rounded-lg dark:bg-gray8 dark:text-gray2 "
          >
            <FaGlobeAmericas size={18} className=" rotate-180 me-2" />
            <span className=""> Kunjungi Website </span>
          </a>

          <div className="flex flex-col justify-end text-sm font-medium">
            {
              profile ? (
                <>
                  <span className="ms-auto">{profile.nama || ""}</span>
                  <span>{profile.email || ""}</span>
                </>
              ) : (
                <Skeleton.MultipleLines sumLine="1" className={"w-28 ms-3 "} />
              )
            }

          </div>
          <button
            onClick={() => {
              setDropdown(!dropdown);
            }}
            className=" flex mx-3"
          >
            {profile ? (
              profile.gambar ? (
                <Image
                  src={profile.gambar}
                  alt={profile.email}
                  width={45}
                  height={45}
                  className="object-cover w-full h-full border-black border-[1px] rounded-full"
                />
              ) : (
                <div className="w-[45px] h-[45px] bg-gray-200 rounded-full flex items-center justify-center border border-gray-400 overflow-hidden">
                  <FaUser className="text-gray-400 w-full h-full mt-2" />
                </div>
              )
            ) : (
              <Skeleton.Circle className="mx-auto" />
            )}
          </button>
          {dropdown && (
            <div className="absolute z-50 flex flex-col bg-white dark:bg-dark-prime shadow-lg w-56 top-20 me-3 py-5">
              <a
                href="/"
                className="flex justify-start text-sm px-5 py-2 items-center hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaGlobeAmericas size={18} className="me-2" />
                <span>Kunjungi Website</span>
              </a>
              <a
                href={`/forget-password`}
                className="flex justify-start text-sm px-5 py-2 items-center hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <IoKeyOutline size={18} className="me-2" />
                <span>Ganti Password</span>
              </a>
              <button
                className="flex justify-start text-sm px-5 py-2 items-center hover:bg-gray-100 dark:hover:bg-gray-800 capitalize"
                onClick={() => {
                  theme == "dark" ? setTheme("light") : setTheme("dark");
                }}
              >
                <CiSun size={20} className="me-2" />
                <span>{theme == "dark" ? "light" : "dark"} mode</span>
              </button>
              <button
                className="flex justify-start text-sm px-5 py-2 items-center hover:bg-gray-100 dark:hover:bg-gray-800 "
                onClick={() => handleLogout()}
              >
                <PiSignOut size={18} className=" rotate-180 me-2" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
        <div className="p-4 pt-24 space-y-6  ">
          <BreadcrumbComponent role={role} />
          {children}
        </div>
      </div>
    </div>
  );
}


async function logoutUser(sessionToken) {
  if (!sessionToken) {
    return { success: false, message: "Session token tidak ditemukan" };
  }

  try {
    const response = await fetch("/api/system/logout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error?.error || "Gagal menghapus session",
      };
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (err) {
    console.error("Logout error:", err);
    return { success: false, message: "Terjadi kesalahan saat logout" };
  }
}
