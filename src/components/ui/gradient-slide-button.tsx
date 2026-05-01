"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientSlideButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  colorFrom?: string;
  colorTo?: string;
}

export function GradientSlideButton({
  children,
  className,
  colorFrom = "#3ecf8e",
  colorTo = "#2dd4bf",
  ...props
}: GradientSlideButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden px-8 py-4 rounded-full font-semibold",
        "bg-transparent border-2 border-primary text-primary",
        "hover:text-white transition-colors duration-300",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Gradient overlay that slides in from left */}
      <motion.span
        className="absolute inset-0 z-0 rounded-full"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "0%" : "-100%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`,
        }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}