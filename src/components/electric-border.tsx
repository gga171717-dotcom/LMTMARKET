"use client";

import React from "react";

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const ElectricBorder = ({
  children,
  className = "",
}: ElectricBorderProps) => {
  return (
    <div className={`electric-border-wrapper ${className}`}>
      <div className="electric-border-inner">{children}</div>
    </div>
  );
};