import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch profile
export async function GET() {
  try {
    const profile = await db.profile.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!profile) {
      // Return default profile if none exists
      return NextResponse.json({
        name: "John Doe",
        headline: "Full Stack Developer",
        bio: "Passionate developer creating beautiful and functional web applications.",
        photoUrl: null,
        cvUrl: null,
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update profile (requires auth)
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
    const { name, headline, bio, photoUrl, cvUrl } = body;

    // Check if profile exists
    const existingProfile = await db.profile.findFirst();

    let profile;
    if (existingProfile) {
      profile = await db.profile.update({
        where: { id: existingProfile.id },
        data: {
          name,
          headline,
          bio,
          photoUrl,
          cvUrl,
        },
      });
    } else {
      profile = await db.profile.create({
        data: {
          name,
          headline,
          bio,
          photoUrl,
          cvUrl,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
