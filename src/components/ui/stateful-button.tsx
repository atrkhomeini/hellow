"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function Button({
  children,
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== "idle") return;

    setStatus("loading");

    try {
      if (onClick) {
        await (onClick as (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void)(e);
      }
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setStatus("idle");
    }
  };

  const baseStyles = cn(
    "relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
    "disabled:opacity-50 disabled:pointer-events-none"
  );

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent hover:bg-surface-300 text-foreground",
    ghost: "bg-transparent hover:bg-surface-300 text-foreground",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || status !== "idle"}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={status === "idle" ? { scale: 1.02 } : {}}
      whileTap={status === "idle" ? { scale: 0.98 } : {}}
      {...props}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}

        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.span>
        )}

        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Done
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}