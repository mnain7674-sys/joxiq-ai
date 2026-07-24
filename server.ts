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
 * JOXIQ AI Learning Academy - AI Teacher Classroom Explanation API
 * Generates interactive, step-by-step AI teacher explanations in English or Bangla
 */
app.post("/api/learning/teacher-explain", async (req, res) => {
  try {
    const {
      classTitle,
      explanationTopic,
      courseCategory,
      level,
      language = "English",
      studentQuestion,
      requestMode, // "explain_again" | "another_example" | "explain_easier"
      currentStep
    } = req.body;

    if (!classTitle || !explanationTopic) {
      return res.status(400).json({ error: "classTitle and explanationTopic are required." });
    }

    const ai = getGeminiClient();

    let modeInstruction = "";
    if (requestMode === "explain_again") {
      modeInstruction = language === "Bangla"
        ? "শিক্ষার্থী অনুরোধ করেছে: 'পুনরায় ব্যাখ্যা করুন'। আগের ব্যাখ্যাটি আরও পরিষ্কারভাবে এবং সংক্ষেপে শুরু থেকে উপস্থাপন করো।"
        : "The student requested: 'Explain again'. Re-explain the lesson from the beginning in a fresh, ultra-clear manner.";
    } else if (requestMode === "another_example") {
      modeInstruction = language === "Bangla"
        ? "শিক্ষার্থী অনুরোধ করেছে: 'আরেকটি উদাহরণ দিন'। আগের উদাহরণের চেয়ে সম্পূর্ণ নতুন, আকর্ষণীয় ও বাস্তবমুখী একটি উদাহরণ দাও।"
        : "The student requested: 'Give another example'. Provide a brand-new, creative, real-world analogy and practical example different from the previous one.";
    } else if (requestMode === "explain_easier") {
      modeInstruction = language === "Bangla"
        ? "শিক্ষার্থী অনুরোধ করেছে: 'সহজভাবে বোঝান'। কোনো জটিল শব্দ ব্যবহার না করে একদম শিক্ষানবিস বা বাচ্চার মতো সহজ ভাষায় দৈনন্দিন জীবনের সাদৃশ্য দিয়ে বোঝাও।"
        : "The student requested: 'Explain easier'. Simplify the entire explanation so a complete beginner can understand it instantly. Avoid jargon and use everyday analogies.";
    }

    const systemPrompt = `You are JOXIQ AI Master Voice Teacher - a warm, patient, and world-class tutor in JOXIQ Learning Academy.
Your task is to teach: "${classTitle}" (${explanationTopic}) for a student studying ${courseCategory || "Tech"} at ${level || "Beginner"} level.
Current Step: Step ${currentStep || 2} of 6.
Requested Language: ${language === "Bangla" ? "Bangla (বাংলা) with clear English technical terms" : "English"}.

${modeInstruction ? `SPECIAL STUDENT REQUEST: ${modeInstruction}` : ""}
${studentQuestion ? `STUDENT QUESTION: "${studentQuestion}" - Answer this question directly with high clarity!` : ""}

PEDAGOGICAL VOICE GUIDELINES:
1. Speak warmly like a real private teacher in a live 1-on-1 session.
2. Be friendly, beginner-friendly, and engaging. Avoid complex jargon without immediate plain-language definition.
3. Structure your response with markdown headings, bullet points, and practical examples.
4. Keep the explanation punchy, accurate, and inspiring.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ parts: [{ text: systemPrompt }] }],
    });

    const explanationText = response.candidates?.[0]?.content?.parts?.[0]?.text || (language === "Bangla" ? "দুঃখিত, কোনো উত্তর তৈরি করা সম্ভব হয়নি।" : "Failed to generate AI Teacher explanation.");
    res.json({ success: true, explanation: explanationText });
  } catch (error: any) {
    console.error("AI Teacher Explanation error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate AI Teacher response." });
  }
});

/**
 * JOXIQ AI Learning Academy - AI Doubt Chat API
 * Handles lesson-aware conversational doubt resolution for students in English or Bangla
 */
app.post("/api/learning/doubt-chat", async (req, res) => {
  try {
    const {
      courseName,
      courseCategory,
      level,
      moduleTitle,
      classTitle,
      classNumber,
      explanationTopic,
      learningObjective,
      currentStep,
      selectedCodeLine,
      language = "English",
      chatHistory = [],
      userQuestion
    } = req.body;

    if (!classTitle || !userQuestion) {
      return res.status(400).json({ error: "classTitle and userQuestion are required." });
    }

    const ai = getGeminiClient();

    // Construct lesson context prompt
    const contextPrompt = `You are JOXIQ AI Master Teacher - a patient, encouraging, and highly intelligent tutor in JOXIQ Learning Academy.
A student is currently sitting in your interactive classroom for the lesson:
- Course: ${courseName || "General Tech"} (${courseCategory || "Tech"})
- Level: ${level || "Beginner"}
- Module: ${moduleTitle || "Core Module"}
- Class #${classNumber || 1}: "${classTitle}"
- Learning Objective: ${learningObjective || classTitle}
- Core Lesson Topic: ${explanationTopic}
- Current Classroom Step: Step ${currentStep || 1} of 6
${selectedCodeLine ? `- Currently Highlighted Code Line: Line ${selectedCodeLine}` : ""}
- Requested Language: ${language === "Bangla" ? "Bangla (বাংলা) with clear English technical terms in brackets if helpful" : "English"}

STUDENT PEDAGOGY RULES:
1. Be extremely patient, supportive, and clear.
2. If the student expresses confusion (e.g., "আমি এটা বুঝতে পারছি না", "I don't understand"), DO NOT give a lazy short reply.
3. Identify what might be confusing, break down the concept to absolute fundamentals, and provide a NEW real-world analogy or example.
4. Use bullet points or numbered steps to make explanations easy to read.
5. Keep technical terms clear and accurate.
6. Always end with an encouraging question or brief check-in (e.g., "does this make sense now?" / "এখন কি বিষয়টি পরিষ্কার হয়েছে?").

FORMAT: Clean markdown formatting with bold points.`;

    // Map chat history into Gemini contents structure
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
      {
        role: "user",
        parts: [{ text: `[SYSTEM INSTRUCTION & LESSON CONTEXT]\n${contextPrompt}` }]
      },
      {
        role: "model",
        parts: [{ text: language === "Bangla" ? `ধন্যবাদ! আমি এই পাঠের AI Teacher। তোমার যেকোনো প্রশ্নের উত্তর দিতে আমি প্রস্তুত।` : `Hello! I am your AI Teacher for this lesson. I am ready to answer any questions or clarify any doubts!` }]
      }
    ];

    // Append prior chat history if present
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; text: string }) => {
        if (msg.role && msg.text) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Append the current student question
    contents.push({
      role: "user",
      parts: [{ text: userQuestion }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
    });

    const replyText = response.candidates?.[0]?.content?.parts?.[0]?.text || (language === "Bangla" ? "দুঃখিত, কোনো উত্তর তৈরি করা সম্ভব হয়নি। আবার চেষ্টা করো।" : "I apologize, I could not generate a response right now. Please try asking again.");

    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error("AI Doubt Chat error:", error);
    res.status(500).json({ success: false, error: error.message || "Doubt Chat service failed." });
  }
});

/**
 * JOXIQ AI Learning Academy - AI Programming Code Teacher API
 * Explains code line-by-line, debugs errors, gives hints, refactors code, and evaluates student solutions
 */
app.post("/api/learning/code-teacher", async (req, res) => {
  try {
    const {
      code,
      language = "Python",
      action = "explain",
      courseName,
      classTitle,
      topic,
      exerciseDescription,
      beginnerMode = true,
      userQuestion,
      langPreference = "English"
    } = req.body;

    if (!code && !userQuestion) {
      return res.status(400).json({ error: "Code snippet or user question is required." });
    }

    const ai = getGeminiClient();

    let teacherSystemPrompt = `You are JOXIQ AI Code Teacher - an expert, patient, and highly skilled programming instructor inside JOXIQ Learning Academy.
You specialize in teaching programming languages: Python, JavaScript, TypeScript, Java, C++, C#, Kotlin, Swift, Dart, PHP, Go, and Rust.
Language to teach: ${language}.
Requested Language for Explanation: ${langPreference === "Bangla" ? "Bangla (বাংলা) with English code & keywords" : "English"}.
Beginner Mode: ${beginnerMode ? "ENABLED (Explain every line, syntax, and why code works simply without jargon)" : "DISABLED (Concise engineering review)"}.
${courseName ? `Course Context: ${courseName}` : ""}
${classTitle ? `Lesson Context: ${classTitle}` : ""}
${topic ? `Topic: ${topic}` : ""}`;

    let userPrompt = "";

    if (action === "beginner_breakdown" || (action === "explain" && beginnerMode)) {
      userPrompt = `Please provide a beginner-friendly breakdown of this ${language} code:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide:
1. **High-Level Overview**: What does this code do in plain everyday terms?
2. **Line-by-Line Breakdown**: Explain line by line what each variable, function, loop, or keyword is doing.
3. **Syntax Explanation**: Highlight 2-3 key language syntax features used here (e.g. function definition, loop condition, data types).
4. **Why It Works**: Explain why the logic flows the way it does.
${userQuestion ? `\nStudent's Specific Question: "${userQuestion}"` : ""}`;

    } else if (action === "debug") {
      userPrompt = `Act as an expert AI Code Debugger. Analyze this ${language} code for errors, syntax mistakes, logical bugs, and edge cases:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide:
1. **Mistakes / Errors Found**: Point out any syntax errors, undefined variables, boundary bugs, or missing imports/returns.
2. **Line Number & Explanation**: Explain why each error occurs and how to avoid it in ${language}.
3. **Corrected Code Solution**: Provide the clean, fixed, runnable code snippet.
4. **Teacher Tip**: A quick rule of thumb to remember.
${userQuestion ? `\nStudent asked: "${userQuestion}"` : ""}`;

    } else if (action === "refactor") {
      userPrompt = `Act as a Senior Software Engineer & Code Teacher. Review this ${language} code for best practices and refactoring:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide:
1. **Code Quality Analysis**: Readability, efficiency, type safety, and naming conventions in ${language}.
2. **Suggested Improvements**: 2-3 clean code tips (e.g., idiomatic syntax, memory usage, cleaner structure).
3. **Refactored Code**: Write the improved, professional version of the code.`;

    } else if (action === "hint") {
      userPrompt = `A beginner student is working on this coding exercise in ${language}:
Exercise Goal: ${exerciseDescription || topic || classTitle}

Current Student Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

DO NOT give away the complete code answer directly.
Give a helpful, step-by-step hint or guiding question that prompts the student to think about the next step or fix their error themselves!`;

    } else if (action === "evaluate_submission") {
      userPrompt = `Evaluate this student's solution for the coding challenge:
Challenge Requirement: ${exerciseDescription || topic || classTitle}
Programming Language: ${language}

Student's Submitted Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide evaluation in structured Markdown:
1. **Score**: (Give a percentage score e.g. 90/100%)
2. **Status**: (PASSED / NEEDS REVISION)
3. **Correctness Analysis**: Does it satisfy the problem requirements?
4. **Code Quality**: Syntax correctness, style, and edge case handling.
5. **AI Teacher Encouragement**: Feedback on what was done well and what to practice next.`;

    } else {
      userPrompt = `Answer the student's programming question about ${language}:
"${userQuestion || "Please explain this code"}"

Code context:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: `${teacherSystemPrompt}\n\n${userPrompt}` }] }
      ]
    });

    const teacherResponse = response.candidates?.[0]?.content?.parts?.[0]?.text ||
      (langPreference === "Bangla" ? "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।" : "Unable to generate code teacher guidance.");

    res.json({
      success: true,
      language,
      action,
      explanation: teacherResponse
    });
  } catch (error: any) {
    console.error("AI Code Teacher API error:", error);
    res.status(500).json({ success: false, error: error.message || "Code Teacher service failed." });
  }
});

