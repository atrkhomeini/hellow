import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch single taste item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const item = await db.tasteItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: item.id,
      title: item.title,
      category: item.category.toLowerCase(),
      description: item.description,
      content: item.content,
      embedUrl: item.embedUrl,
      imageUrl: item.imageUrl,
      order: item.order,
      isPublished: item.isPublished,
    });
  } catch (error) {
    console.error("Error fetching taste item:", error);
    return NextResponse.json(
      { error: "Failed to fetch taste item" },
      { status: 500 }
    );
  }
}

// PUT - Update taste item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, category, description, content, embedUrl, imageUrl, isPublished } = body;

    const item = await db.tasteItem.update({
      where: { id },
      data: {
        title,
        category: category?.toUpperCase(),
        description,
        content,
        embedUrl,
        imageUrl,
        isPublished,
      },
    });

    return NextResponse.json({
      id: item.id,
      title: item.title,
      category: item.category.toLowerCase(),
      description: item.description,
      content: item.content,
      embedUrl: item.embedUrl,
      imageUrl: item.imageUrl,
      order: item.order,
      isPublished: item.isPublished,
    });
  } catch (error) {
    console.error("Error updating taste item:", error);
    return NextResponse.json(
      { error: "Failed to update taste item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete taste item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await db.tasteItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting taste item:", error);
    return NextResponse.json(
      { error: "Failed to delete taste item" },
      { status: 500 }
    );
  }
}