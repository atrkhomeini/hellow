import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all recipes
export async function GET() {
  try {
    const recipes = await db.recipe.findMany({
      where: { isActive: true },
      include: {
        beans: {
          include: {
            bean: true,
          },
        },
      },
      orderBy: { method: "asc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST - Create new recipe (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      method, 
      doseGram, 
      yieldGram, 
      temperatureC, 
      grindSize, 
      totalTimeSec, 
      instructions,
      beanIds 
    } = body;

    const recipe = await db.recipe.create({
      data: {
        method,
        doseGram,
        yieldGram,
        temperatureC,
        grindSize,
        totalTimeSec,
        instructions: instructions ? JSON.stringify(instructions) : null,
        beans: beanIds ? {
          create: beanIds.map((id: string) => ({
            beanId: id,
          })),
        } : undefined,
      },
      include: {
        beans: {
          include: {
            bean: true,
          },
        },
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}