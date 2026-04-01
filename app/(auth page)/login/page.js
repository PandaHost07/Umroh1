"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import LoginImage from "../../../public/login.png";
import logoImage from "../../../public/logo_badge.png";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (data) router.push(`/${data.user.role}`);
    const urlError = searchParams.get("error");
    if (urlError) setError("Email atau password salah. Silakan coba lagi.");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Harap isi semua bagian"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res.error) { setError("Email atau password salah"); setLoading(false); return; }
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      if (session.user?.role) router.push(`/${session.user.role}`);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri — gambar (hanya desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src={LoginImage} alt="Login" fill style={{ objectFit: "cover" }} priority />
        <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center text-white p-10">
          <Image src={logoImage} alt="logo" width={100} height={100} className="mb-4" />
          <h1 className="text-3xl font-bold text-center">ADA Tour & Travel</h1>
          <p className="text-blue-200 text-center mt-2 text-sm">Perjalanan Ibadah Umrah Terpercaya</p>
        </div>
      </div>

      {/* Kanan — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Image src={logoImage} alt="logo" width={70} height={70} className="mb-2" />
            <h1 className="text-xl font-bold text-gray-800">ADA Tour & Travel</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang</h2>
            <p className="text-gray-500 text-sm mb-6">Masuk ke akun Anda untuk melanjutkan</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} onChange={() => setError(null)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="/forget-password" className="text-xs text-blue-600 hover:underline">Lupa Password?</a>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </>
                ) : "Masuk"}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-500">
                Belum punya akun?{" "}
                <a href="/register" className="text-blue-600 font-medium hover:underline">Daftar Sekarang</a>
              </p>
              <a href="/" className="block text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Kembali ke Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LoginComponent />
    </Suspense>
  );
}
