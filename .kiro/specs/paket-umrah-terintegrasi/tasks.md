# Implementation Plan: Paket Umrah Terintegrasi

## Overview

Implementasi dilakukan secara inkremental: mulai dari fondasi data (migrasi schema + shared utility kuota), lalu perbaikan API layer, kemudian UI jamaah dan admin. Setiap langkah langsung terintegrasi ke kode yang sudah ada.

## Tasks

- [x] 1. Migrasi Prisma — tambah field `jenis` ke model `Pembayaran`
  - Tambah enum `JenisPembayaran { DP CICILAN_1 PELUNASAN }` ke `prisma/schema.prisma`
  - Tambah field `jenis JenisPembayaran?` ke model `Pembayaran`
  - Jalankan `npx prisma migrate dev --name add-jenis-pembayaran`
  - Jalankan `npx prisma generate` untuk update Prisma Client
  - _Requirements: 7.2_

- [x] 2. Buat shared utility `hitungKuotaTersedia` di `lib/kuota.js`
  - Buat file `lib/kuota.js` dengan fungsi `hitungKuotaTersedia(prisma, paketId)` yang menghitung `COUNT(Pendaftaran WHERE paketId AND status IN ['MENUNGGU','TERKONFIRMASI'])`
  - Fungsi mengembalikan jumlah slot terpakai (bukan tersedia), agar caller bisa menghitung `paket.kuota - used`
  - Export juga helper `buildKuotaResponse(paket, used)` yang mengembalikan `{ kuotaTersedia, isAvailable, quotaUsage }`
  - _Requirements: 1.1, 1.3, 10.1, 10.3_

  - [ ]* 2.1 Tulis property test untuk `hitungKuotaTersedia` (Property 1)
    - **Property 1: Kuota Tersedia Tidak Pernah Negatif**
    - Untuk sembarang paket dengan kuota N dan M pendaftaran aktif (M ≤ N), `paket.kuota - hitungKuotaTersedia(...)` selalu ≥ 0
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 1: kuota tersedia tidak pernah negatif`
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 3. Perbaiki `app/api/jamaah/pesan/route.js` — hapus decrement, pakai `hitungKuotaTersedia`
  - Import `hitungKuotaTersedia` dari `lib/kuota.js`
  - Ganti logika validasi kuota: gunakan `hitungKuotaTersedia` alih-alih `paket.pendaftaran.length`
  - Hapus blok `prisma.paket.update({ kuota: { decrement: 1 } })` setelah create pendaftaran
  - Tambahkan `kuotaTersedia` ke response 201 menggunakan `buildKuotaResponse`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 3.1 Tulis property test untuk penolakan saat kuota penuh (Property 2)
    - **Property 2: Penolakan Pemesanan saat Kuota Penuh**
    - Untuk sembarang paket dengan `kuotaTersedia == 0`, POST ke `/api/jamaah/pesan` harus mengembalikan HTTP 400 dengan pesan "Kuota paket sudah penuh"
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 2: penolakan pemesanan saat kuota penuh`
    - **Validates: Requirements 1.2**

- [x] 4. Perbaiki `app/api/jamaah/cancel/route.js` — hapus increment, perbaiki status
  - Hapus blok `prisma.paket.update({ kuota: { increment: 1 } })` di akhir handler
  - Ubah status pembatalan dari `"DIBATALKAN"` menjadi `"TIDAK_TERKONFIRMASI"` (sesuai enum `StatusPendaftaran`)
  - Perbaiki validasi status awal: cek `status IN ["MENUNGGU", "TERKONFIRMASI"]` bukan `status === "DIBATALKAN"`
  - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 4.1 Tulis property test untuk pembatalan tanpa mutasi kuota (Property 4)
    - **Property 4: Pembatalan Merefleksikan Kuota Tanpa Mutasi Field**
    - Setelah pembatalan, `Paket.kuota` di DB tidak berubah, tapi `kuotaTersedia` bertambah 1 pada kalkulasi berikutnya
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 4: pembatalan merefleksikan kuota tanpa mutasi field`
    - **Validates: Requirements 2.1, 2.2**

- [x] 5. Perbaiki `app/api/system/paket/route.js` PATCH — tambah validasi kuota baru ≥ pendaftaran aktif
  - Import `hitungKuotaTersedia` dari `lib/kuota.js`
  - Setelah parse `kuota` baru, panggil `hitungKuotaTersedia(prisma, body.id)` untuk mendapat jumlah pendaftaran aktif
  - Jika `kuota_baru < pendaftaran_aktif`, kembalikan 400 dengan pesan `"Kuota baru tidak boleh lebih kecil dari jumlah pendaftaran aktif (N pendaftaran)"`
  - Tambah validasi: kuota harus bilangan bulat positif (> 0)
  - Sertakan `kuotaTersedia` di response 200 menggunakan `buildKuotaResponse`
  - _Requirements: 6.3, 6.4, 6.5_

  - [ ]* 5.1 Tulis property test untuk validasi edit kuota (Property 5)
    - **Property 5: Validasi Kuota Edit Paket**
    - Untuk sembarang `kuota_baru < pendaftaran_aktif`, PATCH `/api/system/paket` harus mengembalikan HTTP 400
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 5: validasi kuota edit paket`
    - **Validates: Requirements 6.4, 6.5**

