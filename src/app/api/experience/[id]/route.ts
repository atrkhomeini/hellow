import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update experience
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
    const {
      title,
      company,
      startDate,
      endDate,
      isCurrent,
      description,
      isPublished,
      externalLinks,
      mediaUrls,
    } = body;

    // Convert arrays to JSON strings or null for Prisma
    const externalLinksValue = externalLinks 
      ? (Array.isArray(externalLinks) 
          ? (externalLinks.length > 0 ? JSON.stringify(externalLinks) : null)
          : externalLinks)
      : null;
    
    const mediaUrlsValue = mediaUrls
      ? (Array.isArray(mediaUrls)
          ? (mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null)
          : mediaUrls)
      : null;

    const experience = await db.experience.update({
      where: { id },
      data: {
        title,
        company,
        startDate,
        endDate: endDate || null,
        isCurrent,
        description,
        isPublished,
        externalLinks: externalLinksValue,
        mediaUrls: mediaUrlsValue,
      },
    });

    return NextResponse.json({
      id: experience.id,
      title: experience.title,
      company: experience.company,
      companyLogo: experience.companyLogo,
      startDate: experience.startDate,
      endDate: experience.endDate,
      isCurrent: experience.isCurrent,
      description: experience.description,
      mediaUrls: experience.mediaUrls ? JSON.parse(experience.mediaUrls) : [],
      externalLinks: experience.externalLinks ? JSON.parse(experience.externalLinks) : [],
      order: experience.order,
      isPublished: experience.isPublished,
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE - Delete experience
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

    await db.experience.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Experience deleted" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}