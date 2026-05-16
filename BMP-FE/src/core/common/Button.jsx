import React from "react";

const variantClasses = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  outline:
    "border border-primary text-primary bg-white hover:bg-primary/5",
  success:
    "bg-success text-white hover:bg-emerald-600",
  destructive:
    "bg-error text-white hover:bg-red-600",
};

const sizeClasses = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-3",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center rounded-full font-medium transition
      focus:outline-none focus:ring-2 focus:ring-primary/40
      ${variantClasses[variant]} ${sizeClasses[size]} ${
      fullWidth ? "w-full" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
