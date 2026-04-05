# Panduan kode — Ada Tour Travel

Dokumen ini melengkapi **README.md** dan **presentasi HTML** (`public/presentasi-flow.html`) dengan fokus **implementasi**: file apa yang terlibat, pola coding, dan titik perlu hati-hati.

---

## 1. Model mental aplikasi

- Satu repo **Next.js App Router**: UI (`app/**/page.js|jsx`) dan API (`app/api/**/route.js`) dalam proyek yang sama.
- **Autentikasi**: NextAuth (JWT) + baris di tabel **`Session`** yang diisi saat login berhasil.
- **Otorisasi halaman**: **middleware** membaca JWT, memverifikasi `Session` di DB, lalu memastikan URL cocok dengan **`Akun.role`**.

---

## 2. Alur file saat login

| Urutan | File | Peran |
|--------|------|--------|
| 1 | `app/(auth page)/login/page.js` | Form; memanggil `signIn` NextAuth |
| 2 | `app/api/auth/[...nextauth]/route.js` | Mengekspor handler GET/POST NextAuth |
| 2b | (di dalam route yang sama) `authOptions` | `CredentialsProvider` → `prisma.akun.findUnique` → `bcrypt.compare` → `prisma.session.create` |
| 3 | `lib/prisma.js` | Koneksi DB (+ `withAccelerate()` jika URL `prisma+...`) |
| 4 | `middleware.js` | Membungkus `withAuth` untuk prefix tertentu |
| 5 | `middlewares/withAuth.js` | `getToken` → `prisma.session.findUnique` → cek role vs pathname |

**Callback penting NextAuth** (di `authOptions.callbacks`): `jwt` dan `session` menyalin `role`, `sessionToken`, dll. ke token/sesi yang dibaca client.

---

## 3. Alur file saat registrasi jamaah

| File | Peran |
|------|--------|
| `app/(auth page)/register/page.js` | Form; `fetch("/api/system/register", { method: "POST", body: JSON })` |
| `app/api/system/register/route.js` | Validasi body, cek `DATABASE_URL`, cek email unik, `bcrypt.hash`, `prisma.akun.create` dengan `role: "jamaah"` (sesuai body + enum) |

---

## 4. Pola API route (`route.js`)

Konvensi Next App Router:

```javascript
// Contoh bentuk umum
import prisma from "@/lib/prisma";

export async function GET(request) {
  // const { searchParams } = new URL(request.url);
  const data = await prisma.paket.findMany(/* ... */);
  return Response.json(data);
}

export async function POST(request) {
  const body = await request.json();
  // validasi + prisma create/update/delete
  return Response.json({ ok: true }, { status: 201 });
}
```

- Impor **`@/lib/prisma`** untuk akses database.
- Untuk cek user yang login di API, biasanya **`getServerSession`** dari `next-auth` dengan `authOptions` (impor dari file NextAuth), atau validasi header/token sesuai yang dipakai di route tersebut.

---

## 5. Peta endpoint (ringkas)

| Prefix | Konsumen tipikal | Contoh kegunaan |
|--------|------------------|-----------------|
| `/api/auth/*` | NextAuth | Login, session |
| `/api/public/*` | Halaman publik | Paket tanpa login |
| `/api/system/*` | Admin / sistem | CRUD master, pembayaran, register |
| `/api/jamaah/*` | User `jamaah` | Pesan, upload, pendaftaran |

Detail tiap method ada di masing-masing `route.js`.

---

## 6. Komponen UI

- **`components/`**: potongan UI bersama (navbar per role, sidebar, tabel, modal, chart, ekspor PDF/Excel).
- Halaman admin/jamaah sering **`"use client"`** jika memakai hook state, `useEffect`, atau event handler yang memanggil `fetch`.

---

## 7. Database & Prisma

- **Sumber skema**: `prisma/schema.prisma`.
- Setelah mengubah skema: `npx prisma migrate dev` (lokal dengan DB langsung) atau alur migrate Anda; lalu `npx prisma generate`.
- **`prisma/seed.js`**: masih mengacu model lama — **jangan dianggap valid** sampai diperbarui. Untuk akun admin contoh gunakan **`npm run seed:file-data`** (`file-data.js` + `file-data.json`).

---

## 8. Penyimpanan file

- **Firebase**: `lib/firebaseAdmin.js` — pastikan `FIREBASE_*` di `.env` terisi dan private key memakai `\n` yang di-`replace` saat runtime.
- **Vercel Blob**: token `BLOB_READ_WRITE_TOKEN` — dipakai di route upload yang relevan.

---

## 9. Email

- **`lib/mail.js`** (dan pemanggilnya) memakai **Nodemailer** + `SMTP_USER` / `SMTP_PASS`. Password aplikasi Gmail sering berisi spasi; di `.env` bungkus dengan tanda kutip.

---

## 10. Checklist sebelum deploy / presentasi teknis

- [ ] `.env` lengkap di server; tidak ada rahasia di repo.
- [ ] `NEXTAUTH_URL` sesuai domain produksi.
- [ ] `prisma generate` (dan `--no-engine` jika build Vercel sesuai `package.json`).
- [ ] Uji login untuk tiap role (`jamaah`, `ADMIN_OPERASIONAL`, `ADMIN_KEUANGAN`).
- [ ] Buka `public/presentasi-flow.html` untuk penjelasan visual alur.

---

## 11. Peta “fitur → file” (ringkas)

Tabel lengkap per menu (publik, login, register, jamaah, admin keuangan, admin operasional) ada di **`public/presentasi-flow.html`**, bagian **« 11b. Referensi cepat: fitur → lokasi file »** (buka dari menu samping dokumen HTML).

---

## 12. Dokumen terkait

| File | Isi |
|------|-----|
| `README.md` | Ikhtisar proyek, flow Mermaid teks, skema |
| `public/presentasi-flow.html` | Presentasi + menu navigasi + **bab 11b** (fitur ↔ path file) |
| `docs/CODING-GUIDE.md` | Dokumen ini — jejak file & konvensi kode |
