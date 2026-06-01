"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, 
  Coffee, 
  UtensilsCrossed, 
  Calculator, 
  TrendingUp, 
  Info, 
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import {
  calculate1RM,
  calculateRelativeStrength,
  generateRepTable,
  validateInput,
  getStrengthLevel,
  EXERCISES,
  type ExerciseType,
  type OneRMInput,
} from "@/lib/utils/fitnessMath";

// Playground types
type PlaygroundType = "oneRM" | "brew" | "food" | null;

// Playground data
const PLAYGROUNDS = [
  {
    id: "oneRM" as const,
    label: "1RM Calculator",
    icon: Dumbbell,
    color: "#3ecf8e",
    description: "Estimate your maximum single-rep lift",
  },
  {
    id: "brew" as const,
    label: "Brew Recipe",
    icon: Coffee,
    color: "#f59e0b",
    description: "Get coffee brewing recommendations",
  },
  {
    id: "food" as const,
    label: "Food Watch",
    icon: UtensilsCrossed,
    color: "#ef4444",
    description: "Explore Indonesian food prices",
  },
];

export function PlaygroundSection() {
  const [activePlayground, setActivePlayground] = useState<PlaygroundType>(null);

  return (
    <section
      id="playground"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-200"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Playground
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Interactive tools and calculators. Click an icon below to get started.
          </p>

          {/* Dock */}
          <TooltipProvider>
            <Dock direction="middle" className="mx-auto w-fit">
              {PLAYGROUNDS.map((playground) => {
                const Icon = playground.icon;
                return (
                  <DockIcon key={playground.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActivePlayground(playground.id)}
                          className={cn(
                            "size-full rounded-full flex items-center justify-center",
                            "bg-surface-200 border border-border",
                            "hover:border-primary/50 transition-all duration-300",
                            "group"
                          )}
                          style={{
                            "--accent-color": playground.color,
                          } as React.CSSProperties}
                        >
                          <Icon 
                            className="size-5 transition-colors duration-200"
                            style={{ color: playground.color }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="font-medium">{playground.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {playground.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>
                );
              })}
            </Dock>
          </TooltipProvider>
        </motion.div>

        {/* Privacy Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          🔒 All tools run locally in your browser. No data is stored or transmitted.
        </motion.p>
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
    </section>
  );
}

// ============================================
// 1RM Calculator Dialog
// ============================================
function OneRMDialog({ onClose }: { onClose: () => void }) {
  const [inputs, setInputs] = useState<OneRMInput>({
    bodyWeight: null,
    height: null,
    exercise: "bench_press",
    weightLifted: null,
    repetitions: null,
  });
  const [hasCalculated, setHasCalculated] = useState(false);

  const results = useMemo(() => {
    if (!inputs.weightLifted || !inputs.repetitions) return null;
    const validationError = validateInput(inputs);
    if (validationError) return null;

    const oneRMResult = calculate1RM(inputs.weightLifted, inputs.repetitions);
    const relativeStrength = inputs.bodyWeight
      ? calculateRelativeStrength(oneRMResult.oneRM, inputs.bodyWeight)
      : null;
    const strengthLevel = relativeStrength
      ? getStrengthLevel(inputs.exercise, relativeStrength, inputs.bodyWeight!)
      : null;

    return {
      ...oneRMResult,
      relativeStrength,
      strengthLevel,
      repTable: generateRepTable(oneRMResult.oneRM),
    };
  }, [inputs]);

  const handleNumberChange = useCallback(
    (field: keyof OneRMInput, value: string) => {
      const numValue = value === "" ? null : parseFloat(value);
      setInputs((prev) => ({ ...prev, [field]: numValue }));
      setHasCalculated(false);
    },
    []
  );

  const handleReset = useCallback(() => {
    setInputs({
      bodyWeight: null,
      height: null,
      exercise: "bench_press",
      weightLifted: null,
      repetitions: null,
    });
    setHasCalculated(false);
  }, []);

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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${PLAYGROUNDS[0].color}20` }}
            >
              <Dumbbell className="w-5 h-5" style={{ color: PLAYGROUNDS[0].color }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">One Rep Max Calculator</h3>
              <p className="text-sm text-muted-foreground">Estimate your maximum single-rep lift</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-200 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Body Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 75"
                    value={inputs.bodyWeight ?? ""}
                    onChange={(e) => handleNumberChange("bodyWeight", e.target.value)}
                    className="bg-surface-200 border-border mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Height (cm)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 175"
                    value={inputs.height ?? ""}
                    onChange={(e) => handleNumberChange("height", e.target.value)}
                    className="bg-surface-200 border-border mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Exercise</Label>
                <Select
                  value={inputs.exercise}
                  onValueChange={(v) => setInputs((p) => ({ ...p, exercise: v as ExerciseType }))}
                >
                  <SelectTrigger className="bg-surface-200 border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISES.map((ex) => (
                      <SelectItem key={ex.value} value={ex.value}>
                        {ex.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Weight Lifted (kg) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 80"
                    value={inputs.weightLifted ?? ""}
                    onChange={(e) => handleNumberChange("weightLifted", e.target.value)}
                    className="bg-surface-200 border-border mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Reps (1-30) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 8"
                    value={inputs.repetitions ?? ""}
                    onChange={(e) => handleNumberChange("repetitions", e.target.value)}
                    className="bg-surface-200 border-border mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setHasCalculated(true)}
                  disabled={!inputs.weightLifted || !inputs.repetitions}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-surface-100 rounded-xl p-4 border border-border">
              <AnimatePresence mode="wait">
                {!hasCalculated || !results ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center py-8"
                  >
                    <TrendingUp className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Enter data and calculate
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Estimated 1RM</p>
                      <p className="text-3xl font-bold text-foreground">
                        {results.oneRM} <span className="text-base font-normal">kg</span>
                      </p>
                      {results.relativeStrength && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {results.relativeStrength}× bodyweight
                          {results.strengthLevel && (
                            <span className={cn("ml-1 font-medium", results.strengthLevel.color)}>
                              • {results.strengthLevel.level}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">Weight Distribution</p>
                      <div className="grid grid-cols-4 gap-1">
                        {results.repTable.slice(0, 8).map((row) => (
                          <div
                            key={row.reps}
                            className={cn(
                              "p-1.5 rounded text-center text-xs",
                              "bg-surface-200 border border-border",
                              row.reps === 1 && "bg-primary/10 border-primary/30"
                            )}
                          >
                            <p className="text-muted-foreground">{row.reps}r</p>
                            <p className="font-semibold">{row.weight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Manual Brew Dialog (Coming Soon)
// ============================================
function BrewDialog({ onClose }: { onClose: () => void }) {
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
        className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${PLAYGROUNDS[1].color}20` }}
            >
              <Coffee className="w-5 h-5" style={{ color: PLAYGROUNDS[1].color }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Manual Brew Recommendation</h3>
              <p className="text-sm text-muted-foreground">Get brewing recipe suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-200 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Coming Soon Content */}
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-amber-500" />
          </div>
          <h4 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h4>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            This feature is under development. Get personalized coffee brewing recommendations 
            based on your bean profile.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Nusantara Food Dialog (Coming Soon)
// ============================================
function FoodDialog({ onClose }: { onClose: () => void }) {
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
        className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${PLAYGROUNDS[2].color}20` }}
            >
              <UtensilsCrossed className="w-5 h-5" style={{ color: PLAYGROUNDS[2].color }} />
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

        {/* Coming Soon Content */}
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-red-500" />
          </div>
          <h4 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h4>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            This feature is under development. Ask questions about Indonesian food prices 
            using natural language.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}