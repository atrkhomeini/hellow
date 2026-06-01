import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateSimilarityScore,
  isExactMatch,
  parseInstructions,
  type BeanInput,
  type RecipeWithMatch,
} from "@/lib/utils/brewMath";

// POST - Get recipe recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, method } = body as { userInput: BeanInput; method: string };

    if (!method) {
      return NextResponse.json(
        { error: "Brewing method is required" },
        { status: 400 }
      );
    }

    // Fetch all active beans with their recipes
    const beans = await db.bean.findMany({
      where: { isActive: true },
      include: {
        recipes: {
          include: {
            recipe: {
              where: {
                method: method,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (beans.length === 0) {
      return NextResponse.json(
        { error: "No beans available in database" },
        { status: 404 }
      );
    }

    // Calculate scores and find best matches
    const matches: RecipeWithMatch[] = [];

    for (const bean of beans) {
      const score = calculateSimilarityScore(userInput, bean);
      const exact = isExactMatch(userInput, bean);

      // Get recipes for this bean with matching method
      for (const beanRecipe of bean.recipes) {
        if (beanRecipe.recipe) {
          matches.push({
            id: beanRecipe.recipe.id,
            method: beanRecipe.recipe.method,
            doseGram: beanRecipe.recipe.doseGram,
            yieldGram: beanRecipe.recipe.yieldGram,
            temperatureC: beanRecipe.recipe.temperatureC,
            grindSize: beanRecipe.recipe.grindSize,
            totalTimeSec: beanRecipe.recipe.totalTimeSec,
            instructions: parseInstructions(beanRecipe.recipe.instructions),
            matchedBean: {
              id: bean.id,
              name: bean.name,
              roaster: bean.roaster,
            },
            matchScore: score,
            isExactMatch: exact,
          });
        }
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Return top match (or empty if no recipes found)
    const topMatch = matches[0];

    if (!topMatch) {
      return NextResponse.json(
        { error: `No recipes found for ${method} method` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      recommendation: topMatch,
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error("Error getting recommendation:", error);
    return NextResponse.json(
      { error: "Failed to get recommendation" },
      { status: 500 }
    );
  }
}