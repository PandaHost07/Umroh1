import Sidebar from "@/components/Sidebar/sidebar";
import { ThemeProvider } from "next-themes";
import { FaMoneyBillWave, FaUser } from "react-icons/fa";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { IoHomeSharp } from "react-icons/io5";


export default function LayoutAdmin({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Sidebar list={Sidebar_list} role="jamaah">
        {children}
      </Sidebar>
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
        title: "Transaksi",
        link: "/transaksi",
        icon: <MdOutlineFlipCameraAndroid size={18} />,
      },
      {
        title: "Pembayaran",
        link: "/pembayaran",
        icon: <FaMoneyBillWave size={18} />,
      },
      {
        title: "Keberangkatan",
        link: "/keberangkatan",
        icon: <RiCalendarScheduleFill size={18} />,
      },
      {
        title: "Profile Saya",
        link: "/profile-saya",
        icon: <FaUser size={18} />,
      },
    ],
  },
];
