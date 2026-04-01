import Sidebar from "@/components/Sidebar/sidebar";
import { ThemeProvider } from "next-themes";
import { FaClipboardCheck, FaClipboardList, FaUser, FaStar } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";
import { IoHomeSharp } from "react-icons/io5";
import { PiArrowSquareUpRightBold } from "react-icons/pi";
import { RiCalendarScheduleFill } from "react-icons/ri";

export default function LayoutAdmin({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Sidebar list={Sidebar_list} role="ADMIN_OPERASIONAL" >{children}</Sidebar>
    </ThemeProvider>
  );
}

const Sidebar_list = [
  {
    title: "Menu Utama",
    list: [
      {
        title: "Dashboard",
        link: "/",
        icon: <IoHomeSharp size={18} />,
      },
      {
        title: "Kelengkapan Dokumen",
        link: "/kelengkapan-dokumen",
        icon: <IoIosDocument size={18} />,
      },
      {
        title: "Data Jamaah",
        link: "/data-jamaah",
        icon: <FaUser size={18} />,
      },
      {
        title: "Kelengkapan Atribut",
        link: "/kelengkapan-atribut",
        icon: <FaClipboardCheck size={18} />,
      },
      {
        title: "Keberangkatan & Manasik",
        link: "/keberangkatan",
        icon: <RiCalendarScheduleFill size={18} />,
      },
      {
        title: "Pengumuman",
        link: "/pengumuman",
        icon: <IoIosDocument size={18} />, 
      },
      {
        title: "Kelola Mitra",
        link: "/mitra",
        icon: <FaClipboardList size={18} />,
      },
      {
        title: "Testimoni",
        link: "/testimoni",
        icon: <FaStar size={18} />,
      },
    ],
  },
  {
    title: "Manajemen Paket",
    list: [
      {
        title: "Daftar Paket",
        link: "/daftar-paket",
        icon: <FaClipboardList size={18} />,
      },
      {
        title: "Hotel & Penerbangan",
        link: "/hotel-penerbangan",
        icon: <PiArrowSquareUpRightBold size={18} />,
      },
    ],
  },
  {
    title: "Menu Lainnya",
    list: [
      {
        title: "Profile Saya",
        link: "/profile-saya",
        icon: <FaUser size={18} />,
      },
    ],
  },
];
