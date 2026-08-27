import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';

let _genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please provide an API key in Settings > Secrets.');
  }
  if (!_genAI) {
    _genAI = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return _genAI;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export async function handleGeminiChat(req: Request, res: Response) {
  try {
    const {
      message,
      history = [],
      model = 'gemini-3.5-flash',
      systemInstruction,
      stream = true,
      romsContext,
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Allowed models with automatic fallback list
    const validModels = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-2.5-flash-lite',
    ];

    const selectedModel = validModels.includes(model) ? model : 'gemini-3.5-flash';
    const fallbackModels = [selectedModel, 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    const ai = getGenAI();

    // Construct system instruction with contextual knowledge of the SKY ecosystem
    let effectiveSystemInstruction = systemInstruction;
    if (!effectiveSystemInstruction) {
      effectiveSystemInstruction = `You are SKY AI, an expert Android OS & custom ROM assistant specialized in Xiaomi Redmi 12 5G and POCO M6 Pro 5G (codename 'sky' / Snapdragon 4 Gen 2 - SM4450).
You provide clear, accurate, and safety-focused guidance on Android 14, 15, 16, and 17 custom ROMs (such as PixelOS, crDroid, Evolution X, AxionOS, InfinityX, LineageOS, iodeOS, MistOS, VoltageOS), custom recoveries (OrangeFox, TWRP), firmware flashing, kernels, battery optimization, and troubleshooting boot issues.

Core Guidelines:
1. Be helpful, concise, and technically accurate.
2. Emphasize safety warnings when discussing unlocking bootloaders, flashing firmware, or partitioning.
3. Format output with clean markdown (lists, code blocks, bold text).
4. If comparing ROMs, reference real battery efficiency, stability, and customization features.`;
    }

    if (romsContext && typeof romsContext === 'string') {
      effectiveSystemInstruction += `\n\nHere is the current real-time catalog of available ROMs in the SKY repository for reference:\n${romsContext}`;
    }

    // Format history for @google/genai
    const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (!item || !item.content) continue;
        const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
        formattedContents.push({
          role,
          parts: [{ text: String(item.content) }],
        });
      }
    }

    // Add current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    if (stream) {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let streamSucceeded = false;
      let lastStreamError: any = null;

      for (const currentModel of fallbackModels) {
        try {
          const streamResponse = await ai.models.generateContentStream({
            model: currentModel,
            contents: formattedContents,
            config: {
              systemInstruction: effectiveSystemInstruction,
            },
          });

          for await (const chunk of streamResponse) {
            const text = chunk.text || '';
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }

          res.write(`data: [DONE]\n\n`);
          streamSucceeded = true;
          return res.end();
        } catch (streamErr: any) {
          console.warn(`[Gemini Stream] Model ${currentModel} failed, trying fallback if available:`, streamErr.message);
          lastStreamError = streamErr;
        }
      }

      if (!streamSucceeded) {
        console.error('[Gemini Stream Error All Fallbacks Failed]:', lastStreamError);
        res.write(`data: ${JSON.stringify({ error: lastStreamError?.message || 'Stream generation failed.' })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }
    } else {
      let responseText = '';
      let usedModel = selectedModel;
      let lastError: any = null;

      for (const currentModel of fallbackModels) {
        try {
          const response = await ai.models.generateContent({
            model: currentModel,
            contents: formattedContents,
            config: {
              systemInstruction: effectiveSystemInstruction,
            },
          });
          responseText = response.text || '';
          usedModel = currentModel;
          break;
        } catch (err: any) {
          console.warn(`[Gemini Content] Model ${currentModel} failed:`, err.message);
          lastError = err;
        }
      }

      if (!responseText && lastError) {
        throw lastError;
      }

      return res.status(200).json({
        success: true,
        model: usedModel,
        text: responseText,
      });
    }
  } catch (err: any) {
    console.error('[Gemini Chat Error]:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: err.message || 'An unexpected error occurred while communicating with Gemini.',
      });
    }
    res.end();
  }
}
