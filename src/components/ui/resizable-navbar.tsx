"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, User } from "lucide-react";

// ==================== Types ====================

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: NavItem[];
  activeItem?: string;
  onItemClick?: (link: string) => void;
  className?: string;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MobileNavToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

interface NavbarLogoProps {
  className?: string;
}

interface NavbarButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  className?: string;
  href?: string;
}

// ==================== Context ====================

const NavbarContext = React.createContext<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
}>({
  visible: true,
  setVisible: () => {},
});

// ==================== Main Navbar Component ====================

export function Navbar({ children, className }: NavbarProps) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100 || currentScrollY < lastScrollY) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <NavbarContext.Provider value={{ visible, setVisible }}>
      <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
        {children}
      </div>
    </NavbarContext.Provider>
  );
}

// ==================== NavBody (Desktop) ====================

export function NavBody({ children, className }: NavBodyProps) {
  const { visible } = React.useContext(NavbarContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex items-center justify-between relative mx-auto px-6 py-3",
        "transition-all duration-300",
        scrolled
          ? "max-w-5xl rounded-full mt-4 bg-background/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          : "max-w-7xl bg-transparent",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ==================== NavItems ====================

export function NavItems({ items, activeItem, onItemClick, className }: NavItemsProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const isActive = activeItem === item.link.replace("#", "");
        const isHovered = hoveredItem === item.link;
        
        return (
          <motion.a
            key={item.link}
            href={item.link}
            onClick={(e) => {
              e.preventDefault();
              onItemClick?.(item.link.replace("#", ""));
            }}
            onMouseEnter={() => setHoveredItem(item.link)}
            onMouseLeave={() => setHoveredItem(null)}
            className={cn(
              "relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-300",
              "hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background highlight - contained within item */}
            <AnimatePresence>
              {(isActive || isHovered) && (
                <motion.div
                  layoutId="navHighlight"
                  className="absolute inset-0 bg-primary/10 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </AnimatePresence>

            {/* Show icon + name for active, just icon for others */}
            <span className="relative flex items-center gap-2">
              {item.icon && (
                <span className={cn("text-base", isActive && "text-primary")}>
                  {item.icon}
                </span>
              )}
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </span>
          </motion.a>
        );
      })}
    </nav>
  );
}

// ==================== MobileNav ====================

export function MobileNav({ children, className }: MobileNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "flex md:hidden items-center justify-between px-4 py-3 mx-4 mt-4 rounded-full",
        "transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          : "bg-background/80 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}

// ==================== MobileNavHeader ====================

export function MobileNavHeader({ children, className }: MobileNavHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {children}
    </div>
  );
}

// ==================== MobileNavToggle ====================

export function MobileNavToggle({ isOpen, onClick, className }: MobileNavToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-full hover:bg-surface-300 transition-colors",
        className
      )}
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
}

// ==================== MobileNavMenu ====================

export function MobileNavMenu({ children, isOpen, onClose, className }: MobileNavMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full left-4 right-4 mt-2 p-4 rounded-2xl",
              "bg-background/95 backdrop-blur-xl border border-border",
              "shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50",
              className
            )}
          >
            <div className="flex flex-col gap-2">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ==================== NavbarLogo ====================

export function NavbarLogo({ className }: NavbarLogoProps) {
  return (
    <a
      href="#hero"
      className={cn(
        "flex items-center justify-center",
        "hover:opacity-80 transition-opacity",
        className
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <User className="w-4 h-4 text-primary-foreground" />
      </div>
    </a>
  );
}

// ==================== NavbarButton ====================

export function NavbarButton({
  children,
  variant = "primary",
  onClick,
  className,
  href,
}: NavbarButtonProps) {
  const baseStyles = cn(
    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
    "whitespace-nowrap"
  );
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-surface-300 text-foreground hover:bg-surface-200 border border-border",
    ghost: "bg-transparent text-foreground hover:bg-surface-300",
  };

  const content = (
    <motion.span
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], className)}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick}>
      {content}
    </button>
  );
}