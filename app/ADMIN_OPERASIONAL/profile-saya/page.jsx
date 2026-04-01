"use client";
import AdminContainer from "@/components/Container/adminContainer";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { alertSuccess, alertError } from "@/components/Alert/alert";
import { FaUser } from "react-icons/fa";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState("profil");
  const [nama, setNama] = useState(session?.user?.nama || "");
  const [loading, setLoading] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/system/akun?email=${session?.user?.email}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      alertSuccess("Profil berhasil diperbarui");
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alertError("Password baru tidak cocok");
      return;
    }
    if (newPass.length < 6) {
      alertError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/system/akun?email=${session?.user?.email}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal ganti password");
      alertSuccess("Password berhasil diubah");
      setOldPass(""); setNewPass(""); setConfirmPass("");
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContainer>
      <h2 className="text-xl font-bold mb-6">Profile Saya</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
          {session?.user?.gambar ? (
            <img src={session.user.gambar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <FaUser className="text-blue-400" size={28} />
          )}
        </div>
        <div>
          <p className="font-bold text-lg">{session?.user?.nama || "-"}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Admin Operasional</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {["profil", "password"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "profil" ? "Edit Profil" : "Ganti Password"}
          </button>
        ))}
      </div>

      {tab === "profil" && (
        <form onSubmit={handleSaveProfil} className="max-w-md space-y-4">
          <div>
            <Label value="Nama Lengkap" />
            <TextInput value={nama} onChange={(e) => setNama(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label value="Email" />
            <TextInput value={session?.user?.email || ""} disabled className="mt-1 bg-gray-50" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Simpan Perubahan"}
          </Button>
        </form>
      )}

      {tab === "password" && (
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <Label value="Password Baru" />
            <TextInput type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label value="Konfirmasi Password Baru" />
            <TextInput type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required className="mt-1" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Ganti Password"}
          </Button>
        </form>
      )}
    </AdminContainer>
  );
}
