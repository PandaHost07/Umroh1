# Requirements Document

## Introduction

Fitur ini mengintegrasikan manajemen paket umrah secara menyeluruh, mencakup tiga area utama:
1. **Kuota real-time** — kuota paket berkurang otomatis saat pemesanan dan bertambah saat pembatalan, serta tampil konsisten di semua halaman (publik, jamaah, admin).
2. **Edit paket oleh Admin Operasional** — admin dapat mengedit seluruh data paket termasuk field kuota langsung dari halaman daftar paket.
3. **Detail pemesanan lengkap untuk jamaah** — setelah memesan, jamaah dapat melihat status pembayaran (DP/cicilan/pelunasan) beserta fitur upload bukti bayar, serta informasi keberangkatan (tanggal, maskapai, hotel, bandara).

Sistem ini dibangun di atas Next.js 16 dengan Prisma + PostgreSQL. Model utama yang terlibat: `Paket`, `Pendaftaran`, `Pembayaran`, `Penerbangan`, dan `Hotel`.

---

## Glossary

- **Sistem**: Aplikasi manajemen umrah berbasis Next.js 16 + Prisma + PostgreSQL.
- **Jamaah**: Pengguna dengan role `jamaah` yang memesan paket umrah.
- **Admin_Operasional**: Pengguna dengan role `ADMIN_OPERASIONAL` yang mengelola data paket.
- **Paket**: Entitas paket umrah dengan field `kuota`, `status`, `harga`, `tanggalBerangkat`, `tanggalPulang`, relasi ke `Hotel` dan `Penerbangan`.
- **Pendaftaran**: Entitas yang merepresentasikan pemesanan jamaah terhadap suatu paket. Status: `MENUNGGU`, `TERKONFIRMASI`, `TIDAK_TERKONFIRMASI`.
- **Pembayaran**: Entitas cicilan pembayaran dalam satu pendaftaran. Jenis: `DP`, `CICILAN_1`, `PELUNASAN`. Status: `MENUNGGU`, `TERVERIFIKASI`, `DITOLAK`.
- **Kuota_Tersedia**: Nilai hasil kalkulasi `Paket.kuota` dikurangi jumlah `Pendaftaran` dengan status `MENUNGGU` atau `TERKONFIRMASI` untuk paket tersebut.
- **Bukti_Bayar**: File gambar (JPG/PNG, maks. 5 MB) yang diupload jamaah sebagai bukti transfer pembayaran.
- **API_Publik**: Endpoint `/api/public/paket` yang dapat diakses tanpa autentikasi.
- **API_Sistem**: Endpoint `/api/system/paket` yang hanya dapat diakses oleh admin.
- **API_Jamaah**: Endpoint `/api/jamaah/*` yang hanya dapat diakses oleh jamaah yang terautentikasi.

---

## Requirements

### Requirement 1: Kuota Real-Time saat Pemesanan

**User Story:** Sebagai jamaah, saya ingin kuota paket berkurang secara otomatis saat saya memesan, sehingga informasi ketersediaan tempat selalu akurat.

#### Acceptance Criteria

1. WHEN jamaah berhasil membuat pendaftaran baru dengan status `MENUNGGU`, THE Sistem SHALL menghitung `Kuota_Tersedia` sebagai `Paket.kuota` dikurangi jumlah `Pendaftaran` berstatus `MENUNGGU` atau `TERKONFIRMASI` untuk paket tersebut.
2. WHEN jamaah mencoba memesan paket dengan `Kuota_Tersedia` sama dengan nol, THE API_Jamaah SHALL menolak permintaan dan mengembalikan pesan error "Kuota paket sudah penuh" dengan HTTP status 400.
3. THE Sistem SHALL menghitung `Kuota_Tersedia` secara dinamis dari database pada setiap permintaan, tanpa menyimpan nilai kuota tersedia sebagai field terpisah.
4. WHEN jamaah berhasil memesan paket, THE API_Jamaah SHALL mengembalikan data pendaftaran beserta nilai `Kuota_Tersedia` terkini dalam respons.

