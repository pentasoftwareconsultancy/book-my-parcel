// src/components/common/TextInput.jsx
import React from "react";


{/*input field with label component*/}

const TextInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
  icon:Icon,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="text-[11px] text-gray-600 block"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
       <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        )}
      <input
        id={name}
        name={name}
        type={type}
        className={`w-full border rounded-md py-2 text-base focus:outline-none focus:ring-1 focus:ring-blue-500 
          ${Icon ? "pl-10" : "px-3"} ${className}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
        </div>
    </div>
  );
};

export default TextInput;


//for upload images

