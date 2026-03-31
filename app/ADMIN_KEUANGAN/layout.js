import Sidebar from "@/components/Sidebar/sidebar";
import { ThemeProvider } from "next-themes";
import { BsClipboardDataFill } from "react-icons/bs";
import { FaMoneyBillWave, FaUser } from "react-icons/fa";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { IoHomeSharp } from "react-icons/io5";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import { SiKashflow } from "react-icons/si";

export default function LayoutAdmin({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Sidebar role="ADMIN_KEUANGAN" list={Sidebar_list}>{children}</Sidebar>
    </ThemeProvider>
  );
}

const Sidebar_list = [
  {
    title: "Menu Utama",
    list: [
      {
        title: "Daftar Paket",
        link: "/daftar-paket",
        icon: <BsClipboardDataFill size={18} />,
      },
      {
        title: "Dashboard",
        link: "/",
        icon: <IoHomeSharp size={18} />,
      },
      {
        title: "Daftar Transaksi",
        link: "/daftar-transaksi",
        icon: <MdOutlineFlipCameraAndroid size={18} />,
      },
      {
        title: "Pembayaran",
        link: "/pembayaran",
        icon: <FaMoneyBillWave size={18} />,
      },
    ],
  },
  {
    title: "Menu Laporan",
    list: [
       {
        title: "Laporan Arus Kas",
        link: "/laporan-arus-kas",
        icon: <SiKashflow size={18} />,
      },
       {
        title: "Laporan Keuangan",
        link: "/laporan-keuangan",
        icon: <BsClipboardDataFill size={18} />,
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
