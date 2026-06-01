"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Calculator, 
  TrendingUp, 
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
  calculate1RM,
  calculateRelativeStrength,
  generateRepTable,
  validateInput,
  getStrengthLevel,
  EXERCISES,
  type ExerciseType,
  type OneRMInput,
} from "@/lib/utils/fitnessMath";

const PLAYGROUND_COLOR = "#3ecf8e";

export function OneRMDialog({ onClose }: { onClose: () => void }) {
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
              style={{ backgroundColor: `${PLAYGROUND_COLOR}20` }}
            >
              <Dumbbell className="w-5 h-5" style={{ color: PLAYGROUND_COLOR }} />
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

              <p className="text-xs text-muted-foreground">
                Uses hybrid formula: Brzycki (reps ≤ 5) / Epley (reps &gt; 5)
              </p>
            </div>

            {/* Results */}
            <div className="bg-surface-100 rounded-xl p-4 border border-border min-h-[280px]">
              {!hasCalculated || !results ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <TrendingUp className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Enter data and calculate
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Formula: {results.formula === "epley" ? "Epley" : "Brzycki"}
                    </p>
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-100">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Privacy First: All calculations run locally. No data is stored or transmitted.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}