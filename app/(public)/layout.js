import NavbarComponent from "@/components/Navbar/navbar";
import FooterComponent from "@/components/Footer/footer";

const perusahaan = {
  namaTravel: "Ada Tour Travel",
  image: "https://storage.googleapis.com/testing-7aa93.appspot.com/Perusahaan/1745850017502-logo-perusahaan.png",
  lokasi: "Jl. ZA. Pagar Alam No.46b, Labuhan Ratu, Kec. Kedaton, Kota Bandar Lampung, Lampung",
  maps: "https://maps.app.goo.gl/wbocDg4mpHjrH2ui9",
  email: "adhatourtravel27@gmail.com",
  ig: "ada.tourtravel",
  whatssapp: "0857252255159",
  deskripsi: `<p>Perusahaan kami berdiri secara resmi pada Tahun 2012 dengan nama Erahajj Indonesia. Kami adalah perusahaan Travel professional telah 10 tahun lebih berkecimpung di dunia haji dan umrah</p>
              <p>Kami adalah Perusahaan yang bergerak di bidang Jasa Umrah & Haji, Provider visa, Land Arrangement, Paket Umrah Plus, Paket Haji Furoda dan Paket Haji Khusus.</p>`,
};

export default function Layout({ children }) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <NavbarComponent
        navbar_list={navbar_list}
        logo={perusahaan.image}
        title={perusahaan.namaTravel}
      />
      <main className="flex-1">
        {children}
      </main>
      <FooterComponent
        name={perusahaan.namaTravel}
        deskripsi={perusahaan.deskripsi}
        maps={perusahaan.maps}
        alamat={perusahaan.lokasi}
        wa={perusahaan.whatssapp}
        email={perusahaan.email}
        ig={perusahaan.ig}
      />
    </div>
  );
}

const navbar_list = [
  { name: "Beranda", link: "/" },
  { name: "Tentang Kami", link: "/tentang-kami" },
  { name: "Paket Umrah", link: "/paket" },
  { name: "Testimoni", link: "/testimoni" },
  { name: "Galeri", link: "/galeri" },
];
