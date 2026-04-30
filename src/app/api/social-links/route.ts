import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all social links
export async function GET() {
  try {
    const links = await db.socialLink.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });

    // Transform to match frontend expectations
    const transformed = links.map(link => ({
      id: link.id,
      platform: link.platform.toLowerCase(),
      url: link.url,
      icon: link.icon,
      order: link.order,
      isPublished: link.isPublished,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json(
      { error: "Failed to fetch social links" },
      { status: 500 }
    );
  }
}

// POST - Create social link (requires auth)
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
    const { platform, url, icon, isPublished } = body;

    // Get max order
    const maxOrder = await db.socialLink.aggregate({
      _max: { order: true },
    });

    const link = await db.socialLink.create({
      data: {
        platform: platform.toUpperCase(),
        url,
        icon,
        order: (maxOrder._max.order || 0) + 1,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    });

    return NextResponse.json({
      id: link.id,
      platform: link.platform.toLowerCase(),
      url: link.url,
      icon: link.icon,
      order: link.order,
      isPublished: link.isPublished,
    });
  } catch (error) {
    console.error("Error creating social link:", error);
    return NextResponse.json(
      { error: "Failed to create social link" },
      { status: 500 }
    );
  }
}

// PUT - Update social link (requires auth)
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
    const { id, platform, url, icon, isPublished } = body;

    const link = await db.socialLink.update({
      where: { id },
      data: {
        platform: platform?.toUpperCase(),
        url,
        icon,
        isPublished,
      },
    });

    return NextResponse.json({
      id: link.id,
      platform: link.platform.toLowerCase(),
      url: link.url,
      icon: link.icon,
      order: link.order,
      isPublished: link.isPublished,
    });
  } catch (error) {
    console.error("Error updating social link:", error);
    return NextResponse.json(
      { error: "Failed to update social link" },
      { status: 500 }
    );
  }
}

// DELETE - Delete social link (requires auth)
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
        { error: "Link ID required" },
        { status: 400 }
      );
    }

    await db.socialLink.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Link deleted" });
  } catch (error) {
    console.error("Error deleting social link:", error);
    return NextResponse.json(
      { error: "Failed to delete social link" },
      { status: 500 }
    );
  }
}