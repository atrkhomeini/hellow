import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcrypt";

export async function GET() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.admin.findFirst();

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        exists: true,
      });
    }

    // Create default admin user
    const hashedPassword = await hash("admin123", 10);
    const admin = await db.admin.create({
      data: {
        email: "admin@portfolio.com",
        password: hashedPassword,
        name: "Admin",
      },
    });

    // Create default profile
    await db.profile.create({
      data: {
        name: "John Doe",
        headline: "Full Stack Developer",
        bio: "Passionate developer creating beautiful and functional web applications.",
      },
    });

    // Create default social links
    await db.socialLink.createMany({
      data: [
        { platform: "github", url: "https://github.com", order: 0, isActive: true },
        { platform: "linkedin", url: "https://linkedin.com", order: 1, isActive: true },
        { platform: "whatsapp", url: "https://wa.me/", order: 2, isActive: true },
      ],
    });

    return NextResponse.json({
      message: "Setup completed successfully",
      user: { id: admin.id, email: admin.email },
      credentials: { email: "admin@portfolio.com", password: "admin123" },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup" },
      { status: 500 }
    );
  }
}
