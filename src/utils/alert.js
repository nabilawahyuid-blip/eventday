import Swal from "sweetalert2";
import "./alert.css";

const alertConfig = {
  buttonsStyling: true,

  // Jangan tambah padding kompensasi scrollbar ke <body> saat modal
  // terbuka — itu yang menggeser kolom halaman di belakang alert.
  scrollbarPadding: false,

  customClass: {
    popup: "eventday-alert-popup",
    title: "eventday-alert-title",
    htmlContainer: "eventday-alert-text",
    confirmButton: "eventday-alert-confirm",
    cancelButton: "eventday-alert-cancel",
  },
};

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    ...alertConfig,
    icon: "success",
    title: title,
    text: text,
    confirmButtonText: "Oke",
  });
};

export const showError = (title, text = "") => {
  return Swal.fire({
    ...alertConfig,
    icon: "error",
    title: title,
    text: text,
    confirmButtonText: "Coba Lagi",
  });
};

export const showWarning = (title, text = "") => {
  return Swal.fire({
    ...alertConfig,
    icon: "warning",
    title: title,
    text: text,
    confirmButtonText: "Oke",
  });
};

export const showInfo = (title, text = "") => {
  return Swal.fire({
    ...alertConfig,
    icon: "info",
    title: title,
    text: text,
    confirmButtonText: "Oke",
  });
};

export const showLoading = (title = "Memproses...") => {
  return Swal.fire({
    ...alertConfig,
    title: title,
    text: "Mohon tunggu sebentar.",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeAlert = () => {
  Swal.close();
};

export const showConfirm = (
  title,
  text = "",
  confirmText = "Ya",
  cancelText = "Batal"
) => {
  return Swal.fire({
    ...alertConfig,
    icon: "question",
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
};

export const showToast = (icon, title) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,

    customClass: {
      popup: "eventday-toast",
      title: "eventday-toast-title",
    },

    didOpen: (toast) => {
      toast.addEventListener(
        "mouseenter",
        Swal.stopTimer
      );

      toast.addEventListener(
        "mouseleave",
        Swal.resumeTimer
      );
    },
  });

  return Toast.fire({
    icon: icon,
    title: title,
  });
};

export const showInputDialog = ({
  title,
  text = "",
  input = "text",
  inputOptions = {},
  inputPlaceholder = "",
  inputValue = "",
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  requiredMessage = "Nilai wajib diisi.",
}) => {
  return Swal.fire({
    ...alertConfig,
    icon: "question",
    title: title,
    text: text,
    input: input,
    inputOptions: input === "select" ? inputOptions : undefined,
    inputPlaceholder: inputPlaceholder,
    inputValue: inputValue,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    inputValidator: (value) => {
      if (value === undefined || value === null || String(value).trim() === "") {
        return requiredMessage;
      }
      return undefined;
    },
  });
};