- [x] 6. Perbaiki `app/api/public/paket/route.js` — gunakan `hitungKuotaTersedia`
  - Import `hitungKuotaTersedia` dan `buildKuotaResponse` dari `lib/kuota.js`
  - Ganti inline `prisma.pendaftaran.count(...)` dengan `hitungKuotaTersedia` di dalam `Promise.all`
  - Gunakan `buildKuotaResponse` untuk membangun field `kuotaTersedia`, `isAvailable`, `quotaUsage`
  - Lakukan hal yang sama di `app/api/public/paket/[id]/route.js` jika ada logika kuota di sana
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.1, 10.3_

  - [ ]* 6.1 Tulis property test untuk konsistensi kuota lintas endpoint (Property 3)
    - **Property 3: Konsistensi Kalkulasi Kuota Lintas Endpoint**
    - Untuk sembarang paket, `kuotaTersedia` dari `/api/public/paket` dan `/api/system/paket` harus identik
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 3: konsistensi kalkulasi kuota lintas endpoint`
    - **Validates: Requirements 3.1, 3.3, 10.1, 10.3**

- [x] 7. Checkpoint — Pastikan semua tests pass
  - Pastikan semua tests pass, tanya user jika ada pertanyaan.

- [x] 8. Perbaiki `app/api/jamaah/pendaftaran/route.js` — pastikan include hotel & penerbangan lengkap
  - Verifikasi bahwa query sudah include `paket.hotel` dan `paket.penerbangan` (sudah ada, konfirmasi saja)
  - Pastikan `iternary` juga di-include dalam query (sudah ada)
  - Tidak ada perubahan struktur, hanya validasi kelengkapan include
  - _Requirements: 7.1, 9.1_

- [x] 9. Perbaiki halaman pembayaran jamaah `app/jamaah/pembayaran/page.js`
  - [x] 9.1 Tambah handling status `DITOLAK` pada tampilan per item pembayaran
    - Tambah kondisi `pembayaran.status === "DITOLAK"` di bagian kanan item: tampilkan badge merah "Ditolak" dan tombol "Upload Ulang"
    - Tombol "Upload Ulang" memanggil `openUploadModal(pembayaran)` sama seperti tombol upload biasa
    - Ganti kondisi tombol upload: tampil jika `status === "MENUNGGU"` DAN belum ada `buktiUrl`, ATAU jika `status === "DITOLAK"`
    - _Requirements: 7.4, 7.5, 7.6_

  - [ ]* 9.2 Tulis property test untuk validasi file upload (Property 6)
    - **Property 6: Upload Bukti Hanya untuk File Gambar ≤ 5MB**
    - Untuk sembarang file non-image atau ukuran > 5MB, POST `/api/jamaah/upload-bukti` harus mengembalikan 400 dan `buktiUrl` tidak berubah
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 6: upload bukti hanya untuk file gambar <= 5MB`
    - **Validates: Requirements 8.2, 8.3**

  - [ ]* 9.3 Tulis property test untuk ringkasan keuangan (Property 8)
    - **Property 8: Ringkasan Keuangan Konsisten**
    - Untuk sembarang daftar pembayaran, `sisa = paket.harga - SUM(pembayaran WHERE status == 'TERVERIFIKASI')` selalu benar
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 8: ringkasan keuangan konsisten`
    - **Validates: Requirements 7.3**

- [x] 10. Perbaiki halaman keberangkatan jamaah `app/jamaah/keberangkatan/page.jsx`
  - [x] 10.1 Tambah tampilan `bandaraTiba` dan `waktuTiba` di seksi informasi penerbangan
    - Di dalam grid informasi penerbangan, tambah dua item baru: "Bandara Tujuan" (`penerbangan.bandaraTiba || "TBA"`) dan "Waktu Tiba" (format HH:MM dari `penerbangan.waktuTiba`, atau "TBA" jika null)
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

  - [x] 10.2 Tambah tampilan `lokasi` hotel
    - Di kartu informasi hotel (grid item "Hotel"), tambah baris kedua yang menampilkan `pendaftaran.paket.hotel?.lokasi || "TBA"` (nilai enum: MEKKAH / MADINAH)
    - _Requirements: 9.2, 9.5_

  - [ ]* 10.3 Tulis property test untuk tampilan TBA (Property 7)
    - **Property 7: Tampilan TBA untuk Data Penerbangan Kosong**
    - Untuk sembarang pendaftaran dengan field penerbangan null, output render harus mengandung string "TBA"
    - Tag: `// Feature: paket-umrah-terintegrasi, Property 7: tampilan TBA untuk data penerbangan kosong`
    - **Validates: Requirements 9.5**

- [x] 11. Perbaiki halaman daftar paket admin `app/ADMIN_OPERASIONAL/(menu paket)/daftar-paket/page.jsx`
  - Ubah kalkulasi `terisi` di mapping data: dari `p.pendaftaran.length` menjadi `p.pendaftaran.filter(d => ['MENUNGGU','TERKONFIRMASI'].includes(d.status)).length`
  - Update query GET di `app/api/system/paket/route.js` agar `include: { pendaftaran: { where: { status: { in: ['MENUNGGU','TERKONFIRMASI'] } } } }` — sehingga hanya pendaftaran aktif yang di-include, bukan semua
  - Tambah indikator visual "Penuh" di `TableComponent` atau di mapping data: tambah field `isPenuh: terisi >= p.kuota` yang bisa digunakan untuk styling
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 12. Final checkpoint — Pastikan semua tests pass
  - Pastikan semua tests pass, tanya user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Property tests menggunakan library **fast-check** dengan minimum 100 iterasi (`numRuns: 100`)
- Setiap property test diberi tag komentar: `// Feature: paket-umrah-terintegrasi, Property N: <deskripsi>`
- Migrasi Prisma (Task 1) harus selesai sebelum Task 3 karena `pesan/route.js` menggunakan field `jenis`
- `lib/kuota.js` (Task 2) harus selesai sebelum Task 3, 5, dan 6 karena semua mengimport dari sana