---

### Requirement 2: Kuota Real-Time saat Pembatalan

**User Story:** Sebagai jamaah, saya ingin kuota paket bertambah kembali saat saya membatalkan pemesanan, sehingga slot yang saya lepas bisa digunakan jamaah lain.

#### Acceptance Criteria

1. WHEN jamaah berhasil membatalkan pendaftaran dengan status `MENUNGGU` atau `TERKONFIRMASI`, THE API_Jamaah SHALL memperbarui status pendaftaran tersebut menjadi `TIDAK_TERKONFIRMASI`.
2. WHEN status pendaftaran berubah menjadi `TIDAK_TERKONFIRMASI` akibat pembatalan, THE Sistem SHALL secara otomatis merefleksikan penambahan `Kuota_Tersedia` pada kalkulasi berikutnya karena pendaftaran tersebut tidak lagi dihitung.
3. IF pendaftaran yang akan dibatalkan sudah memiliki pembayaran berstatus `TERVERIFIKASI`, THEN THE API_Jamaah SHALL menolak pembatalan dan mengembalikan pesan error dengan HTTP status 400.

---

### Requirement 3: Tampilan Kuota di Halaman Publik

**User Story:** Sebagai calon jamaah, saya ingin melihat sisa kuota paket di halaman publik, sehingga saya dapat memutuskan apakah masih ada tempat tersedia.

#### Acceptance Criteria

1. WHEN halaman daftar paket publik (`/paket`) dimuat, THE API_Publik SHALL mengembalikan `kuotaTersedia`, `isAvailable`, dan `quotaUsage` (used, total, percentage) untuk setiap paket berstatus `AKTIF`.
2. WHEN `Kuota_Tersedia` sama dengan nol, THE API_Publik SHALL mengembalikan `isAvailable: false` untuk paket tersebut.
3. THE API_Publik SHALL menghitung `Kuota_Tersedia` secara real-time dari jumlah `Pendaftaran` berstatus `MENUNGGU` atau `TERKONFIRMASI` pada setiap permintaan.
4. WHEN halaman detail paket publik (`/paket/detail/[slug]`) dimuat, THE API_Publik SHALL mengembalikan data kuota yang sama dengan halaman daftar paket.

---

### Requirement 4: Tampilan Kuota di Dashboard Jamaah

**User Story:** Sebagai jamaah, saya ingin melihat sisa kuota paket di dashboard saya, sehingga saya tahu apakah paket yang ingin saya pesan masih tersedia.

#### Acceptance Criteria

1. WHEN jamaah mengakses halaman pemesanan atau daftar paket di area jamaah, THE Sistem SHALL menampilkan nilai `Kuota_Tersedia` untuk setiap paket.
2. WHEN `Kuota_Tersedia` sama dengan nol, THE Sistem SHALL menampilkan indikator "Penuh" dan menonaktifkan tombol pesan untuk paket tersebut.
3. WHILE jamaah berada di halaman pemesanan, THE Sistem SHALL menampilkan `Kuota_Tersedia` yang konsisten dengan data yang dikembalikan oleh `API_Publik`.

---

### Requirement 5: Tampilan Kuota di Dashboard Admin

**User Story:** Sebagai Admin Operasional, saya ingin melihat sisa kuota setiap paket di halaman daftar paket, sehingga saya dapat memantau ketersediaan tempat.

#### Acceptance Criteria

1. WHEN Admin_Operasional mengakses halaman daftar paket (`/ADMIN_OPERASIONAL/daftar-paket`), THE API_Sistem SHALL mengembalikan data setiap paket beserta jumlah pendaftaran aktif (`terisi`) dan kuota total.
2. THE Sistem SHALL menampilkan kolom `Kuota` dan `Terisi` pada tabel daftar paket di dashboard Admin_Operasional.
3. WHEN jumlah pendaftaran aktif sama dengan atau melebihi `Paket.kuota`, THE Sistem SHALL menampilkan indikator visual "Penuh" pada baris paket tersebut.

