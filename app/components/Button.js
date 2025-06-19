import React from "react";
import Link from "next/link";

const sizeMap = {
  sm: "text-xs py-1.5 px-3 border",
  md: "text-sm py-2 px-4 border",
  lg: "text-base py-3 px-6 border",
  landing: "text-xl py-6 px-12 border",
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
  href,
  ...props
}) {
  const classes = `btn ${sizeMap[size]} ${colorMap[color]} ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;
  
  const buttonElement = (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );

  if (href) {
    return (
      <Link href={href} legacyBehavior passHref>
        {buttonElement}
      </Link>
    );
  }

  return buttonElement;
}
