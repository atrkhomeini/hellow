import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all beans
export async function GET() {
  try {
    const beans = await db.bean.findMany({
      where: { isActive: true },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(beans);
  } catch (error) {
    console.error("Error fetching beans:", error);
    return NextResponse.json(
      { error: "Failed to fetch beans" },
      { status: 500 }
    );
  }
}

// POST - Create new bean (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, roaster, origin, region, altitude, process, variety, tasteNotes } = body;

    const bean = await db.bean.create({
      data: {
        name,
        roaster,
        origin,
        region,
        altitude,
        process,
        variety,
        tasteNotes: tasteNotes ? JSON.stringify(tasteNotes) : null,
      },
    });

    return NextResponse.json(bean);
  } catch (error) {
    console.error("Error creating bean:", error);
    return NextResponse.json(
      { error: "Failed to create bean" },
      { status: 500 }
    );
  }
}