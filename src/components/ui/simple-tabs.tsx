"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  value: string;
}

interface SimpleTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function SimpleTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: SimpleTabsProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-1 p-1 rounded-full",
        "bg-surface-300 border border-border",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-colors",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
