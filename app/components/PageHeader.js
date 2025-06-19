import React from "react";

export default function PageHeader({ children }) {
  return (
    <div className="flex flex-col mb-8 items-center">
      <h1 className="text-5xl font-bold">{children}</h1>
    </div>
  );
} 