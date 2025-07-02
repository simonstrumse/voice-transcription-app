import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string
): Promise<TranscriptionResult> {
  try {
    // Create a File object from the buffer
    const file = new File([audioBuffer], filename, {
      type: getContentType(filename),
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en", // You can make this configurable
      response_format: "verbose_json",
    });

    return {
      text: transcription.text,
      duration: transcription.duration,
    };
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export function detectFormat(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  return extension || 'unknown';
}

export function getContentType(filename: string): string {
  const format = detectFormat(filename);
  const contentTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/m4a',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    webm: 'audio/webm',
  };
  return contentTypes[format] || 'audio/mpeg';
}

export async function processText(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that improves transcribed text. 
                   Please clean up the following transcription by:
                   1. Adding proper punctuation
                   2. Correcting obvious transcription errors
                   3. Formatting it in a readable way
                   4. Maintaining the original meaning and content
                   
                   Return only the improved text without any additional comments.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || text;
  } catch (error) {
    console.error("Error processing text:", error);
    // Return original text if processing fails
    return text;
  }
}

export const SUPPORTED_FORMATS = [
  'mp3',
  'wav',
  'm4a',
  'ogg',
  'flac',
  'webm'
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (OpenAI's limit)