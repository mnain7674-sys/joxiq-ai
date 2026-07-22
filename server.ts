import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { chatService } from "./src/services/chatService.js";
import { costOptimizationAgent } from "./src/ai/costOptimizationAgent.js";

// Load environment variables
dotenv.config();

// Lazily initialize Stripe client to prevent crashes if key is missing
let stripeInstance: Stripe | null = null;
function getStripeInstance(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.trim() === "") {
    return null;
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(stripeKey, {
      apiVersion: "2025-01-27.acacia" as any, // use the latest stable or let it resolve
    });
  }
  return stripeInstance;
}


const app = express();
const PORT = 3000;

// Persistent Admin Settings file
const SETTINGS_FILE = path.join(process.cwd(), "admin_settings.json");

let adminGlobalSearch = false;
let adminDefaultTheme = "dark";

try {
  if (fs.existsSync(SETTINGS_FILE)) {
    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    if (typeof data.adminGlobalSearch === "boolean") {
      adminGlobalSearch = data.adminGlobalSearch;
    }
    if (typeof data.adminDefaultTheme === "string") {
      adminDefaultTheme = data.adminDefaultTheme;
    }
  }
} catch (e) {
  console.error("Error loading admin settings:", e);
}

function saveAdminSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ adminGlobalSearch, adminDefaultTheme }, null, 2));
  } catch (e) {
    console.error("Error saving admin settings:", e);
  }
}

// Increase body limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Explicit endpoint for image assets (logo, mobile app assets) to guarantee access across environments
app.get([
  "/logo.png",
  "/favicon.ico",
  "/logo.jpg",
  "/logo.jpeg",
  "/public/logo.png",
  "/src/logo.png",
  "/mobile-app/assets/:file",
  "/public/*",
  "/assets/*"
], (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=3600");
  
  const reqPath = req.path;
  const fileName = req.params.file || path.basename(reqPath);
  
  const possiblePaths = [
    path.join(process.cwd(), "public", fileName),
    path.join(process.cwd(), "src", fileName),
    path.join(process.cwd(), "mobile-app", "assets", fileName),
    path.join(process.cwd(), reqPath),
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "src", "logo.png"),
    path.join(process.cwd(), "logo.png"),
    path.join(process.cwd(), "dist", "logo.png"),
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return res.sendFile(p);
    }
  }
  res.status(404).send("Image asset not found");
});

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
 * Secure Admin Login API Endpoint
 * Verifies admin credentials stored securely on the backend server environment.
 */
app.post("/api/auth/admin-login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const expectedEmail = process.env.ADMIN_EMAIL || "mnain7674@gmail.com";
    const expectedPassword = process.env.ADMIN_PASSWORD || "#**?6251(JNM-369-captain)";

    if (email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword) {
      return res.json({
        success: true,
        profile: {
          name: "Owner Admin",
          email: expectedEmail,
          role: "Owner Admin"
        }
      });
    } else {
      return res.status(401).json({ success: false, error: "Invalid admin email or password." });
    }
  } catch (error: any) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal server error during admin authentication." });
  }
});

/**
 * Available AI Models & Providers Metadata API
 */
