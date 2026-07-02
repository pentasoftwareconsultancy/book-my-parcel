import { useEffect } from "react";

export function useModalDismiss(onClose, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return { handleBackdropClick };
}

export default useModalDismiss;
