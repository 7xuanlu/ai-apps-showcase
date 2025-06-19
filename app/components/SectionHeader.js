import React from "react";

export default function SectionHeader({ children }) {
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-semibold">{children}</h2>
    </div>
  );
} 