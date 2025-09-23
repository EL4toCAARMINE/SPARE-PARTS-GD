import Swal from "sweetalert2";

// Función para mostrar alertas con SweetAlert2
export const showAlert = (icon:  "success" | "error" | "warning" | "info" | "question", title: string) => {
  Swal.fire({
    title: title,
    icon: icon,
    confirmButtonText: "Entendido",
    customClass: {
      container: "alertSwal",
      confirmButton: "button",
      title: "title",
      popup: "popup"
    }
  });
};