---

### Requirement 6: Admin Operasional Mengedit Data Paket termasuk Kuota

**User Story:** Sebagai Admin Operasional, saya ingin dapat mengedit semua data paket termasuk field kuota dari halaman daftar paket, sehingga saya dapat menyesuaikan kapasitas paket sesuai kebutuhan operasional.

#### Acceptance Criteria

1. WHEN Admin_Operasional mengklik tombol edit pada baris paket di halaman daftar paket, THE Sistem SHALL mengarahkan ke halaman form edit paket yang sudah terisi data paket tersebut.
2. THE Sistem SHALL menampilkan field `kuota` pada form edit paket dan mengizinkan Admin_Operasional mengubah nilainya.
3. WHEN Admin_Operasional menyimpan perubahan dengan nilai `kuota` yang valid (bilangan bulat positif, tidak melebihi 10.000), THE API_Sistem SHALL memperbarui `Paket.kuota` di database dan mengembalikan data paket yang diperbarui.
4. IF Admin_Operasional memasukkan nilai `kuota` yang tidak valid (bukan bilangan bulat, negatif, atau melebihi 10.000), THEN THE API_Sistem SHALL menolak permintaan dan mengembalikan pesan error yang deskriptif dengan HTTP status 400.
5. IF Admin_Operasional memasukkan nilai `kuota` baru yang lebih kecil dari jumlah pendaftaran aktif saat ini, THEN THE API_Sistem SHALL menolak permintaan dan mengembalikan pesan error "Kuota baru tidak boleh lebih kecil dari jumlah pendaftaran aktif ([n] pendaftaran)" dengan HTTP status 400.
6. WHEN perubahan data paket berhasil disimpan, THE Sistem SHALL menampilkan notifikasi sukses dan memperbarui tampilan daftar paket dengan data terbaru.

---

### Requirement 7: Jamaah Melihat Detail Status Pembayaran

**User Story:** Sebagai jamaah, saya ingin melihat detail status setiap tahap pembayaran (DP, cicilan, pelunasan) di halaman pembayaran saya, sehingga saya tahu berapa yang sudah dibayar dan berapa yang masih harus dibayar.

#### Acceptance Criteria

1. WHEN jamaah mengakses halaman pembayaran (`/jamaah/pembayaran`), THE API_Jamaah SHALL mengembalikan semua `Pendaftaran` milik jamaah tersebut beserta relasi `Pembayaran`, `Paket`, `Hotel`, dan `Penerbangan`.
2. THE Sistem SHALL menampilkan setiap `Pembayaran` dengan informasi: jenis (`DP`/`CICILAN_1`/`PELUNASAN`), jumlah, status (`MENUNGGU`/`TERVERIFIKASI`/`DITOLAK`), dan tenggat waktu pembayaran.
3. THE Sistem SHALL menampilkan ringkasan keuangan per pendaftaran: total harga paket, total yang sudah terverifikasi, dan sisa yang harus dibayar.
4. WHEN status `Pembayaran` adalah `MENUNGGU`, THE Sistem SHALL menampilkan tombol "Upload Bukti" untuk pembayaran tersebut.
5. WHEN status `Pembayaran` adalah `TERVERIFIKASI`, THE Sistem SHALL menampilkan indikator konfirmasi dan menyembunyikan tombol upload.
6. WHEN status `Pembayaran` adalah `DITOLAK`, THE Sistem SHALL menampilkan indikator penolakan pada pembayaran tersebut.

---

### Requirement 8: Jamaah Upload Bukti Pembayaran

**User Story:** Sebagai jamaah, saya ingin dapat mengupload bukti transfer untuk setiap tahap pembayaran, sehingga admin dapat memverifikasi pembayaran saya.

