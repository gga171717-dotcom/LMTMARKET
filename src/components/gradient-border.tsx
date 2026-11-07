"use client";

import React from "react";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  slow?: boolean;
}

export const GradientBorder = ({
  children,
  className = "",
  slow = false,
}: GradientBorderProps) => {
  return (
    <div
      className={`gradient-border ${slow ? "gradient-border-slow" : ""} ${className}`}
    >
      {children}
    </div>
  );
};