/**
 * JOXIQ AI Learning Academy - AI Project Mentor API
 * Guides students through 7-step practical projects, creates roadmaps, debugs code/plans, and provides reviews.
 */
app.post("/api/learning/project-mentor", async (req, res) => {
  try {
    const {
      projectTitle,
      category = "Programming",
      difficulty = "Beginner",
      courseName,
      moduleTitle,
      classNumber,
      action = "qa",
      currentStepNumber = 1,
      submissionCodeOrPlan,
      userQuestion,
      langPreference = "English"
    } = req.body;

    if (!projectTitle) {
      return res.status(400).json({ error: "projectTitle is required." });
    }

    const ai = getGeminiClient();

    const mentorSystemPrompt = `You are JOXIQ AI Project Mentor - a world-class senior engineering lead, business strategist, and patient mentor in JOXIQ Learning Academy.
Your goal is to help students turn theoretical knowledge into real-world skills by guiding them step-by-step through practical projects.

Project Context:
- Project Title: "${projectTitle}"
- Category: ${category}
- Difficulty Level: ${difficulty}
${courseName ? `- Connected Course: ${courseName}` : ""}
${moduleTitle ? `- Connected Module: ${moduleTitle}` : ""}
${classNumber ? `- Connected Class #: ${classNumber}` : ""}
- Current Project Workflow Step: Step ${currentStepNumber} of 7
- Output Language: ${langPreference === "Bangla" ? "Bangla (বাংলা) with clear technical terms" : "English"}

MENTOR GUIDELINES:
1. Provide actionable, structured, and highly encouraging guidance.
2. Use markdown headings, bullet points, and code/plan examples.
3. Keep explanation clear, practical, and beginner-friendly.`;

    let promptContent = "";

    if (action === "roadmap") {
      promptContent = `Create a complete Project Roadmap & Requirement Explanation for the project "${projectTitle}".
Break down:
1. **Project Objective**: Why build this project & real-world impact.
2. **Key Requirements**: Core features & deliverable components.
3. **7-Step Action Plan**:
   - Step 1: Choose & Scope Project
   - Step 2: Understand Requirements & Architecture
   - Step 3: Create Plan & Schema
   - Step 4: Build Step by Step
   - Step 5: Test & Validate
   - Step 6: Improve & Polish
   - Step 7: Finalize & Save to Student Portfolio
4. **Skills Gained**: Core technical/business skills mastered upon completion.`;

    } else if (action === "step_guidance") {
      promptContent = `Provide step-by-step guidance for Step ${currentStepNumber} of the project "${projectTitle}".
Student's current work / plan snippet:
\`\`\`
${submissionCodeOrPlan || "(No submission draft yet)"}
\`\`\`

Explain:
1. **What to do in Step ${currentStepNumber}**: Core goals for this specific step.
2. **Actionable Checklist**: 3-4 clear micro-tasks.
3. **Starter Code or Example Structure**: Concrete snippet or template to move forward.
4. **Mentor Pro-Tip**: Common pitfall to avoid in this step.`;

    } else if (action === "debug_help") {
      promptContent = `The student is asking for debugging / problem-solving help on the project "${projectTitle}":
Student Question: "${userQuestion || "Why is my code or plan not working as expected?"}"

Current Student Code / Plan:
\`\`\`
${submissionCodeOrPlan || "(No code provided)"}
\`\`\`

Provide:
1. **Root Cause Analysis**: Identify why the issue or confusion occurred.
2. **Step-by-Step Fix**: Explain how to solve it clearly.
3. **Corrected Code / Plan Snippet**: Provide the fixed solution.
4. **Learning Takeaway**: How to prevent similar issues in the future.`;

    } else if (action === "review_improve") {
      promptContent = `Review the student's project submission and suggest improvements for "${projectTitle}":

Student's Project Work:
\`\`\`
${submissionCodeOrPlan || "(No code or plan submitted)"}
\`\`\`

Provide:
1. **Overall Grade / Rating**: (e.g., 95/100, Excellent Execution!)
2. **Strengths**: What was implemented really well.
3. **3 Key Improvements**: Refactoring, optimization, security, or design enhancements ("How can I improve this?").
4. **Portfolio Highlight**: How to showcase this project to employers or clients.`;

    } else {
      promptContent = `Answer the student's question about the project "${projectTitle}":
"${userQuestion || "How do I start this project?"}"

Student's Current Draft:
\`\`\`
${submissionCodeOrPlan || "(No draft)"}
\`\`\``;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: `${mentorSystemPrompt}\n\n${promptContent}` }] }]
    });

    const mentorFeedback = response.candidates?.[0]?.content?.parts?.[0]?.text ||
      (langPreference === "Bangla" ? "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।" : "Unable to generate project mentor response.");

    res.json({
      success: true,
      projectTitle,
      action,
      feedback: mentorFeedback
    });
  } catch (error: any) {
    console.error("AI Project Mentor API error:", error);
    res.status(500).json({ success: false, error: error.message || "Project Mentor service failed." });
  }
});

