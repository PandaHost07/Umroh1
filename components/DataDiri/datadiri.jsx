"use client"

import { useSession } from "next-auth/react";

export const formatDataDiri = (form) => {
    const { data } = useSession()

    const dataPribadi = {
        'Nama Lengkap': form.nama,
        'Jenis Kelamin': 'Laki-Laki',
        'Status Pernikahan': 'Menikah',
        'Tempat Lahir': 'Berbah',
        'Tanggal Lahir': '13 Februari 1977',
        'Nomor KTP': '2937653416543513',
        'Nomor Telepon': '+6211149658594',
        'Alamat': '-, Berbah, Sleman, DI Yogyakarta, Indonesia, 84915',
        'Email': 'dummyemail27534@user-002934.trial.erahajj.co.id',
    };

    const dataPaspor = {
        'Nama Lengkap': '-',
        'Nomor': '-',
        'Tempat Terbit': '-',
        'Negara Penerbit': '-',
        'Tanggal Terbit': '-',
        'Tanggal Kadaluwarsa': '-',
    };

    const dataLain = {
        'ID Transaksi': '-',
        'Peran & Hak Akses': '-',
        'Referensi Marketing': '-',
        'NPWP': '-',
        'Waktu Registrasi': '-',
        'Status Transaksi': '-',
        'Catatan Khusus': '-',
    };

    return { dataPribadi, dataPaspor, dataLain }
}