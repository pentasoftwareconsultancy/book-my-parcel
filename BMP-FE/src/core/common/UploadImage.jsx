import React from "react";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", JPEG_QUALITY);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const UploadImage = ({
  label,
  helper = "Upload Parcel Photo",
  note = "PNG, JPG up to 5MB",
  value,
  onChange,
}) => {
  const id = React.useId();
  const [previewUrl, setPreviewUrl] = React.useState("");

  // Create/revoke object URL only when `value` changes
  React.useEffect(() => {
    if (!value || typeof value === "string") {
      setPreviewUrl(typeof value === "string" ? getStringUrl(value) : "");
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url); // cleanup on unmount / value change
  }, [value]);

  const getStringUrl = (val) => {
  if (!val) return "";
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  
  // Relative paths like /uploads/parcels/... go through Vite proxy
  if (val.startsWith("/uploads/")) return val;
  
  // Fallback for other relative paths
  const baseUrl = import.meta.env.VITE_API_URL ?? "";
  return `${baseUrl}${val.startsWith("/") ? "" : "/"}${val}`;
};

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const result = new File(
      [compressed],
      file.name.replace(/\.[^.]+$/, ".jpg"),
      { type: "image/jpeg" }
    );
    onChange?.(result);
  };

  return (
    <label
      htmlFor={id}
      className="relative flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-xs transition hover:border-primary"
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        // ❌ removed capture="environment" — blocks desktop file picker
        className="hidden"
        onChange={handleChange}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="absolute inset-0 h-full w-full rounded-2xl object-cover"
        />
      ) : (
        <>
          <span className="mb-1 text-[10px] font-medium text-gray-400">{label}</span>
          <span className="mb-1 text-gray-600">{helper}</span>
          <span className="text-[10px] text-gray-400">PNG, JPG — auto compressed</span>
        </>
      )}
    </label>
  );
};

export default UploadImage;