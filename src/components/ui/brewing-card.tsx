"use client";

import { motion } from "framer-motion";
import { Coffee, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrewingCardProps {
  title?: string;
  data: Record<string, string>;
  className?: string;
}

export function BrewingCard({ title, data, className }: BrewingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        "hover:border-primary/30 transition-colors",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Coffee className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Currently Brewing</h3>
      </div>

      {/* 3D Model Embed */}
      <div className="aspect-video bg-surface-200">
        <iframe
          title="Vigor Dripper Coffee Mug Set CZ-04E"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          className="w-full h-full"
          src="https://sketchfab.com/models/365942cad43f47e894a138963bf61786/embed?autostart=1&ui_theme=dark"
        />
      </div>

      {/* Info Section */}
      <div className="p-5 space-y-3">
        {/* Gear & Regional */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Gear</p>
            <p className="font-medium text-foreground">
              {data.gear || "V60 Dripper"}
            </p>
          </div>
          {data.regional && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Regional</p>
              <p className="font-medium text-foreground">
                {data.regional}
              </p>
            </div>
          )}
        </div>

        {/* Favorite Beans + Purchase Link */}
        {(data.favoriteBeans || data.purchaseLink) && (
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Favorite Beans Recently</p>
                <p className="text-sm text-foreground truncate">
                  {data.favoriteBeans || "—"}
                </p>
              </div>
              {data.purchaseLink && (
                <a
                  href={data.purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    "text-xs font-medium",
                    "bg-primary/10 text-primary hover:bg-primary/20",
                    "transition-colors flex-shrink-0"
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buy
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}