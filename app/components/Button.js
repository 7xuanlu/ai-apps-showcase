import React from "react";

const sizeMap = {
  sm:   "text-xs py-1.5 px-3 border",
  md:   "text-sm py-2 px-4 border",
  lg:   "text-base py-3 px-6 border"
};

const colorMap = {
  blue: "bg-sky-500 text-white hover:bg-sky-600",
  gray: "bg-gray-400 text-white",
  // Add more color variants as needed
};

export default function Button({
  children,
  size = "md",
  color = "blue",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`btn ${sizeMap[size]} ${colorMap[color]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 