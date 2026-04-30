import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    where.isPublished = true;
    if (category) where.category = category.toUpperCase();

    const projects = await db.project.findMany({
      where,
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: { order: "asc" },
    });

    // Transform to match frontend expectations
    const transformed = projects.map(proj => ({
      id: proj.id,
      title: proj.title,
      description: proj.description,
      category: proj.category.toLowerCase(),
      imageUrl: proj.imageUrl,
      mediaUrls: proj.mediaUrls ? JSON.parse(proj.mediaUrls) : [],
      projectUrl: proj.projectUrl,
      githubUrl: proj.githubUrl,
      order: proj.order,
      isPublished: proj.isPublished,
      skills: proj.skills.map(ps => ({
        id: ps.skill.id,
        name: ps.skill.name,
        category: ps.skill.category.toLowerCase(),
        iconName: ps.skill.iconName,
        color: ps.skill.color,
      }))
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create project (requires auth)
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
      description,
      category,
      imageUrl,
      mediaUrls,
      projectUrl,
      githubUrl,
      skillIds,
    } = body;

    // Get max order
    const maxOrder = await db.project.aggregate({
      _max: { order: true },
    });

    const project = await db.project.create({
      data: {
        title,
        description,
        category: (category || "past").toUpperCase(),
        imageUrl,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        projectUrl,
        githubUrl,
        order: (maxOrder._max.order || 0) + 1,
        isPublished: true,
      },
    });

    // Link skills if provided
    if (skillIds && skillIds.length > 0) {
      await db.projectSkill.createMany({
        data: skillIds.map((skillId: string) => ({
          projectId: project.id,
          skillId,
        })),
      });
    }

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category.toLowerCase(),
      imageUrl: project.imageUrl,
      mediaUrls: project.mediaUrls ? JSON.parse(project.mediaUrls) : [],
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      order: project.order,
      isPublished: project.isPublished,
      skills: [],
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// PUT - Update project (requires auth)
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
    if (body.projects) {
      const { projects } = body as { projects: { id: string; order: number }[] };

      const updates = projects.map((proj) =>
        db.project.update({
          where: { id: proj.id },
          data: { order: proj.order },
        })
      );

      await Promise.all(updates);

      return NextResponse.json({ message: "Order updated" });
    }
    
    // Otherwise, update a single project
    const { id, title, description, category, imageUrl, mediaUrls, projectUrl, githubUrl, isPublished, skillIds } = body;
    
    const project = await db.project.update({
      where: { id },
      data: {
        title,
        description,
        category: category?.toUpperCase(),
        imageUrl,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        projectUrl,
        githubUrl,
        isPublished,
      },
    });

    // Update skill links if provided
    if (skillIds !== undefined) {
      // Delete existing links
      await db.projectSkill.deleteMany({
        where: { projectId: id }
      });
      
      // Create new links
      if (skillIds.length > 0) {
        await db.projectSkill.createMany({
          data: skillIds.map((skillId: string) => ({
            projectId: id,
            skillId,
          })),
        });
      }
    }

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category.toLowerCase(),
      imageUrl: project.imageUrl,
      mediaUrls: project.mediaUrls ? JSON.parse(project.mediaUrls) : [],
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      order: project.order,
      isPublished: project.isPublished,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}