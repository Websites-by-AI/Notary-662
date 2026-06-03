import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return aiInstance;
}

function resolveModel(model?: string): string {
  if (model?.includes('pro')) return 'gemini-3.1-pro-preview';
  if (model?.includes('flash')) return 'gemini-3.5-flash';
  return 'gemini-3.5-flash';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: { message: 'GEMINI_API_KEY is not configured. Add it in Settings > Secrets.' } },
      { status: 500 }
    );
  }

  try {
    const { model, stream, contents, config } = await req.json();
    const targetModel = resolveModel(model);
    const ai = getAI();

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const responseStream = await ai.models.generateContentStream({
              model: targetModel,
              contents,
              config,
            });
            for await (const chunk of responseStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
          } catch (err: any) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: { message: err.message } })}\n\n`)
            );
          }
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
      return Response.json({
        text: response.text,
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return Response.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: 'ok' });
}
