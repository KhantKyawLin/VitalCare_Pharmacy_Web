import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    backdrop: false, // Ensure no screen fade/dimming
    heightAuto: false, // Prevent body height jump
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const showSuccessToast = (message) => {
    Toast.fire({
        icon: 'success',
        title: message,
        iconColor: 'var(--primary-color)',
    });
};

export const showErrorToast = (message) => {
    Toast.fire({
        icon: 'error',
        title: message,
    });
};

export const showWarningToast = (message) => {
    Toast.fire({
        icon: 'warning',
        title: message,
    });
};

export const showInfoToast = (message) => {
    Toast.fire({
        icon: 'info',
        title: message,
        iconColor: 'var(--accent-color)',
    });
};

export default Toast;
