/**
 * Fitness Mathematics Utility
 * Pure functions for One Rep Max (1RM) calculations
 * 
 * Reference: NSCA (National Strength and Conditioning Association)
 */

// NSCA Percentage Coefficients for Repetition Matrix
// Maps rep count to percentage of 1RM
export const NSCA_COEFFICIENTS: readonly { reps: number; percentage: number }[] = [
  { reps: 1, percentage: 1.00 },
  { reps: 2, percentage: 0.95 },
  { reps: 3, percentage: 0.93 },
  { reps: 4, percentage: 0.90 },
  { reps: 5, percentage: 0.87 },
  { reps: 6, percentage: 0.85 },
  { reps: 7, percentage: 0.83 },
  { reps: 8, percentage: 0.80 },
  { reps: 9, percentage: 0.77 },
  { reps: 10, percentage: 0.75 },
  { reps: 11, percentage: 0.73 },
  { reps: 12, percentage: 0.70 },
] as const;

// Supported exercises
export const EXERCISES = [
  { value: "bench_press", label: "Bench Press" },
  { value: "squat", label: "Back Squat" },
  { value: "deadlift", label: "Deadlift" },
  { value: "overhead_press", label: "Overhead Press" },
  { value: "barbell_row", label: "Barbell Row" },
  { value: "leg_press", label: "Leg Press" },
] as const;

export type ExerciseType = (typeof EXERCISES)[number]["value"];

// Input validation types
export interface OneRMInput {
  bodyWeight: number | null;
  height: number | null;
  exercise: ExerciseType;
  weightLifted: number | null;
  repetitions: number | null;
}

export interface OneRMResult {
  oneRM: number;
  formula: "epley" | "brzycki";
  relativeStrength: number | null; // 1RM / bodyWeight ratio
}

export interface RepTableRow {
  reps: number;
  weight: number;
  percentage: number;
  percentageLabel: string;
}

/**
 * Calculate 1RM using Epley Formula
 * Best for reps > 5
 * Formula: 1RM = W × (1 + R/30)
 */
export function calculateEpley(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

/**
 * Calculate 1RM using Brzycki Formula
 * Best for reps ≤ 5
 * Formula: 1RM = W × (36 / (37 - R))
 */
export function calculateBrzycki(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0 || reps >= 37) return 0;
  return weight * (36 / (37 - reps));
}

/**
 * Calculate estimated 1RM using hybrid approach
 * Uses Brzycki for reps ≤ 5, Epley for reps > 5
 */
export function calculate1RM(weight: number, reps: number): OneRMResult {
  if (weight <= 0 || reps <= 0 || reps > 30) {
    return {
      oneRM: 0,
      formula: "epley",
      relativeStrength: null,
    };
  }

  const formula = reps <= 5 ? "brzycki" : "epley";
  const oneRM = formula === "brzycki" 
    ? calculateBrzycki(weight, reps) 
    : calculateEpley(weight, reps);

  return {
    oneRM: Math.round(oneRM * 10) / 10, // Round to 1 decimal
    formula,
    relativeStrength: null, // Will be calculated with body weight
  };
}

/**
 * Calculate relative strength (1RM / body weight ratio)
 */
export function calculateRelativeStrength(
  oneRM: number, 
  bodyWeight: number
): number | null {
  if (bodyWeight <= 0 || oneRM <= 0) return null;
  return Math.round((oneRM / bodyWeight) * 100) / 100;
}

/**
 * Generate repetition matrix table
 * Returns array of rep counts with corresponding weights
 */
export function generateRepTable(oneRM: number): RepTableRow[] {
  if (oneRM <= 0) return [];

  return NSCA_COEFFICIENTS.map(({ reps, percentage }) => ({
    reps,
    weight: Math.round(oneRM * percentage * 10) / 10,
    percentage,
    percentageLabel: `${Math.round(percentage * 100)}%`,
  }));
}

/**
 * Validate input values
 * Returns error message if invalid, null if valid
 */
export function validateInput(input: OneRMInput): string | null {
  if (!input.weightLifted || input.weightLifted <= 0) {
    return "Weight lifted must be greater than 0";
  }

  if (!input.repetitions || input.repetitions < 1 || input.repetitions > 30) {
    return "Repetitions must be between 1 and 30";
  }

  if (input.bodyWeight !== null && input.bodyWeight <= 0) {
    return "Body weight must be greater than 0";
  }

  if (input.height !== null && input.height <= 0) {
    return "Height must be greater than 0";
  }

  return null;
}

/**
 * Get strength level classification based on relative strength
 * Only for Squat, Bench, Deadlift
 */
export function getStrengthLevel(
  exercise: ExerciseType,
  relativeStrength: number,
  bodyWeight: number
): { level: string; color: string } | null {
  // Only classify compound lifts
  const classifiableExercises: ExerciseType[] = [
    "squat",
    "bench_press",
    "deadlift",
  ];

  if (!classifiableExercises.includes(exercise)) return null;

  // Simplified strength standards (intermediate ranges)
  const standards: Record<ExerciseType, { beginner: number; intermediate: number; advanced: number }> = {
    squat: { beginner: 0.75, intermediate: 1.25, advanced: 1.75 },
    bench_press: { beginner: 0.5, intermediate: 0.9, advanced: 1.3 },
    deadlift: { beginner: 1.0, intermediate: 1.5, advanced: 2.0 },
    overhead_press: { beginner: 0.4, intermediate: 0.65, advanced: 0.9 },
    barbell_row: { beginner: 0.5, intermediate: 0.85, advanced: 1.2 },
    leg_press: { beginner: 1.5, intermediate: 2.5, advanced: 3.5 },
  };

  const standard = standards[exercise];

  if (relativeStrength >= standard.advanced) {
    return { level: "Advanced", color: "text-green-500" };
  } else if (relativeStrength >= standard.intermediate) {
    return { level: "Intermediate", color: "text-yellow-500" };
  } else if (relativeStrength >= standard.beginner) {
    return { level: "Beginner", color: "text-blue-500" };
  } else {
    return { level: "Novice", color: "text-muted-foreground" };
  }
}