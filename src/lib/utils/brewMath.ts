/**
 * Brewing Recommendation Mathematics
 * Weighted Similarity Scoring Algorithm
 */

// Weight configuration for each parameter
export const WEIGHTS = {
  process: 0.30,      // Most important - affects extraction significantly
  region: 0.20,       // Terroir influence
  altitude: 0.15,     // Density and flavor development
  variety: 0.15,      // Genetic flavor potential
  tasteNotes: 0.10,   // Flavor profile matching
  origin: 0.10,       // General origin characteristics
} as const;

// Altitude range for proximity calculation (in meters)
const ALTITUDE_MAX_RANGE = 1000; // 1000m difference = 0 similarity

// Supported brew methods
export const BREW_METHODS = [
  { value: "v60", label: "V60" },
  { value: "kalita", label: "Kalita Wave" },
  { value: "aeropress", label: "Aeropress" },
  { value: "french_press", label: "French Press" },
  { value: "chemex", label: "Chemex" },
  { value: "switch", label: "Hario Switch" },
  { value: "clever", label: "Clever Dripper" },
  { value: "espresso", label: "Espresso" },
] as const;

export type BrewMethod = (typeof BREW_METHODS)[number]["value"];

// Input interface for recommendation
export interface BeanInput {
  name?: string;
  roaster?: string;
  origin?: string;
  region?: string;
  altitude?: number;
  process?: string;
  variety?: string;
  tasteNotes?: string[];
}

// Bean from database
export interface BeanData {
  id: string;
  name: string;
  roaster: string | null;
  origin: string | null;
  region: string | null;
  altitude: number | null;
  process: string | null;
  variety: string | null;
  tasteNotes: string | null;
}

// Recipe with matched bean info
export interface RecipeWithMatch {
  id: string;
  method: string;
  doseGram: number;
  yieldGram: number;
  temperatureC: number;
  grindSize: string;
  totalTimeSec: number;
  instructions: InstructionStep[] | null;
  matchedBean: {
    id: string;
    name: string;
    roaster: string | null;
  };
  matchScore: number;
  isExactMatch: boolean;
}

export interface InstructionStep {
  step: number;
  action: string;
  duration?: number;
}

/**
 * Calculate altitude proximity score (0 to 1)
 * Uses linear interpolation within max range
 */
export function calculateAltitudeScore(
  userAltitude: number | undefined,
  beanAltitude: number | null
): number {
  if (!userAltitude || !beanAltitude) return 0;
  
  const diff = Math.abs(userAltitude - beanAltitude);
  if (diff >= ALTITUDE_MAX_RANGE) return 0;
  
  return 1 - (diff / ALTITUDE_MAX_RANGE);
}

/**
 * Calculate taste notes similarity score (0 to 1)
 * Uses Jaccard similarity: intersection / union
 */
export function calculateTasteNotesScore(
  userNotes: string[] | undefined,
  beanNotes: string[] | null
): number {
  if (!userNotes || !beanNotes || beanNotes.length === 0) return 0;
  if (userNotes.length === 0) return 0;

  const normalizedUser = userNotes.map(n => n.toLowerCase().trim());
  const normalizedBean = beanNotes.map(n => n.toLowerCase().trim());

  const intersection = normalizedUser.filter(n => normalizedBean.includes(n));
  const union = [...new Set([...normalizedUser, ...normalizedBean])];

  return union.length > 0 ? intersection.length / union.length : 0;
}

/**
 * Calculate boolean match score (0 or 1)
 */
export function calculateBooleanScore(
  userValue: string | undefined,
  beanValue: string | null
): number {
  if (!userValue || !beanValue) return 0;
  return userValue.toLowerCase() === beanValue.toLowerCase() ? 1 : 0;
}

/**
 * Calculate total weighted similarity score
 * Returns score between 0 and 1
 */
export function calculateSimilarityScore(
  userInput: BeanInput,
  beanData: BeanData
): number {
  const scores = {
    process: calculateBooleanScore(userInput.process, beanData.process),
    region: calculateBooleanScore(userInput.region, beanData.region),
    altitude: calculateAltitudeScore(userInput.altitude, beanData.altitude),
    variety: calculateBooleanScore(userInput.variety, beanData.variety),
    tasteNotes: calculateTasteNotesScore(
      userInput.tasteNotes,
      beanData.tasteNotes ? JSON.parse(beanData.tasteNotes) : null
    ),
    origin: calculateBooleanScore(userInput.origin, beanData.origin),
  };

  // Calculate weighted sum
  const totalScore = 
    scores.process * WEIGHTS.process +
    scores.region * WEIGHTS.region +
    scores.altitude * WEIGHTS.altitude +
    scores.variety * WEIGHTS.variety +
    scores.tasteNotes * WEIGHTS.tasteNotes +
    scores.origin * WEIGHTS.origin;

  return totalScore;
}

/**
 * Check if match is exact (all provided fields match)
 */
export function isExactMatch(
  userInput: BeanInput,
  beanData: BeanData
): boolean {
  const fieldsToCheck: (keyof BeanInput)[] = [
    'process', 'region', 'variety', 'origin'
  ];

  for (const field of fieldsToCheck) {
    if (userInput[field] && beanData[field]) {
      if (userInput[field]!.toLowerCase() !== (beanData[field] as string).toLowerCase()) {
        return false;
      }
    }
  }

  // Check altitude (allow 100m tolerance)
  if (userInput.altitude && beanData.altitude) {
    if (Math.abs(userInput.altitude - beanData.altitude) > 100) {
      return false;
    }
  }

  // Check taste notes
  if (userInput.tasteNotes && beanData.tasteNotes) {
    const beanNotes = JSON.parse(beanData.tasteNotes) as string[];
    const normalizedUser = userInput.tasteNotes.map(n => n.toLowerCase()).sort();
    const normalizedBean = beanNotes.map(n => n.toLowerCase()).sort();
    if (JSON.stringify(normalizedUser) !== JSON.stringify(normalizedBean)) {
      return false;
    }
  }

  return true;
}

/**
 * Parse instructions from JSON string
 */
export function parseInstructions(
  instructionsJson: string | null
): InstructionStep[] | null {
  if (!instructionsJson) return null;
  try {
    return JSON.parse(instructionsJson);
  } catch {
    return null;
  }
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get grind size display label
 */
export function getGrindSizeLabel(size: string): string {
  const labels: Record<string, string> = {
    "extra_fine": "Extra Fine (Espresso)",
    "fine": "Fine (Moka Pot)",
    "medium_fine": "Medium Fine (Pour Over)",
    "medium": "Medium (Drip)",
    "medium_coarse": "Medium Coarse (Chemex)",
    "coarse": "Coarse (French Press)",
    "extra_coarse": "Extra Coarse (Cold Brew)",
  };
  return labels[size] || size;
}