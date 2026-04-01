"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Label, TextInput, Select, Spinner } from "flowbite-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import LoginImage from "../../../public/login.png";
import { alertSuccess, alertError } from "@/components/Alert/alert";

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

  // State untuk toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleShowPassword = () => setShowPassword(v => !v);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(v => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Password dan konfirmasi password tidak cocok.");
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
      // Redirect ke login setelah 1.5 detik
      setTimeout(() => { window.location.href = "/login"; }, 1500);
    } catch (error) {
      alertError(error.message);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute flex h-full w-full">
      <div className="sm:flex h-full w-1/2 hidden">
        <Image src={LoginImage} alt="Login Image" width={0} height={0} priority className="lg:w-full" />
      </div>
      <div className="flex w-full h-full sm:w-1/2 justify-center px-7 pt-14 sm:items-center sm:p-0">
        <form onSubmit={handleSubmit} className="w-full sm:w-3/4 space-y-4">
          <label className="flex pb-3 text-2xl font-semibold justify-center sm:justify-start">REGISTRASI AKUN</label>
          <hr className="my-2" />
          {errorMsg && <div className="text-red-600 mb-2 font-medium">{errorMsg}</div>}

          <div>
            <Label htmlFor="nama" value="Nama Lengkap" />
            <TextInput id="nama" name="nama" placeholder="Masukkan nama lengkap" value={form.nama} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput id="email" type="email" name="email" placeholder="Masukkan email" value={form.email} onChange={handleChange} required disabled={loading} />
          </div>

          {/* Password Field with Eye */}
          <div className="relative">
            <Label htmlFor="password" value="Password" />
            <TextInput
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-9 text-gray-600 hover:text-gray-900"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Confirm Password Field with Eye */}
          <div className="relative">
            <Label htmlFor="confirmPassword" value="Konfirmasi Password" />
            <TextInput
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Masukkan ulang password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="absolute right-3 top-9 text-gray-600 hover:text-gray-900"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div>
            <Label htmlFor="gender" value="Jenis Kelamin" />
            <Select id="jenisKelamin" name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} required disabled={loading}>
              <option value="">Pilih jenis kelamin</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="telepon" value="Nomor Telepon (opsional)" />
            <TextInput id="telepon" type="tel" name="telepon" placeholder="08123456789" value={form.telepon} onChange={handleChange} disabled={loading} />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? (
              <>
                Loading <Spinner className="ml-2" />
              </>
            ) : (
              "REGISTER"
            )}
          </Button>

          <div className="flex w-full pt-6 justify-center text-sm">
            Sudah Punya Akun ?<a href="/login" className="ms-1 text-blue-600 underline"> Sign In</a>
          </div>
        </form>
      </div>
    </div>
  );
}
