import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
function getAdminApp() {
  if (getApps().length) return getApps()[0];
  try {
    const app = initializeApp({
      projectId: "mindly-ai-7af1f"
    });
    console.log("[Firebase] Admin initialized successfully");
    return app;
  } catch (error) {
    console.error("[Firebase] Admin initialization error:", error);
    return null;
  }
}

const adminApp = getAdminApp();

function getDb() {
  if (!adminApp) return null;
  try {
    return getFirestore(adminApp, "ai-studio-mindlyai-48afac4e-73f6-4c7b-8522-922f9f291fbc");
  } catch (error) {
    console.error("[Firebase] Firestore initialization error:", error);
    return null;
  }
}

const db = getDb();

// Helper for Gemini with fallback
async function generateGeminiResponse(messages: { role: string; content: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from environment");
    throw new Error("AI service is currently unavailable (Missing API Key)");
  }

  const ai = new GoogleGenAI({ 
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const modelLadder = [
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.7-flash"
  ];
  
  let lastError;
  for (const modelName of modelLadder) {
    try {
      console.log(`[AI] Attempting ${modelName}...`);
      
      const contents = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      
      console.log(`[AI] Success with ${modelName}`);
      return text;
    } catch (err: any) {
      console.error(`[AI] Error with ${modelName}:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("All models failed to respond");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      firebaseInitialized: !!adminApp
    });
  });

  // Root check
  app.get("/server-check", (req, res) => {
    res.send("Server is running and healthy");
  });

  // Auth verification test
  app.get("/api/verify-auth", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }
      const idToken = authHeader.split("Bearer ")[1];
      
      if (!adminApp) {
        console.error("[Auth] Firebase Admin not initialized");
        return res.status(503).json({ error: "Auth service unavailable" });
      }

      console.log("[Auth] Verifying token...");
      const auth = getAuth(adminApp);
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log("[Auth] Verification success for UID:", decodedToken.uid);
      res.json({ status: "ok", uid: decodedToken.uid });
    } catch (err: any) {
      console.error("[Auth Test] Verification failed:", err.message);
      res.status(401).json({ error: "Invalid token", message: err.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const { userId, sessionId, messages } = body;

      if (!userId || !sessionId || !messages || !Array.isArray(messages)) {
        console.warn("[Chat] Bad Request: Missing fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify user via Auth header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - Missing token" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      
      let decodedToken;
      try {
        if (!adminApp) {
          console.error("[Auth] Firebase Admin not initialized");
          return res.status(503).json({ error: "Auth service unavailable" });
        }
        const auth = getAuth(adminApp);
        decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
          console.warn(`[Auth] UID mismatch: ${decodedToken.uid} vs ${userId}`);
          return res.status(403).json({ error: "Forbidden - User ID mismatch" });
        }
      } catch (err: any) {
        console.error("[Auth] Verification Error:", err.message);
        return res.status(401).json({ error: "Unauthorized - Invalid token", message: err.message });
      }

      const assistantText = await generateGeminiResponse(messages);
      
      if (!db) {
        console.error("[Firestore] Database not initialized");
        return res.json({ content: assistantText });
      }

      // Save to Firestore server-side for integrity
      try {
        const sessionRef = db.collection("users").doc(userId).collection("sessions").doc(sessionId);
        const messagesRef = sessionRef.collection("messages");

        // Save Assistant Message
        const assistantDoc = await messagesRef.add({
          content: assistantText,
          role: "assistant",
          timestamp: FieldValue.serverTimestamp()
        });

        // Update session summary if it's still the default or placeholder
        const sessionDoc = await sessionRef.get();
        const currentSummary = sessionDoc.data()?.summary;
        const placeholders = ["New Reflection", "New Journal", "Active Journal", "Untitled journal", "Untitled Session"];
        if (!currentSummary || placeholders.includes(currentSummary)) {
          try {
            const summaryPrompt = [
              { role: "user", content: `Provide a very short, 3-5 word summary for this journal: "${messages[messages.length-1].content}"` }
            ];
            const summary = await generateGeminiResponse(summaryPrompt);
            await sessionRef.update({
              summary: summary.replace(/["']/g, "").trim(),
              updatedAt: FieldValue.serverTimestamp()
            });
          } catch (e) {
            console.error("[Firestore] Summary generation failed:", e);
            await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });
          }
        } else {
          await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });
        }

        res.json({ 
          messageId: assistantDoc.id,
          content: assistantText 
        });
      } catch (dbErr: any) {
        console.error("[Firestore] Write error:", dbErr);
        // Fallback: still send assistant text if only DB fails
        res.json({ content: assistantText });
      }

    } catch (error: any) {
      console.error("[Chat API] Critical Error:", error);
      res.status(500).json({ 
        error: "Internal Server Error",
        message: error.message 
      });
    }
  });

  app.post("/api/interact", async (req, res) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const { userId, action, context, query } = body;

      if (!userId || !action || !context) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify user
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      if (!adminApp) return res.status(503).json({ error: "Auth service unavailable" });
      const auth = getAuth(adminApp);
      const decodedToken = await auth.verifyIdToken(idToken);
      if (decodedToken.uid !== userId) return res.status(403).json({ error: "Forbidden" });

      let prompt = "";
      switch (action) {
        case "summarize":
          prompt = `As a supportive journal assistant, provide a concise summary of this journal entry. Use 2-3 bullet points to highlight the core themes or feelings: "${context}"`;
          break;
        case "ask":
          prompt = `Based on this journal entry: "${context}", please answer this question: "${query}"`;
          break;
        case "go-deeper":
          prompt = `Based on this journal entry: "${context}", ask 2 thought-provoking questions that help the writer explore their feelings more deeply.`;
          break;
        case "coach-me":
          prompt = `As an empathetic coach, read this journal entry: "${context}". Provide a brief piece of encouragement and one small, actionable step the writer could take today.`;
          break;
        case "get-perspective":
          prompt = `Read this journal entry: "${context}". Provide a gentle, alternative perspective or a positive reframing of the situation mentioned.`;
          break;
        case "past-patterns":
          prompt = `Based on this journal entry: "${context}", identify any recurring emotional patterns or cognitive biases you notice. Mention them gently.`;
          break;
        default:
          prompt = `Read this journal entry: "${context}" and provide supportive feedback.`;
      }

      const aiResponse = await generateGeminiResponse([{ role: "user", content: prompt }]);
      res.json({ content: aiResponse });

    } catch (error: any) {
      console.error("[Interact API] Error:", error);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Catch-all route for SPA in production
    app.get("*", (req, res, next) => {
      // If it starts with /api, it's a missing API route, don't serve index.html
      if (req.url.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("!!! CRITICAL SERVER ERROR !!!");
    console.error("Method:", req.method);
    console.error("URL:", req.url);
    console.error("Error:", err);
    
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      path: req.url
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Mindly AI backend running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Server failed to start:", err);
});
