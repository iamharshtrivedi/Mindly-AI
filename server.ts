import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

// ESM compatibility for __dirname
let _dirname = "";
try {
  // @ts-ignore - import.meta is ESM only
  if (import.meta && import.meta.url) {
    const _filename = fileURLToPath(import.meta.url);
    _dirname = path.dirname(_filename);
  }
} catch (e) {
  // Expected to fail in CJS
}

// Use a unique name to avoid conflict with Node's global __dirname in CJS
const getActualDirname = () => {
  try {
    // @ts-ignore - __dirname is CJS only
    return __dirname;
  } catch (e) {
    return _dirname;
  }
};

const currentDir = getActualDirname();

// Initialize Firebase Admin
function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error("[Firebase] FIREBASE_PROJECT_ID is missing from environment");
    return null;
  }
  try {
    const app = initializeApp({
      projectId: projectId
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
  const databaseId = process.env.FIREBASE_DATABASE_ID;
  if (!databaseId) {
    console.error("[Firebase] FIREBASE_DATABASE_ID is missing from environment");
    return null;
  }
  try {
    return getFirestore(adminApp, databaseId);
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

  // Health check for GFE/Cloud Run
  app.get("/_health", (req, res) => res.send("ok"));

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    const root = process.cwd();
    const distPath = path.join(root, "dist");
    const indexPath = path.join(distPath, "index.html");
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      firebaseInitialized: !!adminApp,
      env: process.env.NODE_ENV || 'unknown',
      cwd: root,
      distPath,
      indexExists: fs.existsSync(indexPath),
      distFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : [],
      rootFiles: fs.readdirSync(root)
    });
  });

  app.get("/api/ping", (req, res) => {
    res.send("pong");
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

      const assistantText = await generateGeminiResponse(messages);
      
      if (db) {
        try {
          const sessionRef = db.collection("users").doc(userId).collection("sessions").doc(sessionId);
          await sessionRef.collection("messages").add({
            content: assistantText,
            role: "assistant",
            timestamp: FieldValue.serverTimestamp()
          });
          await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });
        } catch (e) {
          console.error("[Firestore] Write failed:", e);
        }
      }

      res.json({ content: assistantText });
    } catch (error: any) {
      console.error("[Chat API] Error:", error);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
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

  // Serve static files
  const isProd = process.env.NODE_ENV === "production";
  const root = process.cwd();
  const distPath = path.join(root, "dist");

  console.log(`[Server] Mode: ${isProd ? "PRODUCTION" : "DEVELOPMENT"}`);
  console.log(` - Root: ${root}`);
  console.log(` - Dist: ${distPath}`);
  
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("[Server] Vite failed, falling back to static serving");
      mountStatic(app, distPath);
    }
  } else {
    mountStatic(app, distPath);
  }

  function mountStatic(app: express.Express, staticPath: string) {
    console.log(`[Server] Mounting static files from: ${staticPath}`);
    app.use(express.static(staticPath));

    app.get("*", (req, res, next) => {
      if (req.url.startsWith("/api") || req.url === "/_health") return next();
      
      const indexPath = path.join(staticPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[Server] Index not found at ${indexPath}`);
        // Diagnostic fallback for the user
        res.status(404).json({
          error: "Application shell missing",
          expectedPath: indexPath,
          cwd: process.cwd(),
          distExists: fs.existsSync(staticPath),
          distFiles: fs.existsSync(staticPath) ? fs.readdirSync(staticPath) : [],
          rootFiles: fs.readdirSync(process.cwd())
        });
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server failed:", err);
});
