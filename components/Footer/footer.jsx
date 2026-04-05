import { AiFillMail, AiOutlineInstagram } from "react-icons/ai";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import Skeleton from "../Skeleton/skeleton";

/** Nomor lokal 08… → wa.me membutuhkan 62… */
function waMePath(nomor) {
  if (!nomor) return "#";
  const d = String(nomor).replace(/\D/g, "");
  if (!d) return "#";
  const intl = d.startsWith("0") ? `62${d.slice(1)}` : d.startsWith("62") ? d : `62${d}`;
  return `https://wa.me/${intl}`;
}

function FooterComponent({ name, deskripsi, maps, alamat, wa, email, ig }) {
  return (
    <footer
      className="text-white pt-2 md:pt-5 mt-auto"
      style={{ backgroundColor: "#2B458D" }}
    >
      <div className="mx-auto w-full max-w-screen-xl p-3 pt-5">
        <div className="grid grid-cols-4 gap-10 p-3 md:grid-cols-3 md:gap-6 lg:gap-14 ">
          <div className="col-span-4 md:col-span-1">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-md font-semibold mb-3 capitalize ">{name ? name : (<Skeleton.Line className={"w-32 rounded-lg"} />)}</h2>
              <hr className=" border border-white mb-6 w-1/2" />
            </div>
            <div className="text-sm text-center md:text-left">

              {deskripsi ? <div
                dangerouslySetInnerHTML={{ __html: deskripsi }}
                className="space-y-3"
              /> : <Skeleton.MultipleLines sumLine="4" />}
            </div>
          </div>

          <div className="col-span-4 md:col-span-1 ">
            <div className="flex flex-col items-center md:items-start md:ms-11">
              <h2 className="text-md font-semibold mb-3 ">Lokasi Kantor</h2>
              <hr className=" border border-white mb-6 w-1/2" />
            </div>
            <div className="flex justify-center md:justify-start">
              <ul>
                <li>
                  <a
                    href={maps || "#"}
                    className="flex mb-3 items-center"
                  >
                    <FaMapMarkerAlt
                      className="mx-3"
                      style={{ fontSize: "15pt" }}
                    />
                    <div className="text-sm">
                      {alamat ? alamat : <Skeleton.Line className={"w-56 rounded-lg"} />}
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-span-4 md:col-span-1 ">
            <div className="flex flex-col items-center md:items-start md:ms-12">
              <h2 className="text-md font-semibold mb-3 ">Kontak Info</h2>
              <hr className=" border border-white mb-6 w-1/2" />
            </div>
            <div className="flex justify-center md:justify-start">
              <ul>
                <li>
                  <a
                    href={waMePath(wa)}
                    className="flex mb-3 items-center"
                  >
                    <BsFillTelephoneFill
                      className="mx-3 mr-4"
                      style={{ fontSize: "15pt" }}
                    />
                    <div className="text-sm">{wa ? wa : <Skeleton.Line className={"w-56 rounded-lg"} />}</div>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex mb-3 items-center"
                  >
                    <AiFillMail className="mx-3" style={{ fontSize: "18pt" }} />
                    <div className="text-sm">{email ? email : <Skeleton.Line className={"w-56 rounded-lg"} />}</div>
                    {/* adhatourtravel27 @gmail.com */}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.instagram.com/${ig}/?hl=id`}
                    className="flex mb-3 items-center"
                  >
                    <AiOutlineInstagram
                      className="mx-3"
                      style={{ fontSize: "18pt" }}
                    />
                    <div className="text-sm">{ig ? "@" + ig : <Skeleton.Line className={"w-56 rounded-lg"} />}</div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex justify-center items-center p-3 mt-3 md:mt-8"
        style={{ backgroundColor: "#092163" }}
      >
        Copyrigth | © 2023 by {name}
      </div>
    </footer>
  );
}

export default FooterComponent;
