import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all experiences
export async function GET() {
  try {
    const experiences = await db.experience.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });

    // Transform to match frontend expectations
    const transformed = experiences.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      companyLogo: exp.companyLogo,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      description: exp.description,
      mediaUrls: exp.mediaUrls ? JSON.parse(exp.mediaUrls) : [],
      externalLinks: exp.externalLinks ? JSON.parse(exp.externalLinks) : [],
      order: exp.order,
      isPublished: exp.isPublished,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

// POST - Create experience (requires auth)
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
    const {
      title,
      company,
      companyLogo,
      startDate,
      endDate,
      isCurrent,
      description,
      mediaUrls,
      externalLinks,
    } = body;

    // Get max order
    const maxOrder = await db.experience.aggregate({
      _max: { order: true },
    });

    const experience = await db.experience.create({
      data: {
        title,
        company,
        companyLogo,
        startDate,
        endDate,
        isCurrent: isCurrent || false,
        description,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        externalLinks: externalLinks ? JSON.stringify(externalLinks) : null,
        order: (maxOrder._max.order || 0) + 1,
        isPublished: true,
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
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}

// PUT - Update experience (requires auth)
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
    
    // Check if it's a reorder request
    if (body.experiences) {
      const { experiences } = body as { experiences: { id: string; order: number }[] };

      const updates = experiences.map((exp) =>
        db.experience.update({
          where: { id: exp.id },
          data: { order: exp.order },
        })
      );

      await Promise.all(updates);

      return NextResponse.json({ message: "Order updated" });
    }
    
    // Otherwise, update a single experience
    const { id, title, company, companyLogo, startDate, endDate, isCurrent, description, mediaUrls, externalLinks, isPublished } = body;
    
    const experience = await db.experience.update({
      where: { id },
      data: {
        title,
        company,
        companyLogo,
        startDate,
        endDate,
        isCurrent,
        description,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        externalLinks: externalLinks ? JSON.stringify(externalLinks) : null,
        isPublished,
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