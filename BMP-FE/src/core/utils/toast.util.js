import { toast } from 'react-toastify';

/**
 * Utility functions for displaying toast notifications
 */

// Success messages
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored"
  });
};

// Error messages
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored"
  });
};

// Info messages
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored"
  });
};

// Warning messages
export const showWarning = (message) => {
  toast.warn(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored"
  });
};

// Default toast
export const showToast = (message, type = 'info') => {
  switch (type) {
    case 'success':
      showSuccess(message);
      break;
    case 'error':
      showError(message);
      break;
    case 'warning':
      showWarning(message);
      break;
    default:
      showInfo(message);
  }
};

// Chainable methods for showToast.success(...) / showToast.error(...) usage
showToast.success = showSuccess;
showToast.error   = showError;
showToast.info    = showInfo;
showToast.warning = showWarning;

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showToast
};