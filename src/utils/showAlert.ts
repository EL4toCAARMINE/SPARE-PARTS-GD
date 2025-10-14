import Swal from "sweetalert2";

// Función para mostrar alertas con SweetAlert2
export const showAlert = (icon:  "success" | "error" | "warning" | "info" | "question", title: string, seeCancel?: boolean, target?: string) => {
  Swal.fire({
    title: title,
    icon: icon,
    confirmButtonText: "Entendido",
    cancelButtonText: "Cancelar",
    target: `#${target}`,
    showCancelButton: seeCancel,
    customClass: {
      container: "alertSwal",
      confirmButton: "button",
      cancelButton: "buttonCancel",
      title: "title",
      popup: "popup",
    }
  });
};