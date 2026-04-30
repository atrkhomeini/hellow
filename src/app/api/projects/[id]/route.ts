import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const project = await db.project.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
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
      skills: project.skills.map(ps => ({
        id: ps.skill.id,
        name: ps.skill.name,
        category: ps.skill.category.toLowerCase(),
        iconName: ps.skill.iconName,
        color: ps.skill.color,
      }))
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT - Update project
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
    const { title, description, category, imageUrl, mediaUrls, projectUrl, githubUrl, isPublished, skillIds } = body;

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
      await db.projectSkill.deleteMany({
        where: { projectId: id }
      });
      
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

// DELETE - Delete project
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

    // Delete skill links first
    await db.projectSkill.deleteMany({
      where: { projectId: id },
    });

    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}