import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update bean
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, roaster, origin, region, altitude, process, variety, tasteNotes, isActive } = body;

    const bean = await db.bean.update({
      where: { id },
      data: {
        name,
        roaster,
        origin,
        region,
        altitude,
        process,
        variety,
        tasteNotes: tasteNotes ? JSON.stringify(tasteNotes) : null,
        isActive,
      },
    });

    return NextResponse.json(bean);
  } catch (error) {
    console.error("Error updating bean:", error);
    return NextResponse.json(
      { error: "Failed to update bean" },
      { status: 500 }
    );
  }
}

// DELETE - Delete bean
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.bean.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Bean deleted" });
  } catch (error) {
    console.error("Error deleting bean:", error);
    return NextResponse.json(
      { error: "Failed to delete bean" },
      { status: 500 }
    );
  }
}