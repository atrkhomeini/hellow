"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Coffee, 
  X, 
  Search, 
  RotateCcw,
  Thermometer,
  Clock,
  Scale,
  Droplets,
  Sparkles,
  Info,
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
  BREW_METHODS,
  getGrindSizeLabel,
  formatTime,
  type BeanInput,
  type RecipeWithMatch,
  type InstructionStep,
} from "@/lib/utils/brewMath";

const PLAYGROUND_COLOR = "#f59e0b";

interface RecommendationResult {
  recommendation: RecipeWithMatch;
  totalMatches: number;
}

export function BrewDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<BeanInput>({
    name: "",
    roaster: "",
    origin: "",
    region: "",
    altitude: undefined,
    process: "",
    variety: "",
    tasteNotes: [],
  });
  const [tasteNotesInput, setTasteNotesInput] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form field changes
  const handleChange = useCallback((field: keyof BeanInput, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // Handle taste notes (comma-separated input)
  const handleTasteNotesChange = useCallback((value: string) => {
    setTasteNotesInput(value);
    const notes = value.split(",").map((n) => n.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tasteNotes: notes }));
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setFormData({
      name: "",
      roaster: "",
      origin: "",
      region: "",
      altitude: undefined,
      process: "",
      variety: "",
      tasteNotes: [],
    });
    setTasteNotesInput("");
    setSelectedMethod("");
    setResult(null);
    setError(null);
  }, []);

  // Submit recommendation request
  const handleSubmit = useCallback(async () => {
    if (!selectedMethod) {
      setError("Please select a brewing method");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/brew-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: formData,
          method: selectedMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get recommendation");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedMethod]);

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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${PLAYGROUND_COLOR}20` }}
            >
              <Coffee className="w-5 h-5" style={{ color: PLAYGROUND_COLOR }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Brew Recommendation</h3>
              <p className="text-sm text-muted-foreground">Get personalized brewing recipes</p>
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
          {!result ? (
            <div className="space-y-6">
              {/* Method Selection */}
              <div>
                <Label className="text-sm font-medium">Brewing Method *</Label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger className="bg-surface-200 border-border mt-1.5">
                    <SelectValue placeholder="Select your brewing method" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREW_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bean Profile Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Bean Name / Blend</Label>
                  <Input
                    placeholder="e.g., Ethiopia Yirgacheffe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Roaster</Label>
                  <Input
                    placeholder="e.g., Blue Bottle"
                    value={formData.roaster || ""}
                    onChange={(e) => handleChange("roaster", e.target.value)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Origin (Country)</Label>
                  <Input
                    placeholder="e.g., Ethiopia"
                    value={formData.origin || ""}
                    onChange={(e) => handleChange("origin", e.target.value)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Region</Label>
                  <Input
                    placeholder="e.g., Yirgacheffe"
                    value={formData.region || ""}
                    onChange={(e) => handleChange("region", e.target.value)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Altitude (m)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1800"
                    value={formData.altitude || ""}
                    onChange={(e) => handleChange("altitude", e.target.value ? parseInt(e.target.value) : undefined)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Process</Label>
                  <Select
                    value={formData.process || ""}
                    onValueChange={(v) => handleChange("process", v)}
                  >
                    <SelectTrigger className="bg-surface-200 border-border mt-1.5">
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="washed">Washed</SelectItem>
                      <SelectItem value="honey">Honey</SelectItem>
                      <SelectItem value="anaerobic">Anaerobic</SelectItem>
                      <SelectItem value="wet-hulled">Wet-Hulled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Variety</Label>
                  <Input
                    placeholder="e.g., Typica, Bourbon"
                    value={formData.variety || ""}
                    onChange={(e) => handleChange("variety", e.target.value)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Taste Notes (comma-separated)</Label>
                  <Input
                    placeholder="e.g., citrus, floral, berry"
                    value={tasteNotesInput}
                    onChange={(e) => handleTasteNotesChange(e.target.value)}
                    className="bg-surface-200 border-border mt-1.5"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedMethod}
                  className="flex-1"
                  style={{ backgroundColor: PLAYGROUND_COLOR }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Search className="w-4 h-4 mr-2" />
                      </motion.div>
                      Finding Recipe...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Recommendation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Result Display */
            <div className="space-y-6">
              {/* Match Info */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-100 border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Matched Bean</p>
                  <p className="font-semibold text-foreground">
                    {result.recommendation.matchedBean.name}
                    {result.recommendation.matchedBean.roaster && (
                      <span className="text-muted-foreground font-normal">
                        {" "}by {result.recommendation.matchedBean.roaster}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Match Score</p>
                  <p className="font-bold text-xl" style={{ color: PLAYGROUND_COLOR }}>
                    {Math.round(result.recommendation.matchScore * 100)}%
                  </p>
                </div>
              </div>

              {/* Exact Match Badge */}
              {result.recommendation.isExactMatch && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <Info className="w-4 h-4" />
                  Exact match found! This recipe is specifically for this bean profile.
                </div>
              )}

              {/* Recipe Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-surface-100 border border-border text-center">
                  <Scale className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">
                    {result.recommendation.doseGram}g
                  </p>
                  <p className="text-xs text-muted-foreground">Dose</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-100 border border-border text-center">
                  <Droplets className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">
                    {result.recommendation.yieldGram}g
                  </p>
                  <p className="text-xs text-muted-foreground">Yield</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-100 border border-border text-center">
                  <Thermometer className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">
                    {result.recommendation.temperatureC}°C
                  </p>
                  <p className="text-xs text-muted-foreground">Temp</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-100 border border-border text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">
                    {formatTime(result.recommendation.totalTimeSec)}
                  </p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>

              {/* Grind Size */}
              <div className="p-4 rounded-xl bg-surface-100 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Grind Size</p>
                <p className="font-semibold text-foreground">
                  {getGrindSizeLabel(result.recommendation.grindSize)}
                </p>
              </div>

              {/* Instructions */}
              {result.recommendation.instructions && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Brewing Steps</p>
                  <div className="space-y-2">
                    {result.recommendation.instructions.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-surface-100 border border-border"
                      >
                        <span 
                          className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                          style={{ backgroundColor: `${PLAYGROUND_COLOR}20`, color: PLAYGROUND_COLOR }}
                        >
                          {step.step}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{step.action}</p>
                          {step.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {formatTime(step.duration)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <Button
                variant="outline"
                onClick={() => setResult(null)}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Another Recommendation
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-100">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Privacy First: Calculations run locally. No bean data is stored.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}