/*Ensure you have installed the package
or read our installation document. (go to lightswind.com/components/Installation)
npm i lightswind@latest*/

"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

function useDockItemSize(
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>,
  baseItemSize: number,
  magnification: number,
  distance: number,
  ref: React.RefObject<HTMLDivElement | null>,
  spring: { mass: number; stiffness: number; damping: number },
  position: "bottom" | "left"
) {
  const mouseDistance = useTransform(
    position === "left" ? [mouseX, mouseY] : [mouseX],
    (values) => {
      if (position === "left") {
        const [x, y] = values as [number, number];
        if (typeof x !== "number" || typeof y !== "number" || isNaN(x) || isNaN(y)) return 0;
        const rect = ref.current?.getBoundingClientRect() ?? { y: 0, height: baseItemSize };
        return y - rect.y - baseItemSize / 2;
      } else {
        const val = values[0] as number;
        if (typeof val !== "number" || isNaN(val)) return 0;
        const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
        return val - rect.x - baseItemSize / 2;
      }
    }
  );

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );

  return useSpring(targetSize, spring);
}

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  baseItemSize: number;
  magnification: number;
  distance: number;
  spring: { mass: number; stiffness: number; damping: number };
  badgeCount?: number;
  position: "bottom" | "left";
}

function DockItem({
  icon,
  label,
  onClick,
  mouseX,
  mouseY,
  baseItemSize,
  magnification,
  distance,
  spring,
  badgeCount,
  position,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const size = useDockItemSize(
    mouseX,
    mouseY,
    baseItemSize,
    magnification,
    distance,
    ref,
    spring,
    position
  );
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (value) =>
      setShowLabel(value === 1)
    );
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className="relative inline-flex items-center justify-center rounded-full bg-background shadow-md cursor-pointer hover:bg-surface-200 transition-colors"
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={label}
    >
      <div className="flex items-center justify-center">{icon}</div>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, x: position === "left" ? 0 : 0, y: position === "left" ? 0 : 0 }}
            animate={{ 
              opacity: 1, 
              x: position === "left" ? 10 : 0, 
              y: position === "left" ? 0 : -10 
            }}
            exit={{ opacity: 0, x: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute w-fit whitespace-pre rounded-md",
              "border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-lg",
              position === "left" 
                ? "left-full top-1/2 -translate-y-1/2 ml-3" 
                : "left-1/2 -translate-x-1/2 -top-8"
            )}
            role="tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badgeCount?: number;
}

interface DockProps {
  items: DockItemData[];
  className?: string;
  spring?: { mass: number; stiffness: number; damping: number };
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  panelWidth?: number;
  dockHeight?: number;
  dockWidth?: number;
  baseItemSize?: number;
  position?: "bottom" | "left";
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  panelWidth = 64,
  dockHeight = 256,
  dockWidth = 256,
  baseItemSize = 50,
  position = "bottom",
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxSize = useMemo(
    () => Math.max(
      position === "left" ? dockWidth : dockHeight, 
      magnification + magnification / 2 + 4
    ),
    [magnification, dockHeight, dockWidth, position]
  );

  const animatedSize = useSpring(
    useTransform(isHovered, [0, 1], [
      position === "left" ? panelWidth : panelHeight, 
      maxSize
    ]),
    spring
  );

  return (
    <motion.div
      style={position === "left" 
        ? { width: animatedSize } 
        : { height: animatedSize }
      }
      className={cn(
        "flex items-center",
        position === "left" ? "h-full flex-col" : "w-full"
      )}
    >
      <motion.div
        onMouseMove={(e) => {
          isHovered.set(1);
          mouseX.set(e.clientX);
          mouseY.set(e.clientY);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
          mouseY.set(Infinity);
        }}
        className={cn(
          "flex w-fit rounded-2xl",
          "border-2 border-border bg-background/80 backdrop-blur-xl shadow-lg",
          className
        )}
        style={position === "left" 
          ? { height: "auto", minHeight: panelHeight, width: panelWidth, flexDirection: "column", padding: "16px 8px", gap: "16px" }
          : { height: panelHeight, flexDirection: "row", padding: "8px 16px", gap: "16px" }
        }
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            mouseX={mouseX}
            mouseY={mouseY}
            baseItemSize={baseItemSize}
            magnification={magnification}
            distance={distance}
            spring={spring}
            badgeCount={item.badgeCount}
            position={position}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Helper function for cn (if not imported)
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}