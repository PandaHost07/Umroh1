"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Spinner } from "flowbite-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import kabah from "../../../public/kabah.png";
import logoImage from "../../../public/logo_badge.png";

export default function Register() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    jenisKelamin: "",
    telepon: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation on mount
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setErrorMsg("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/system/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "jamaah" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
      alertSuccess("Registrasi berhasil! Silakan login.");
      setForm({ nama: "", email: "", password: "", confirmPassword: "", jenisKelamin: "", telepon: "" });
      setTimeout(() => { window.location.href = "/login"; }, 1500);
    } catch (error) {
      alertError(error.message);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background foto — full screen dengan overlay */}
      <div className="absolute inset-0 z-0">
        <Image src={kabah} alt="background" fill style={{ objectFit: "cover" }} priority quality={60} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-black/80" />
      </div>

      {/* Kiri — branding (hanya desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col items-center justify-center text-white p-12">
        <div className="text-center">
          <Image src={logoImage} alt="logo" width={100} height={100} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-3">ADA Tour & Travel</h1>
          <p className="text-blue-200 text-lg">Perjalanan Ibadah Umrah Terpercaya</p>
          <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
            {["Terdaftar resmi Kemenag RI", "Hotel bintang 4 & 5", "Pembimbing berpengalaman", "Layanan 24 jam"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-blue-100 text-sm">
                <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanan — form registrasi dengan animasi slide dari kanan */}
      <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 transition-all duration-500 ease-out ${mounted ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <Image src={logoImage} alt="logo" width={60} height={60} className="mb-2" />
            <h1 className="text-xl font-bold text-white">ADA Tour & Travel</h1>
          </div>

          {/* Card form — transparan di mobile, solid di desktop */}
          <div className="bg-white/10 lg:bg-white backdrop-blur-md lg:backdrop-blur-none rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 lg:border-gray-100">
            <h2 className="text-2xl font-bold text-white lg:text-gray-800 mb-1">Buat Akun Baru</h2>
            <p className="text-blue-200 lg:text-gray-500 text-sm mb-5">Daftar untuk mulai perjalanan umrah Anda</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/20 lg:bg-red-50 border border-red-400/50 lg:border-red-200 rounded-xl text-red-200 lg:text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-white/90 lg:text-gray-700 mb-1">Nama Lengkap</label>
                <input name="nama" type="text" value={form.nama} onChange={handleChange} placeholder="Masukkan nama lengkap" required disabled={loading}
                  className="w-full px-4 py-2.5 bg-white/20 lg:bg-white border border-white/30 lg:border-gray-300 rounded-xl text-white lg:text-gray-800 placeholder-white/60 lg:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/90 lg:text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="nama@email.com" required disabled={loading}
                  className="w-full px-4 py-2.5 bg-white/20 lg:bg-white border border-white/30 lg:border-gray-300 rounded-xl text-white lg:text-gray-800 placeholder-white/60 lg:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/90 lg:text-gray-700 mb-1">Password</label>
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min. 6 karakter" required disabled={loading}
                  className="w-full px-4 py-2.5 pr-11 bg-white/20 lg:bg-white border border-white/30 lg:border-gray-300 rounded-xl text-white lg:text-gray-800 placeholder-white/60 lg:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-8 text-white/70 lg:text-gray-400 hover:text-white lg:hover:text-gray-600 transition-colors">
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>

              {/* Konfirmasi Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/90 lg:text-gray-700 mb-1">Konfirmasi Password</label>
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi password" required disabled={loading}
                  className="w-full px-4 py-2.5 pr-11 bg-white/20 lg:bg-white border border-white/30 lg:border-gray-300 rounded-xl text-white lg:text-gray-800 placeholder-white/60 lg:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                  className="absolute right-3 top-8 text-white/70 lg:text-gray-400 hover:text-white lg:hover:text-gray-600 transition-colors">
                  {showConfirmPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-medium text-white/90 lg:text-gray-700 mb-1">Jenis Kelamin</label>
                <select name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} required disabled={loading}
                  className="w-full px-4 py-2.5 bg-white/20 lg:bg-white border border-white/30 lg:border-gray-300 rounded-xl text-white lg:text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">
                  <option value="" className="text-gray-800">Pilih jenis kelamin</option>
                  <option value="LAKI_LAKI" className="text-gray-800">Laki-laki</option>
                  <option value="PEREMPUAN" className="text-gray-800">Perempuan</option>
                </select>
              </div>

              {/* Telepon */}
              <div>
                <label className="block text-sm font-medium text-white/90 lg:text-gray-700 mb-1">Nomor Telepon <span className="text-white/50 lg:text-gray-400 font-normal">(opsional)</span></label>
                <input name="telepon" type="tel" value={form.telepon} onChange={handleChange} placeholder="08123456789" disabled={loading}
                  className="w-full px-4 py-2.5 bg-white/20 lg:bg-white border border-white/30 lg:border-gray-300 rounded-xl text-white lg:text-gray-800 placeholder-white/60 lg:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Mendaftar...</>
                ) : "Daftar Sekarang"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-white/70 lg:text-gray-500">
                Sudah punya akun?{" "}
                <a href="/login" className="text-blue-300 lg:text-blue-600 font-medium hover:underline transition-colors">
                  Masuk di sini
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
