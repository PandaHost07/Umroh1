import Swal from "sweetalert2";

export const alertSuccess = (text = "success") => {
    Swal.fire({
        icon: "success",
        title: text,
        showConfirmButton: false,
        timer: 1500,
    });
};

export const alertError = (text = "error") => {
    Swal.fire({
        icon: "error",
        title: text,
        showConfirmButton: true,
    });
};