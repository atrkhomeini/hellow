"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, X, Search, Database, Sparkles } from "lucide-react";

const PLAYGROUND_COLOR = "#ef4444";

export function FoodDialog({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${PLAYGROUND_COLOR}20` }}
            >
              <UtensilsCrossed className="w-5 h-5" style={{ color: PLAYGROUND_COLOR }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Nusantara Food Watch</h3>
              <p className="text-sm text-muted-foreground">Explore Indonesian food prices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-200 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Coming Soon */}
        <div className="p-12 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${PLAYGROUND_COLOR}10` }}
          >
            <UtensilsCrossed className="w-8 h-8" style={{ color: PLAYGROUND_COLOR }} />
          </div>
          <h4 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h4>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Ask questions about Indonesian food prices using natural language. 
            Powered by Text-to-SQL technology.
          </p>
          
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-surface-200 border border-border">
              <Search className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Natural Language</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-200 border border-border">
              <Database className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Real Data</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-200 border border-border">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">AI Powered</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}