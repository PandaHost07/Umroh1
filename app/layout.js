import "./globals.css";
import { Poppins } from "next/font/google";
import { Provider } from "./provider";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "ADA Tour & Travel — Paket Umrah Terpercaya di Lampung",
  description:
    "ADA Tour & Travel adalah biro perjalanan umrah dan haji terpercaya di Bandar Lampung. Kami menyediakan paket umrah lengkap dengan hotel bintang 4–5, penerbangan langsung, pembimbing berpengalaman, dan layanan 24 jam. Daftar sekarang dan wujudkan impian ibadah Anda ke Tanah Suci.",
  keywords:
    "ada tour travel, umrah lampung, paket umrah, haji lampung, travel umrah terpercaya, umrah murah lampung, biro perjalanan umrah, ada tour, paket umrah 2025 2026",
  openGraph: {
    title: "ADA Tour & Travel — Paket Umrah Terpercaya di Lampung",
    description:
      "Biro perjalanan umrah & haji terpercaya di Bandar Lampung. Paket lengkap, hotel bintang 4–5, pembimbing berpengalaman.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} bg-white text-black`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