/**
 * JOXIQ AI Learning Academy - Personalized AI Recommendation Engine API
 * Analyzes student learning stats, quiz scores, weak topics, and progress to generate personalized recommendations, AI Teacher feedback, and difficulty adjustments.
 */
app.post("/api/learning/recommendations", async (req, res) => {
  try {
    const {
      completedClassCount = 0,
      averageQuizScore = 80,
      quizHistory = [],
      completedCourses = [],
      enrolledCourses = [],
      practiceCount = 0,
      studentInterests = ["Programming", "AI Engineering"],
      langPreference = "English"
    } = req.body;

    const ai = getGeminiClient();

    const recommendationPrompt = `You are JOXIQ AI Learning Advisor & Personal Pedagogy Engine in JOXIQ Learning Academy.
Analyze the following real student learning data and produce a personalized, structured learning recommendation plan in JSON format.

STUDENT PERFORMANCE DATA:
- Total Classes Completed: ${completedClassCount}
- Average Quiz Score: ${averageQuizScore}%
- Total Practice Tasks Completed: ${practiceCount}
- Completed Courses: ${JSON.stringify(completedCourses)}
- Currently Enrolled Courses: ${JSON.stringify(enrolledCourses)}
- Student Interests / Goals: ${JSON.stringify(studentInterests)}
- Recent Quiz History Snippets: ${JSON.stringify(quizHistory.slice(-5))}
- Language Preference: ${langPreference === "Bangla" ? "Bangla (বাংলা)" : "English"}

REQUIREMENTS FOR JSON RESPONSE:
Return a JSON object matching this schema EXACTLY:
{
  "learningSpeed": "Fast Learner" | "Steady Pace" | "Needs Guided Practice",
  "adaptiveDifficulty": "Beginner Fundamentals" | "Intermediate Problem Solver" | "Advanced Mastery",
  "strongTopics": ["topic 1", "topic 2"],
  "weakTopics": ["weak topic 1", "weak topic 2"],
  "aiTeacherFeedback": {
    "whatYouLearned": "Specific summary of what the student has mastered so far...",
    "whatYouNeedToImprove": "Specific areas where the student needs focused practice...",
    "whatYouShouldLearnNext": "Immediate clear next step lesson or concept..."
  },
  "dailyGoal": {
    "dailyGoalTitle": "Daily learning goal description...",
    "recommendedClassTitle": "Recommended next class title...",
    "practiceReminderText": "Actionable practice reminder...",
    "targetMinutes": 30
  },
  "recommendedActions": [
    {
      "id": "rec-1",
      "type": "next_lesson" | "revision_topic" | "practice_task" | "extra_exercise" | "hard_challenge" | "project_build",
      "title": "Action title...",
      "description": "Short explanation...",
      "courseName": "Course name...",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "reason": "Why this specific recommendation was chosen based on student performance...",
      "actionText": "Start Lesson / Practice / Build"
    }
  ],
  "suggestedCourses": [
    {
      "courseId": "ai-eng",
      "courseName": "Recommended course title...",
      "category": "AI Engineering",
      "requiredLevel": "Beginner",
      "matchScorePercentage": 95,
      "reason": "Why this course connects with student's completed studies...",
      "skillsYouWillGain": ["Skill 1", "Skill 2"]
    }
  ]
}

Ensure all advice is directly grounded in the student's performance data. If quiz scores are under 70%, recommend revision and extra exercises. If quiz scores are high (>85%), adjust difficulty upwards and recommend harder challenges or capstone projects!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: recommendationPrompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return res.status(500).json({ success: false, error: "Empty AI response" });
    }

    const jsonResult = JSON.parse(responseText);
    res.json({
      success: true,
      analysis: jsonResult
    });
  } catch (error: any) {
    console.error("AI Recommendation API error:", error);
    res.status(500).json({ success: false, error: error.message || "Recommendation service failed." });
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
