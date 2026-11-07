"use client";

import React from "react";

interface ElectricStrokeTextProps {
  text: string;
  className?: string;
  fontSize?: string;
  strokeWidth?: number;
}

export const ElectricStrokeText = ({
  text,
  className = "",
  fontSize = "120",
  strokeWidth = 2,
}: ElectricStrokeTextProps) => {
  // គណនា viewBox តាមប្រវែងអក្សរ
  const textLength = text.length;
  const viewBoxWidth = Math.max(400, textLength * 80);
  const viewBoxHeight = 200;

  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full max-w-4xl"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Gradient សម្រាប់រន្ទះឆក់ */}
          <linearGradient id="electricGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00bfff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#00bfff" />
          </linearGradient>

          {/* Glow filter សម្រាប់រន្ទះឆក់ */}
          <filter id="electricGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow ខ្លាំងសម្រាប់អក្សរ */}
          <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* អក្សរស្រទាប់ខាងក្រោយ (fill ស្រាល) */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="'Space Grotesk', sans-serif"
          fill="rgba(255,255,255,0.05)"
          letterSpacing="-4"
        >
          {text}
        </text>

        {/* អក្សរស្រទាប់កណ្តាល (stroke ស្រាល) */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="'Space Grotesk', sans-serif"
          fill="transparent"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          letterSpacing="-4"
        >
          {text}
        </text>

        {/* 🔥 រន្ទះឆក់ដេញតាម outline អក្សរ */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="'Space Grotesk', sans-serif"
          fill="transparent"
          stroke="url(#electricGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray="100 900"
          strokeLinecap="round"
          filter="url(#electricGlow)"
          className="electric-stroke-animated"
          letterSpacing="-4"
        >
          {text}
        </text>

        {/* រន្ទះឆក់ដេញទីពីរ (ច្រាសទិស) */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="'Space Grotesk', sans-serif"
          fill="transparent"
          stroke="url(#electricGradient)"
          strokeWidth={strokeWidth + 1}
          strokeDasharray="50 950"
          strokeLinecap="round"
          filter="url(#electricGlow)"
          className="electric-stroke-animated-reverse"
          letterSpacing="-4"
          opacity="0.5"
        >
          {text}
        </text>
      </svg>
    </div>
  );
};