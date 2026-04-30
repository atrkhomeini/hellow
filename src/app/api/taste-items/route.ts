import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all taste items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    where.isPublished = true;
    if (category) where.category = category.toUpperCase();

    const items = await db.tasteItem.findMany({
      where,
      orderBy: { order: "asc" },
    });

    // Transform to match frontend expectations
    const transformed = items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category.toLowerCase(),
      description: item.description,
      content: item.content,
      embedUrl: item.embedUrl,
      imageUrl: item.imageUrl,
      order: item.order,
      isPublished: item.isPublished,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching taste items:", error);
    return NextResponse.json(
      { error: "Failed to fetch taste items" },
      { status: 500 }
    );
  }
}

// POST - Create taste item (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, category, description, content, embedUrl, imageUrl, isPublished } = body;

    // Get max order
    const maxOrder = await db.tasteItem.aggregate({
      _max: { order: true },
    });

    const item = await db.tasteItem.create({
      data: {
        title,
        category: (category || "music").toUpperCase(),
        description,
        content,
        embedUrl,
        imageUrl,
        order: (maxOrder._max.order || 0) + 1,
        isPublished: isPublished !== undefined ? isPublished : true,
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
    console.error("Error creating taste item:", error);
    return NextResponse.json(
      { error: "Failed to create taste item" },
      { status: 500 }
    );
  }
}

// PUT - Update taste item (requires auth)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, category, description, content, embedUrl, imageUrl, isPublished } = body;

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

// DELETE - Delete taste item (requires auth)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID required" },
        { status: 400 }
      );
    }

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