#### Acceptance Criteria

1. WHEN jamaah memilih file dan mengklik tombol upload pada modal bukti pembayaran, THE API_Jamaah SHALL menerima file gambar dan `pembayaranId`, lalu menyimpan URL file ke field `Pembayaran.buktiUrl`.
2. IF file yang diupload bukan bertipe gambar (bukan `image/*`), THEN THE Sistem SHALL menolak file tersebut dan menampilkan pesan error "File harus berupa gambar".
3. IF ukuran file melebihi 5 MB, THEN THE Sistem SHALL menolak file tersebut dan menampilkan pesan error "Ukuran file maksimal 5MB".
4. WHEN upload bukti berhasil, THE Sistem SHALL menampilkan notifikasi sukses dan memperbarui tampilan halaman pembayaran dengan data terbaru.
5. WHEN jamaah mengklik "Lihat Bukti" pada pembayaran yang sudah memiliki `buktiUrl`, THE Sistem SHALL membuka URL bukti di tab baru.

---

### Requirement 9: Jamaah Melihat Informasi Keberangkatan Lengkap

**User Story:** Sebagai jamaah, saya ingin melihat informasi keberangkatan lengkap termasuk tanggal, maskapai, hotel, dan bandara di halaman keberangkatan saya, sehingga saya dapat mempersiapkan perjalanan dengan baik.

#### Acceptance Criteria

1. WHEN jamaah mengakses halaman keberangkatan (`/jamaah/keberangkatan`), THE API_Jamaah SHALL mengembalikan semua `Pendaftaran` milik jamaah beserta relasi `Paket`, `Hotel`, dan `Penerbangan`.
2. THE Sistem SHALL menampilkan informasi keberangkatan berikut untuk setiap pendaftaran: tanggal berangkat, tanggal pulang, nama hotel, lokasi hotel, nama maskapai, bandara keberangkatan, dan bandara tujuan.
3. WHEN data `Penerbangan.waktuBerangkat` tersedia, THE Sistem SHALL menampilkan waktu keberangkatan dalam format jam dan menit (HH:MM) zona waktu lokal.
4. WHEN data `Penerbangan.waktuTiba` tersedia, THE Sistem SHALL menampilkan waktu tiba dalam format jam dan menit (HH:MM) zona waktu lokal.
5. IF data maskapai, bandara tujuan, atau waktu penerbangan belum diisi oleh admin, THEN THE Sistem SHALL menampilkan teks "TBA" (To Be Announced) sebagai placeholder.
6. THE Sistem SHALL menampilkan status pendaftaran jamaah (`MENUNGGU`/`TERKONFIRMASI`/`TIDAK_TERKONFIRMASI`) pada setiap kartu keberangkatan.

---

### Requirement 10: Konsistensi Data Kuota Lintas Halaman

**User Story:** Sebagai pengguna sistem (jamaah, admin, atau pengunjung publik), saya ingin melihat informasi kuota yang konsisten di semua halaman, sehingga tidak ada kebingungan akibat data yang berbeda.

#### Acceptance Criteria

1. THE Sistem SHALL menggunakan satu metode kalkulasi `Kuota_Tersedia` yang seragam di semua endpoint: `Paket.kuota` dikurangi `COUNT(Pendaftaran WHERE paketId = X AND status IN ['MENUNGGU', 'TERKONFIRMASI'])`.
2. WHEN data paket diperbarui oleh Admin_Operasional, THE Sistem SHALL memastikan semua halaman yang menampilkan kuota mengambil data terbaru dari database pada permintaan berikutnya.
3. THE API_Publik, THE API_Sistem, dan THE API_Jamaah SHALL menggunakan logika kalkulasi kuota yang identik sehingga nilai yang ditampilkan konsisten di halaman publik, dashboard jamaah, dan dashboard admin.
