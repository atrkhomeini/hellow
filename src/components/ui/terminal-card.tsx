"use client";

import { motion } from "framer-motion";
import { Terminal } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";
import { Coffee, Dumbbell } from "lucide-react";

interface TerminalCardProps {
  title: string;
  category: "brewing" | "fitness";
  data: Record<string, string>;
  quote?: string;
  className?: string;
}

export function TerminalCard({
  title,
  category,
  data,
  quote,
  className,
}: TerminalCardProps) {
  // Generate commands from structured data
  const commands: string[] = [];
  const outputs: Record<number, string[]> = {};

  Object.entries(data).forEach(([key, value], index) => {
    if (key === "quote") return; // Handle quote separately
    
    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    commands.push(`get ${key.toLowerCase()}`);
    outputs[index] = [`→ ${value}`];
  });

  // Add quote as final command
  if (quote) {
    const quoteIndex = commands.length;
    commands.push(`echo "${quote}"`);
    outputs[quoteIndex] = [quote];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("relative", className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            category === "brewing" ? "bg-amber-500/20" : "bg-green-500/20"
          )}
        >
          {category === "brewing" ? (
            <Coffee className="w-5 h-5 text-amber-500" />
          ) : (
            <Dumbbell className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {category === "brewing" ? "Currently Brewing" : "Fitness & Analytics"}
          </h3>
          {title && (
            <p className="text-sm text-muted-foreground">{title}</p>
          )}
        </div>
      </div>

      {/* Terminal */}
      <Terminal
        commands={commands}
        outputs={outputs}
        username={category === "brewing" ? "brew" : "fitness"}
        typingSpeed={30}
        delayBetweenCommands={400}
        initialDelay={300}
        enableSound={false}
        className="max-w-none"
      />
    </motion.div>
  );
}