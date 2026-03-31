"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, Button, Badge, Alert } from "flowbite-react"
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaFileUpload } from "react-icons/fa"
import Image from "next/image"

export default function JamaahDashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [paketList, setPaketList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchPaket = useCallback(async () => {
    console.log("🚀 Starting fetchPaket...")
    setLoading(true)
    setError("")
    
    try {
      console.log("📡 Making API call to /api/public/paket")
      const res = await fetch("/api/public/paket", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      })
      
      console.log("📊 Response status:", res.status)
      console.log("📊 Response headers:", Object.fromEntries(res.headers.entries()))
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error("❌ API Error Response:", errorText)
        throw new Error(`API Error: ${res.status} - ${errorText}`)
      }
      
      const data = await res.json()
      console.log("✅ API Response Data:", data)
      console.log("📦 Paket count:", data.paket?.length || 0)
      
      setPaketList(data.paket || [])
      console.log("🎯 Paket list updated successfully")
      
    } catch (error) {
      console.error("💥 Fetch Error:", error)
      setError(`Gagal memuat data paket: ${error.message}`)
    } finally {
      setLoading(false)
      console.log("🏁 Fetch completed")
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchPaket()
    }
  }, [session, fetchPaket])

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Dashboard Jamaah</h1>
        <p className="text-blue-100">Selamat datang, {session?.user?.nama || "Jamaah"}!</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/transaksi")}>
          <div className="flex flex-col items-center p-4">
            <FaCalendarAlt className="text-3xl text-blue-600 mb-2" />
            <h3 className="font-semibold">Transaksi</h3>
            <p className="text-sm text-gray-600">Kelola pemesanan</p>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/pembayaran")}>
          <div className="flex flex-col items-center p-4">
            <FaMoneyBillWave className="text-3xl text-green-600 mb-2" />
            <h3 className="font-semibold">Pembayaran</h3>
            <p className="text-sm text-gray-600">DP & Cicilan</p>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/keberangkatan")}>
          <div className="flex flex-col items-center p-4">
            <FaUsers className="text-3xl text-purple-600 mb-2" />
            <h3 className="font-semibold">Keberangkatan</h3>
            <p className="text-sm text-gray-600">Jadwal & Itinerary</p>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/profile-saya")}>
          <div className="flex flex-col items-center p-4">
            <FaFileUpload className="text-3xl text-orange-600 mb-2" />
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-gray-600">Dokumen & Data</p>
          </div>
        </Card>
      </div>

      {/* Paket Umrah Tersedia */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Paket Umrah Tersedia</h2>
        {error && <Alert color="failure" className="mb-4">{error}</Alert>}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat paket...</p>
          </div>
        ) : paketList.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">Belum ada paket umrah tersedia</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paketList.map((paket) => (
              <Card key={paket.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image 
                    src={paket.gambar} 
                    alt={paket.nama}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge color={paket.isAvailable ? "success" : "failure"}>
                      {paket.kuotaTersedia} Kuota
                    </Badge>
                    {!paket.isAvailable && (
                      <Badge color="failure" size="sm">
                        Penuh
                      </Badge>
                    )}
                    {paket.quotaUsage.percentage >= 80 && (
                      <Badge color="warning" size="sm">
                        {paket.quotaUsage.percentage}% Terisi
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{paket.nama}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{paket.deskripsi}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berangkat:</span>
                      <span className="font-medium">{formatDate(paket.tanggalBerangkat)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sisa Kuota:</span>
                      <div className="text-right">
                        <span className="font-medium">{paket.kuotaTersedia} orang</span>
                        <div className="text-xs text-gray-500">
                          {paket.quotaUsage.used}/{paket.quotaUsage.total} ({paket.quotaUsage.percentage}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Harga:</span>
                      <span className="text-lg font-bold text-green-600">{formatRupiah(paket.harga)}</span>
                    </div>
                  </div>

                  <Button 
                    color={paket.isAvailable ? "blue" : "gray"} 
                    className="w-full mt-4"
                    onClick={() => router.push(`/transaksi?pesan=${paket.id}`)}
                    disabled={!paket.isAvailable}
                  >
                    {paket.isAvailable ? "Pesan Sekarang" : "Kuota Penuh"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
