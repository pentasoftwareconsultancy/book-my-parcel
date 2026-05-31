import React from "react";

const UploadImage = ({
  label,
  helper = "Upload Parcel Photo",
  note = "PNG, JPG up to 5MB",
  value,
  onChange,
}) => {
  const id = React.useId();

  const getImageUrl = () => {
    if (!value) return "";

    if (typeof value === "string") {
      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        return value;
      }

      const backendUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:3000";

      return `${backendUrl}${value.startsWith("/") ? "" : "/"}${value}`;
    }

    try {
      return URL.createObjectURL(value);
    } catch {
      return "";
    }
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
        className="hidden"
        onChange={(e) => onChange?.(e.target.files?.[0] || null)}
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
          <span className="text-[10px] text-gray-400">{note}</span>
        </>
      )}
    </label>
  );
};

export default UploadImage;