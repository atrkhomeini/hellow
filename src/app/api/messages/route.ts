import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all messages (requires auth)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const where: Record<string, unknown> = {};
    if (unreadOnly) where.isRead = false;

    const messages = await db.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend expectations
    const transformed = messages.map(msg => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      content: msg.message,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Create message (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, content } = body;

    const message = await db.message.create({
      data: {
        name,
        email,
        subject,
        message: content,
        isRead: false,
      },
    });

    return NextResponse.json({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      content: message.message,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PUT - Mark message as read (requires auth)
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
    const { id, isRead } = body;

    const message = await db.message.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      content: message.message,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete message (requires auth)
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
        { error: "Message ID required" },
        { status: 400 }
      );
    }

    await db.message.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
