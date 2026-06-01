"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Dumbbell, Coffee, UtensilsCrossed } from "lucide-react";
import Dock from "@/components/ui/dock";
import { OneRMDialog } from "./one-rm-dialog";
import { BrewDialog } from "./brew-dialog";
import { FoodDialog } from "./food-dialog";

type PlaygroundType = "oneRM" | "brew" | "food" | null;

const PLAYGROUNDS = [
  {
    id: "oneRM" as const,
    label: "1RM Calculator",
    icon: <Dumbbell className="w-5 h-5" style={{ color: "#3ecf8e" }} />,
  },
  {
    id: "brew" as const,
    label: "Brew Recipe",
    icon: <Coffee className="w-5 h-5" style={{ color: "#f59e0b" }} />,
  },
  {
    id: "food" as const,
    label: "Food Watch",
    icon: <UtensilsCrossed className="w-5 h-5" style={{ color: "#ef4444" }} />,
  },
];

export function DockBar() {
  const [activePlayground, setActivePlayground] = useState<PlaygroundType>(null);

  const dockItems = PLAYGROUNDS.map((p) => ({
    icon: p.icon,
    label: p.label,
    onClick: () => setActivePlayground(p.id),
  }));

  return (
    <>
      {/* Fixed Left Dock */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex items-center">
        <Dock
          items={dockItems}
          position="left"
          magnification={56}
          baseItemSize={44}
          distance={120}
          panelWidth={56}
          dockWidth={72}
        />
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {activePlayground === "oneRM" && (
          <OneRMDialog onClose={() => setActivePlayground(null)} />
        )}
        {activePlayground === "brew" && (
          <BrewDialog onClose={() => setActivePlayground(null)} />
        )}
        {activePlayground === "food" && (
          <FoodDialog onClose={() => setActivePlayground(null)} />
        )}
      </AnimatePresence>
    </>
  );
}