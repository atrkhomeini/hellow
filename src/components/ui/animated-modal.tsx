"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// ==================== Context ====================

const ModalContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

// ==================== Modal ====================

export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

// ==================== ModalTrigger ====================

export function ModalTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { setOpen } = React.useContext(ModalContext);

  return (
    <button
      onClick={() => setOpen(true)}
      className={className}
    >
      {children}
    </button>
  );
}

// ==================== ModalBody ====================

export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen } = React.useContext(ModalContext);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-full max-w-lg max-h-[90vh] overflow-auto",
              "bg-background border border-border rounded-2xl shadow-2xl",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface-200 hover:bg-surface-300 transition-colors z-10"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ==================== ModalContent ====================

export function ModalContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

// ==================== ModalFooter ====================

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-end gap-3 p-6 pt-0", className)}>
      {children}
    </div>
  );
}