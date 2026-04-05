"use client";

import { useState } from "react";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiKey } from "react-icons/hi";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: cari email, 2: ganti password
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCariAkun = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/system/akun?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Email tidak ditemukan");
      setStep(2);
    } catch (err) {
      alertError(err.message || "Email tidak terdaftar");
    } finally {
      setLoading(false);
    }
  };

  const handleGantiPassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { alertError("Password tidak cocok"); return; }
    if (newPass.length < 6) { alertError("Password minimal 6 karakter"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/system/akun?email=${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });
      if (!res.ok) throw new Error("Gagal mengubah password");
      alertSuccess("Password berhasil diubah! Silakan login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HiKey className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Reset Password</h1>
            <p className="text-sm text-gray-500">
              {step === 1 ? "Masukkan email akun Anda" : "Buat password baru"}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleCariAkun} className="space-y-4">
            <div>
              <Label value="Email Akun" />
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" color="blue" className="w-full" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Cari Akun
            </Button>
          </form>
        ) : (
          <form onSubmit={handleGantiPassword} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              ✓ Akun ditemukan: <span className="font-semibold">{email}</span>
            </div>
            <div>
              <Label value="Password Baru" />
              <TextInput
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label value="Konfirmasi Password" />
              <TextInput
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Ulangi password baru"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" color="blue" className="w-full" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Simpan Password Baru
            </Button>
          </form>
        )}

        <button
          onClick={() => router.push("/login")}
          className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-full justify-center"
        >
          <HiArrowLeft size={14} /> Kembali ke Login
        </button>
      </div>
    </div>
  );
}
