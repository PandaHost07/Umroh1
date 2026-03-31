import React from "react";
import logo from "../../public/logo-perusahaan.png";
import Image from "next/image";

const PDFPrint = React.forwardRef(({ data = [] }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        width: "100%",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }} className="flex space-x-7 justify-center items-center">
        <div className="relative w-[7rem] h-[7rem]">
          <Image
            src={logo}
            width={50}
            height={50}
            className="me-2 w-full h-auto"
            alt="logo travel"
          />
        </div>
        <div>
          <h2 style={{ margin: 0 }} className=" text-2xl font-semibold" >ADA TOUR & TRAVEL</h2>
          <p style={{ margin: 0 }} className=" text-base font-semibold">Umrah - Haji Khusus</p>
          <p style={{ margin: 0 }} className=" text-sm" >PT. AMINAH ZHAFER TRAVELINDO WISATA</p>
          <p style={{ margin: 0 }} className=" text-sm" >PPIU NO. 235 TAHUN 2020</p>
        </div>
      </div>
      <hr className=" border-black" />

      {/* <h3 className=" w-full justify-center flex">Surat Keterangan</h3> */}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key, index) => (
                <th
                  key={index}
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#eee",
                    textAlign: "left",
                  }}
                >
                  {key.toUpperCase()}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((value, i) => (
                <td
                  key={i}
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PDFPrint;
