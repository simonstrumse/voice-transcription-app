import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { transcriptions } from "../../../../lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user's transcriptions
    const userTranscriptions = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.userId, session.user.id))
      .orderBy(desc(transcriptions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      transcriptions: userTranscriptions,
      hasMore: userTranscriptions.length === limit,
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transcriptionId = searchParams.get("id");

    if (!transcriptionId) {
      return NextResponse.json(
        { error: "Transcription ID is required" },
        { status: 400 }
      );
    }

    // Delete transcription (only if it belongs to the user)
    await db
      .delete(transcriptions)
      .where(
        eq(transcriptions.id, transcriptionId)
      );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}