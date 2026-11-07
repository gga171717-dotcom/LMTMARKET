"use client";

import React from "react";
import { motion } from "framer-motion";
import { ElectricStrokeText } from "@/components/electric-stroke-text";

interface ChainedTextProps {
  text: string;
  className?: string;
}

export const ChainedText = ({ text, className = "" }: ChainedTextProps) => {
  return (
    <div className={`relative inline-block py-8 px-12 ${className}`}>
      {/* ខ្សែច្រវាក់រត់ព័ទ្ធជុំវិញ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="chainGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00bfff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#00bfff" />
          </linearGradient>
        </defs>

        <rect
          x="2"
          y="2"
          width="98%"
          height="92%"
          rx="12"
          fill="none"
          stroke="rgba(0, 191, 255, 0.2)"
          strokeWidth="1.5"
        />

        <motion.rect
          x="2"
          y="2"
          width="98%"
          height="92%"
          rx="12"
          fill="none"
          stroke="url(#chainGradient)"
          strokeWidth="4"
          strokeDasharray="12 8 4 8"
          filter="url(#chainGlow)"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>

      {/* ✅ ដូរ fontSize ពី "50" មកជា "85" ដើម្បីให้อក្សរធំច្បាស់ពេញភ្នែក */}
      <div className="relative z-10 flex items-center justify-center scale-75 md:scale-100">
        <ElectricStrokeText
          text={text}
          fontSize="160"
          strokeWidth={2.5}
          className="text-center"
        />
      </div>
    </div>
  );
};