app.get("/api/ai/models", (req, res) => {
  try {
    const models = chatService.getAvailableModels();
    res.json({ success: true, models });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Cost Optimization Agent - Prompt Compressor Tool API
 */
app.post("/api/admin/compress-prompt", (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required." });
    }
    const result = costOptimizationAgent.optimizePrompt(prompt);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Chat Stream API Endpoint (Server-Sent Events)
 * Streams responses dynamically routed to Gemini, OpenAI, or Claude via AI Router
 */
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, model, systemInstruction, temperature, useSearch, userTier, userId, userEmail } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const effectiveSearch = Boolean(adminGlobalSearch || useSearch);

    // Set SSE Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = chatService.streamChat(messages, {
      model,
      systemInstruction,
      temperature,
      useSearch: effectiveSearch,
      userTier: userTier || "free",
      userId,
      userEmail,
    });

    for await (const chunk of stream) {
      const dataPayload: any = {};

      if (chunk.text) {
        dataPayload.text = chunk.text;
      }

      if (chunk.grounding) {
        dataPayload.grounding = chunk.grounding;
      }

      if (chunk.routeInfo) {
        dataPayload.routeInfo = chunk.routeInfo;
      }

      if (chunk.providerUsed) {
        dataPayload.providerUsed = chunk.providerUsed;
      }

      if (chunk.modelUsed) {
        dataPayload.modelUsed = chunk.modelUsed;
      }

      if (
        dataPayload.text ||
        dataPayload.grounding ||
        dataPayload.routeInfo ||
        dataPayload.providerUsed
      ) {
        res.write(`data: ${JSON.stringify(dataPayload)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Chat streaming error:", error);
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
      systemInstruction: `You are an expert AI tutor. You are always honest that you are an AI tutor, but your teaching style is like learning from an experienced, patient, and caring teacher.
The learner should never feel like they are simply chatting with a generic AI. Instead, every lesson and conversation should feel like a real classroom or a private one-to-one tutoring session.

TEACHING PERSONALITY:
- Teach with warmth, patience, sincere encouragement, and professionalism.
- Communicate naturally, respectfully, and conversationally. Avoid robotic language, generic AI responses, or repeating the same phrases.
- Speak naturally, like a skilled teacher explaining a topic to one student.

CLASSROOM EXPERIENCE & ATMOSPHERE:
- Guide the learner step by step. Pause naturally between topics, ask simple questions before moving forward, and give the learner time to think.
- If the learner answers correctly, praise the effort and briefly explain why.
- If the learner answers incorrectly, never criticize or make them feel embarrassed. Instead, explain the mistake kindly, teach again in a simpler way, and encourage another attempt.
- Create a positive learning environment. Encourage curiosity and welcome questions.

TEACHING STYLE:
- Teach concepts first. Build understanding gradually, teaching one idea at a time. Do not overload.
- Frequently connect lessons to real-life situations. Use stories, comparisons, and practical examples when they genuinely help understanding.
- The learner should feel supported throughout.

PERSONAL ATTENTION:
- Treat every learner like an individual student. Remember what has been covered in the current lesson.
- Adapt explanations to the learner's responses. If the learner struggles, slow down. If they progress quickly, offer optional deeper insights without skipping core material.`
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
    const { plan, email } = req.body;

    // Check if Stripe is configured
    const stripe = getStripeInstance();
    if (stripe) {
      // Plan pricing mapping (in QAR)
      // monthly -> 36 QR (~$9.99 USD)
      // yearly -> 300 QR (~$82 USD)
      // ultra -> 99 QR (~$27 USD)
      let amount = 3600; // default 36 QAR in cents
      let interval: "month" | "year" = "month";
      let planName = "JOXIQ Pro Monthly";

      if (plan === "yearly") {
        amount = 30000; // 300 QAR
        interval = "year";
        planName = "JOXIQ Pro Yearly";
      } else if (plan === "ultra") {
        amount = 9900; // 99 QAR
        interval = "month";
        planName = "JOXIQ Ultra Monthly";
      }

      const origin = req.headers.origin || "http://localhost:3000";
      
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "qar",
              product_data: {
                name: planName,
                description: `Unlock unlimited messages, advanced Gemini models, and premium features on JOXIQ AI.`,
              },
              unit_amount: amount,
              recurring: {
                interval: interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/?payment_success=true&plan=${plan || "monthly"}&email=${encodeURIComponent(email || "")}`,
        cancel_url: `${origin}/?payment_cancel=true`,
      });

      return res.json({ success: true, url: session.url });
    }

    // Fallback simulated success response for QAR / USD payment
    if (email) {
      const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.subscriptionStatus = plan === "ultra" ? "JOXIQ Ultra" : "Pro";
        const currentTokens = parseInt(user.tokensUsed || "0", 10);
        const addedTokens = plan === "ultra" ? 200000 : plan === "yearly" ? 150000 : 50000;
        user.tokensUsed = String(currentTokens + addedTokens);
      }
    }
    
    res.json({ success: true, message: "Checkout session created successfully and tokens credited (Simulated)", plan: plan || "monthly" });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session." });
  }
});

/**
 * Record Real Token Usage API Endpoint
 */
app.post("/api/user/record-tokens", (req, res) => {
  try {
    const { email, tokens } = req.body;
    if (!email || typeof tokens !== "number") {
      return res.status(400).json({ error: "Email and token count are required." });
    }
    const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const current = parseInt(user.tokensUsed || "0", 10);
      user.tokensUsed = String(current + tokens);
    } else {
      registeredUsers.push({
        id: `u-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: email.toLowerCase() === "mnain7674@gmail.com" ? "Owner Admin" : "Standard User",
        status: "Active",
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: "Just now",
        subscriptionStatus: "Free",
        tokensUsed: String(tokens)
      });
    }
    res.json({ success: true, users: registeredUsers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Chat Theme Management System API Endpoints
 */
let chatThemes = [
  { id: "dark", name: "Classic Dark Slate", desc: "Deep dark slate with indigo accents", accent: "indigo" },
  { id: "light", name: "Clean Light", desc: "Crisp white & clean slate grey UI", accent: "indigo" },
  { id: "midnight", name: "Midnight Indigo", desc: "Deep rich indigo blue night theme", accent: "blue" },
  { id: "emerald", name: "Emerald Obsidian", desc: "Dark obsidian with emerald highlights", accent: "emerald" },
  { id: "amber", name: "Sunset Amber", desc: "Warm amber & cozy gold tones", accent: "amber" },
  { id: "rose", name: "Rose Velvet", desc: "Luxurious wine and rose velvet theme", accent: "rose" },
];
const userThemePreferences: Record<string, string> = {}; // email -> themeId

app.get("/api/themes", (req, res) => {
  res.json({ themes: chatThemes, defaultTheme: adminDefaultTheme });
});

app.post("/api/admin/themes", (req, res) => {
  try {
    const { id, name, desc, accent } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "Theme ID and name are required." });
    }
    const existing = chatThemes.find(t => t.id === id);
    if (existing) {
      existing.name = name;
      existing.desc = desc || existing.desc;
      existing.accent = accent || existing.accent;
    } else {
      chatThemes.push({ id, name, desc: desc || "", accent: accent || "indigo" });
    }
    res.json({ success: true, themes: chatThemes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/default-theme", (req, res) => {
  try {
    const { themeId } = req.body;
    if (!themeId) {
      return res.status(400).json({ error: "Theme ID is required." });
    }
    adminDefaultTheme = themeId;
    saveAdminSettings();
    res.json({ success: true, defaultTheme: adminDefaultTheme });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/theme", (req, res) => {
  try {
    const email = req.query.email as string;
    const themeId = (email && userThemePreferences[email]) || adminDefaultTheme;
    res.json({ themeId, defaultTheme: adminDefaultTheme });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/theme", (req, res) => {
  try {
    const { email, themeId } = req.body;
    if (!email || !themeId) {
      return res.status(400).json({ error: "Email and themeId are required." });
    }
    userThemePreferences[email] = themeId;
    res.json({ success: true, themeId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/web-search", (req, res) => {
  res.json({ useSearch: adminGlobalSearch });
});

app.post("/api/admin/web-search", (req, res) => {
  try {
    const { useSearch } = req.body;
    adminGlobalSearch = Boolean(useSearch);
    saveAdminSettings();
    res.json({ success: true, useSearch: adminGlobalSearch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Admin User Management System API Endpoints
 */
let registeredUsers: any[] = [];

app.get("/api/admin/users", (req, res) => {
  res.json({ users: registeredUsers, totalCount: registeredUsers.length });
});

app.post("/api/admin/users", (req, res) => {
  try {
    const { name, email, role, subscriptionStatus } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }
    const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.name = name;
      existing.role = role || existing.role;
      existing.subscriptionStatus = subscriptionStatus || existing.subscriptionStatus;
    } else {
      registeredUsers.push({
        id: `u-${Date.now()}`,
        name,
        email,
        role: role || "Standard User",
        status: "Active",
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: "Just now",
        subscriptionStatus: subscriptionStatus || "Free",
        tokensUsed: "0"
      });
    }
    res.json({ success: true, users: registeredUsers, totalCount: registeredUsers.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/register-or-login", (req, res) => {
  try {
    const { name, email, isPro } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const nowStr = "Just now";
    if (existing) {
      existing.lastLogin = nowStr;
      if (name) existing.name = name;
      if (isPro) existing.subscriptionStatus = "Pro";
    } else {
      registeredUsers.push({
        id: `u-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        role: email.toLowerCase() === "mnain7674@gmail.com" ? "Owner Admin" : "Standard User",
        status: "Active",
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: nowStr,
        subscriptionStatus: isPro ? "Pro" : "Free",
        tokensUsed: "150"
      });
    }
    res.json({ success: true, users: registeredUsers, totalCount: registeredUsers.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/users/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = registeredUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.email === "mnain7674@gmail.com") {
      return res.status(400).json({ error: "Cannot modify master owner admin account status." });
    }
    user.status = status || (user.status === "Active" ? "Inactive" : "Active");
    res.json({ success: true, users: registeredUsers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const user = registeredUsers.find(u => u.id === id);
    if (user && user.email === "mnain7674@gmail.com") {
      return res.status(400).json({ error: "Cannot delete master owner admin account." });
    }
    registeredUsers = registeredUsers.filter(u => u.id !== id);
    res.json({ success: true, users: registeredUsers, totalCount: registeredUsers.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start the Express + Vite server
 */
const distPath = path.join(process.cwd(), "dist");
const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

async function startServer() {
  if (isProduction) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured (isProduction = true).");
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated (isProduction = false).");
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
