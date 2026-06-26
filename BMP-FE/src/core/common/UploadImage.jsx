import React from "react";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

/** Compress a File/Blob to a JPEG Blob, capped at MAX_DIMENSION on the longest side. */
function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) { height = Math.round((height * MAX_DIMENSION) / width); width = MAX_DIMENSION; }
        else { width = Math.round((width * MAX_DIMENSION) / height); height = MAX_DIMENSION; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
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

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    // Wrap blob back into a File so FormData sends a proper filename
    const result = new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
    onChange?.(result);
  };


  const getImageUrl = () => {
    if (!value) return "";

    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
    console.log("value:", value);

    if (typeof value === "string") {
      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        console.log("Final URL:", value);
        return value;
      }

      const backendUrl = import.meta.env.VITE_SERVER_BASE_URL;

      if (!backendUrl) {
        console.error("VITE_SERVER_BASE_URL is missing");
      }

      const finalUrl = `${backendUrl}${value.startsWith("/") ? "" : "/"}${value}`;

      console.log("backendUrl:", backendUrl);
      console.log("Final URL:", finalUrl);

      return finalUrl;
    }

    return URL.createObjectURL(value);
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
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <img
          src={getImageUrl()}
          alt="Preview"
          className="absolute inset-0 h-full w-full rounded-2xl object-cover"
        />
      ) : (
        <>
          <span className="mb-1 text-[10px] font-medium text-gray-400">
            {label}
          </span>
          <span className="mb-1 text-gray-600">{helper}</span>
          <span className="text-[10px] text-gray-400">PNG, JPG — auto compressed</span>
        </>
      )}
    </label>
  );
};

export default UploadImage;