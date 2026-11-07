"use client";

import React from "react";

interface ElectricTextProps {
  text: string;
  className?: string;
  fontSize?: string;
}

export const ElectricText = ({
  text,
  className = "",
  fontSize = "clamp(40px, 6vw, 72px)",
}: ElectricTextProps) => {
  return (
    <div className="relative inline-block">
      {/* រន្ទះឆក់ 5 */}
      <span className="lightning-bolt" />
      <span className="lightning-bolt" />
      <span className="lightning-bolt" />
      <span className="lightning-bolt" />
      <span className="lightning-bolt" />

      {/* អក្សររន្ទះឆក់ */}
      <span
        data-text={text}
        className={`electric-text ${className}`}
        style={{
          fontSize,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          letterSpacing: "-0.06em",
          lineHeight: 0.95,
        }}
      >
        {text}
      </span>
    </div>
  );
};