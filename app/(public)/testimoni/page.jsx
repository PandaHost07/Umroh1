"use client";
import React, { useState, useEffect } from "react";
import Container from "@/components/Container/container";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { Spinner } from "flowbite-react";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500",
  "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

export default function Page() {
  const [option, setOption] = useState("All");
  const [testimoniList, setTestimoniList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimoni = async () => {
      try {
        const res = await fetch("/api/jamaah/testimoni?limit=50");
        const data = await res.json();
        if (res.ok && data.testimoni) {
          setTestimoniList(data.testimoni);
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchTestimoni();
  }, []);

  const filtered = option !== "All"
    ? testimoniList.filter((item) => item.rating === option)
    : testimoniList;

  const avgRating = testimoniList.length > 0
    ? testimoniList.reduce((a, b) => a + b.rating, 0) / testimoniList.length
    : 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-500 text-white w-full py-16 md:py-24 shadow-md text-center">
        <Container>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Testimoni Jamaah
          </h1>
          <p className="text-sm md:text-lg font-light text-blue-100 max-w-2xl mx-auto mb-8">
            Cerita inspiratif perjalanan ibadah Umrah dari jamaah yang telah
            mempercayakan perjalanan suci mereka bersama kami.
          </p>

          {!loading && testimoniList.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-4xl font-extrabold">{testimoniList.length}+</div>
                <div className="text-blue-200 text-sm mt-1">Ulasan Jamaah</div>
              </div>
              <div className="w-px bg-white/20 hidden md:block" />
              <div className="text-center">
                <div className="text-4xl font-extrabold flex items-center justify-center gap-1">
                  {avgRating.toFixed(1)}
                  <FaStar className="text-yellow-300 text-3xl" />
                </div>
                <div className="text-blue-200 text-sm mt-1">Rating Rata-rata</div>
              </div>
              <div className="w-px bg-white/20 hidden md:block" />
              <div className="text-center">
                <div className="text-4xl font-extrabold">
                  {testimoniList.filter((t) => t.rating === 5).length}
                </div>
                <div className="text-blue-200 text-sm mt-1">Ulasan Bintang 5</div>
              </div>
            </div>
          )}
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="xl" /></div>
          ) : testimoniList.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">⭐</div>
              <p>Belum ada testimoni. Jadilah yang pertama berbagi pengalaman!</p>
            </div>
          ) : (
            <>
              {/* Rating Filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <button onClick={() => setOption("All")}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-sm text-sm ${option === "All" ? "bg-blue-600 text-white ring-2 ring-blue-300" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                  Semua ({testimoniList.length})
                </button>
                {[5, 4, 3].map((num) => {
                  const count = testimoniList.filter((t) => t.rating === num).length;
                  if (count === 0) return null;
                  return (
                    <button key={num} onClick={() => setOption(num)}
                      className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-sm text-sm ${option === num ? "bg-blue-600 text-white ring-2 ring-blue-300" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                      <FaStar className={option === num ? "text-yellow-300" : "text-yellow-400"} size={13} />
                      {num} Bintang ({count})
                    </button>
                  );
                })}
              </div>

              {/* Cards */}
              {filtered.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
                  {filtered.map((item, i) => (
                    <div key={item.id || i}
                      className="break-inside-avoid bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative">
                      <FaQuoteLeft className="absolute top-5 right-5 text-blue-50" size={36} />

                      <div className="flex items-center gap-0.5 mb-3">
                        {[...Array(5)].map((_, idx) => (
                          <FaStar key={idx} size={15} className={idx < item.rating ? "text-yellow-400" : "text-gray-200"} />
                        ))}
                        <span className="ml-2 text-xs text-gray-400">
                          {new Date(item.created).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 italic leading-relaxed mb-5">
                        &ldquo;{item.pesan}&rdquo;
                      </p>

                      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                          {(item.akun?.nama || item.akunEmail || "?").charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800">{item.akun?.nama || item.akunEmail}</div>
                          <div className="text-xs text-gray-400">Jamaah Ada Tour Travel</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  Tidak ada ulasan untuk rating ini.
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
