import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

/**
 * Lazily initialize the Google Gen AI Client with appropriate telemetry.
 */
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.gemini_api_key || 
      process.env.GOOGLE_API_KEY || 
      process.env.google_api_key || 
      process.env.VITE_GEMINI_API_KEY || 
      process.env.VITE_GOOGLE_API_KEY || 
      process.env.Gemini_Api_Key || 
      process.env.Gemini_API_Key || 
      process.env.gemini_API_key;
      
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is missing or not configured. Please open AI Studio Settings / Secrets and configure your GEMINI_API_KEY.");
    }
    
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/**
 * Chat Stream API Endpoint (Server-Sent Events)
 * Streams response from Gemini models with optional grounding (Google Search).
 */
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, model, systemInstruction, temperature, useSearch } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Map conversation history to Gemini SDK format
    // Each message has 'role': 'user' | 'model'
    // 'parts': array of parts (text or inlineData)
    const contentsArray = messages.map((msg: any) => {
      const parts = [];

      let msgText = msg.content || "";

      // Embed document text content if present
      if (msg.document && msg.document.content) {
        msgText = `[Attached Document: ${msg.document.name} (${msg.document.size})]\n=== DOCUMENT CONTENT START ===\n${msg.document.content}\n=== DOCUMENT CONTENT END ===\n\n${msgText}`;
      }

      // Add text part if text is present
      if (msgText) {
        parts.push({ text: msgText });
      }

      // Add image part if image (base64) is present
      if (msg.image && msg.image.data && msg.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    const modelName = model || "gemini-2.5-flash";

    // Build tools config if search grounding is enabled
    const tools = useSearch ? [{ googleSearch: {} }] : undefined;

    const baseInstruction = `You are JOXIQ AI.
IMPORTANT SYSTEM RULES:
1. Your name is JOXIQ AI. When anyone asks you what your name is or who you are, you must answer that your name is JOXIQ AI (never Julkar AI).
2. Your creator, founder, and developer is Julkar Nain Mahi.
3. You must answer questions about your creator ('Julkar Nain Mahi'), your name ('JOXIQ AI'), or related background accurately and naturally using the following profile:
- Creator Name: Julkar Nain Mahi
- Nationality: Bangladeshi
- Current Location: Living in Qatar
- Occupation / Role: Student, AI enthusiast, and founder/creator of JOXIQ AI.
- Mission: To build intelligent, user-friendly AI tools that help people learn, solve problems, become more productive, and access reliable assistance.
- Vision: Created JOXIQ AI as a helpful assistant supporting students, creators, developers, and anyone looking for reliable AI assistance.
- Personality / Traits: Curious, hardworking, and goal-oriented student who enjoys building technology projects and continuously learning and improving his skills.
4. When users ask about Julkar (e.g., 'Who is Julkar?', 'Tell me about Julkar', 'What kind of person is Julkar?', 'What is Julkar's mission?', 'Why did Julkar create this AI?'), answer naturally, truthfully, and consistently based on this profile. Do not invent personal facts that are not provided. If a user asks something unknown about Julkar, clearly say that the information is not available instead of making up an answer.
5. Maintain a professional, friendly, and helpful tone throughout.`;

    const finalSystemInstruction = `${systemInstruction || "You are a helpful assistant."}\n\n${baseInstruction}`;

    // Start generating streaming content with self-healing fallback
    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: contentsArray,
        config: {
          systemInstruction: finalSystemInstruction,
          temperature: typeof temperature === "number" ? temperature : 0.7,
          tools,
        },
      });
    } catch (primaryError: any) {
      console.warn(`Primary model ${modelName} stream failed. Trying fallback to gemini-2.5-flash...`, primaryError);
      try {
        responseStream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: contentsArray,
          config: {
            systemInstruction: finalSystemInstruction,
            temperature: typeof temperature === "number" ? temperature : 0.7,
            tools,
          },
        });
      } catch (secondaryError: any) {
        console.error("Secondary model gemini-2.5-flash stream failed. Trying tertiary gemini-2.0-flash...", secondaryError);
        try {
          responseStream = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: contentsArray,
            config: {
              systemInstruction: finalSystemInstruction,
              temperature: typeof temperature === "number" ? temperature : 0.7,
              tools,
            },
          });
        } catch (tertiaryError: any) {
          console.error("Tertiary model gemini-2.0-flash stream failed. Trying tertiary gemini-2.5-flash...", tertiaryError);
          responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contentsArray,
            config: {
              systemInstruction: finalSystemInstruction,
              temperature: typeof temperature === "number" ? temperature : 0.7,
              tools,
            },
          });
        }
      }
    }

    // Set SSE Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // Establish the connection immediately

    let metadataSent = false;

    for await (const chunk of responseStream) {
      const text = chunk.text;
      const dataPayload: any = {};

      if (text) {
        dataPayload.text = text;
      }

      // Extract grounding metadata if search was enabled and metadata exists
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const searchQueries = chunk.candidates?.[0]?.groundingMetadata?.webSearchQueries;

      if (groundingChunks || searchQueries) {
        dataPayload.grounding = {
          chunks: groundingChunks || [],
          queries: searchQueries || [],
        };
      }

      // Send chunk if there is text or grounding metadata
      if (dataPayload.text || dataPayload.grounding) {
        res.write(`data: ${JSON.stringify(dataPayload)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Chat streaming error:", error);
    // If headers already sent, close stream with an error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Internal Server Error" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: error.message || "An error occurred during text generation." });
    }
  }
});

/**
 * Text-to-Speech API Endpoint
 * Generates audio feedback for assistant response using gemini-3.1-flash-tts-preview
 */
app.post("/api/chat/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for Speech Synthesis." });
    }

    const ai = getGeminiClient();

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say cheerful and clear: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            },
          },
        },
      });
    } catch (primaryError: any) {
      console.warn("Primary TTS model gemini-3.1-flash-tts-preview failed. Trying fallback to gemini-2.5-flash...", primaryError);
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ parts: [{ text: `Say cheerful and clear: ${text}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || "Kore" },
              },
            },
          },
        });
      } catch (secondaryError: any) {
        console.warn("Secondary TTS model gemini-2.5-flash failed. Trying tertiary gemini-2.0-flash...", secondaryError);
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ parts: [{ text: `Say cheerful and clear: ${text}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || "Kore" },
              },
            },
          },
        });
      }
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio payload returned from Gemini TTS model.");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred during Speech Synthesis." });
  }
});

/**
 * Educational Content Generation API Endpoint
 * Generates custom structured quizzes, exam papers, and goal study plans using Gemini.
 */
app.post("/api/education/generate", async (req, res) => {
  try {
    const { prompt, jsonMode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGeminiClient();
    const config: any = {
      temperature: 0.7,
    };

    if (jsonMode) {
      config.responseMimeType = "application/json";
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config,
      });
    } catch (primaryError: any) {
      console.warn("Primary model gemini-2.5-flash failed in education. Trying fallback to gemini-2.0-flash...", primaryError);
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config,
        });
      } catch (secondaryError: any) {
        console.error("Secondary model gemini-2.0-flash failed in education. Trying tertiary gemini-2.5-flash...", secondaryError);
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config,
        });
      }
    }

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Education generate error:", error);
    res.status(500).json({ error: error.message || "An error occurred during educational content generation." });
  }
});

/**
 * Checkout Session API Endpoint for Pro Subscription & Token Refills
 */
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;
    // If Stripe key is configured, integrate Stripe here. Otherwise, return success for simulated checkout.
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      // Stripe integration hook placeholder
      // const stripe = new Stripe(stripeKey);
      // const session = await stripe.checkout.sessions.create(...);
      // return res.json({ url: session.url });
    }
    
    // Return simulated success response for QAR / USD payment
    res.json({ success: true, message: "Checkout session created successfully", plan: plan || "monthly" });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session." });
  }
});

/**
 * Start the Express + Vite server
 */
async function startServer() {
  // Vite dev server middleware configuration for assets serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start the Express application server:", err);
  });
}

export default app;
