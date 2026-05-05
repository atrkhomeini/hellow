"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

// Supabase green glow color
const GLOW_COLOR = "#3ecf8e";

interface FitnessCardProps {
  title?: string;
  data: Record<string, string>;
  className?: string;
  glowColor?: string;
}

export function FitnessCard({ 
  title, 
  data, 
  className,
  glowColor = GLOW_COLOR 
}: FitnessCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}30, 0 0 60px ${glowColor}15, 0 0 100px ${glowColor}08`,
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        "transition-all duration-500 ease-out cursor-pointer group",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border group-hover:border-primary/20 transition-colors">
        <motion.div 
          className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"
          whileHover={{
            boxShadow: `0 0 20px ${glowColor}50`,
          }}
        >
          <Dumbbell className="w-5 h-5 text-green-500" />
        </motion.div>
        <h3 className="text-lg font-bold text-foreground">Fitness & Analytics</h3>
      </div>

      {/* 3D Model Embed */}
      <div className="aspect-video bg-surface-200 group-hover:bg-surface-300 transition-colors">
        <iframe
          title="The Barbell Squat Muscles & Anatomy"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          className="w-full h-full"
          src="https://sketchfab.com/models/11c53f93e3624519afb193ab34e35d01/embed?autostart=1&transparent=1&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_theme=dark"
        />
      </div>

      {/* Info Section */}
      <div className="p-5 space-y-3">
        {/* Exercise & PR */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Exercise</p>
            <p className="font-medium text-foreground">
              {data.favoriteExercise || data.exercise || "Barbell Squat"}
            </p>
          </div>
          {data.personalRecord && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Personal Record</p>
              <motion.p 
                className="font-bold text-lg"
                style={{ color: glowColor }}
                whileHover={{
                  textShadow: `0 0 20px ${glowColor}60`,
                }}
              >
                {data.personalRecord}
              </motion.p>
            </div>
          )}
        </div>

        {/* Quote */}
        {data.quote && (
          <p className="text-sm text-muted-foreground italic border-t border-border pt-3 group-hover:border-primary/20 transition-colors">
            "{data.quote}"
          </p>
        )}
      </div>
    </motion.div>
  );
}