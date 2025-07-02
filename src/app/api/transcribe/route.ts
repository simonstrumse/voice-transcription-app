import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { transcriptions } from "../../../../lib/schema";
import { 
  transcribeAudio, 
  processText, 
  detectFormat, 
  SUPPORTED_FORMATS, 
  MAX_FILE_SIZE 
} from "../../../../lib/openai";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 25MB." },
        { status: 400 }
      );
    }

    // Validate file format
    const format = detectFormat(file.name);
    if (!SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique ID for transcription
    const transcriptionId = `transcription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create initial transcription record
    await db.insert(transcriptions).values({
      id: transcriptionId,
      userId: session.user.id,
      filename: file.name,
      originalText: "",
      status: "processing",
      fileSize: file.size,
      format: format,
    });

    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Transcribe audio
      const transcriptionResult = await transcribeAudio(buffer, file.name);
      
      // Process the transcribed text
      const processedText = await processText(transcriptionResult.text);

      // Update transcription record with results
      await db
        .update(transcriptions)
        .set({
          originalText: transcriptionResult.text,
          processedText: processedText,
          duration: transcriptionResult.duration,
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(transcriptions.id, transcriptionId));

      return NextResponse.json({
        id: transcriptionId,
        originalText: transcriptionResult.text,
        processedText: processedText,
        duration: transcriptionResult.duration,
        status: "completed",
      });

    } catch (transcriptionError) {
      console.error("Transcription error:", transcriptionError);
      
      // Update status to failed
      await db
        .update(transcriptions)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(transcriptions.id, transcriptionId));

      return NextResponse.json(
        { error: "Failed to process audio file" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}