import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all skills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    where.isActive = true;

    const skills = await db.skill.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        projects: {
          include: {
            project: true
          }
        }
      }
    });

    // Transform to include projectIds
    const transformedSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category.toLowerCase(),
      iconName: skill.iconName,
      iconUrl: skill.iconUrl,
      color: skill.color,
      order: skill.order,
      isActive: skill.isActive,
      projectIds: skill.projects.map(ps => ps.projectId)
    }));

    return NextResponse.json(transformedSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST - Create skill (requires auth)
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
    const { name, category, iconName, iconUrl, color, projectIds } = body;

    // Get max order
    const maxOrder = await db.skill.aggregate({
      where: { category: category.toUpperCase() },
      _max: { order: true },
    });

    const skill = await db.skill.create({
      data: {
        name,
        category: category.toUpperCase(),
        iconName,
        iconUrl,
        color,
        order: (maxOrder._max.order || 0) + 1,
        isActive: true,
      },
    });

    // Link to projects if projectIds provided
    if (projectIds && projectIds.length > 0) {
      await db.projectSkill.createMany({
        data: projectIds.map((projectId: string) => ({
          projectId,
          skillId: skill.id,
        })),
      });
    }

    return NextResponse.json({
      id: skill.id,
      name: skill.name,
      category: skill.category.toLowerCase(),
      iconName: skill.iconName,
      iconUrl: skill.iconUrl,
      color: skill.color,
      order: skill.order,
      isActive: skill.isActive,
      projectIds: projectIds || []
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

// PUT - Update skill order (requires auth)
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
    if (body.skills) {
      const { skills } = body as { skills: { id: string; order: number }[] };

      // Update order for each skill
      const updates = skills.map((skill) =>
        db.skill.update({
          where: { id: skill.id },
          data: { order: skill.order },
        })
      );

      await Promise.all(updates);

      return NextResponse.json({ message: "Order updated" });
    }
    
    // Otherwise, update a single skill
    const { id, name, category, iconName, iconUrl, color, isActive, projectIds } = body;
    
    const skill = await db.skill.update({
      where: { id },
      data: {
        name,
        category: category?.toUpperCase(),
        iconName,
        iconUrl,
        color,
        isActive,
      },
    });

    // Update project links if provided
    if (projectIds !== undefined) {
      // Delete existing links
      await db.projectSkill.deleteMany({
        where: { skillId: id }
      });
      
      // Create new links
      if (projectIds.length > 0) {
        await db.projectSkill.createMany({
          data: projectIds.map((projectId: string) => ({
            projectId,
            skillId: id,
          })),
        });
      }
    }

    return NextResponse.json({
      id: skill.id,
      name: skill.name,
      category: skill.category.toLowerCase(),
      iconName: skill.iconName,
      iconUrl: skill.iconUrl,
      color: skill.color,
      order: skill.order,
      isActive: skill.isActive,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}
