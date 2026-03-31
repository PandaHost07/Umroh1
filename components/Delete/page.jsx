"use client"
import Swal from "sweetalert2";
import { alertError, alertSuccess } from "../Alert/alert";

export const Delete = async (api) => {
    const result = await Swal.fire({
        title: "Hapus Data?",
        text: "Anda yakin akan menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, hapus",
    });

    if (result.isConfirmed) {
        const del = await fetch(api, { method: "DELETE",});

        if (del.ok) {
            alertSuccess("Berhasil Dihapus");
            return true;
        } else {
            alertError("Gagal Dihapus");
            return false;
        }
    }

    return false;
};
