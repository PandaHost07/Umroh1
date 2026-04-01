"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { FaStar } from "react-icons/fa";
import { Button, Spinner } from "flowbite-react";

export default function TestimoniPage() {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Pilih rating terlebih dahulu.");
      return;
    }
    if (pesan.trim().length < 10) {
      setError("Pesan minimal 10 karakter.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/jamaah/testimoni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          akunEmail: session?.user?.email,
          rating,
          pesan: pesan.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim testimoni");
      setSuccess("Testimoni berhasil dikirim. Terima kasih!");
      setRating(0);
      setPesan("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">Testimoni</h1>

      <div className="max-w-xl border border-gray-200 rounded bg-white p-6">
        <p className="text-sm text-gray-500 mb-6">
          Bagikan pengalaman ibadah umrah Anda bersama Ada Tour Travel.
        </p>

        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none"
                >
                  <FaStar
                    size={28}
                    className={
                      star <= (hover || rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-500 self-center">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Pesan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Testimoni
            </label>
            <textarea
              rows={5}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Ceritakan pengalaman ibadah umrah Anda..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{pesan.length} karakter (min. 10)</p>
          </div>

          <Button type="submit" color="blue" disabled={loading} className="w-full">
            {loading ? <Spinner size="sm" /> : "Kirim Testimoni"}
          </Button>
        </form>
      </div>
    </div>
  );
}
