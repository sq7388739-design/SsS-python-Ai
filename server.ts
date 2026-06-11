import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of Gemini client to prevent crash on empty API key
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.");
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Main Gemini endpoint for Code Explanation, Execution Debugging, Coding Help and General Chat
  app.post("/api/gemini", async (req, res) => {
    try {
      const { type, code, error, message, history, lang = "ar" } = req.body;
      const ai = getGeminiClient();

      let systemInstruction = "";
      let prompt = "";

      if (type === "explain") {
        systemInstruction = lang === "ar" 
          ? "أنت مبرمج بايثون خبير ومعلم رائع. اشرح كود البايثون المقدم بطريقة سهلة ومبسطة للمبتدئين مع إبراز المفاهيم الأساسية، وجعل الشرح باللغة العربية البسيطة والممتعة مع تنسيق جميل بالـ Markdown."
          : "You are an expert Python tutor and programmer. Explain the provided Python code in simple terms for a beginner, highlighting the key concepts (variables, loops, logic, etc.). Output must be formatted nicely with Markdown.";
        prompt = `Explain this Python code:\n\n\`\`\`python\n${code}\n\`\`\``;
      } else if (type === "debug") {
        systemInstruction = lang === "ar"
          ? "أنت مبرمج بايثون ذكي ومساعد مراجعة الأخطاء. تفحص كود البايثون والخطأ البرمجي الناتج أدناه. اشرح سبب الخطأ بلغة عربية واضحة وقدم الحل البرمجي الصحيح بشكل كامل داخل قالب كود Markdown لتسهل نسخه."
          : "You are an expert Python debugger. Map the given traceback error to the user's Python code. Explain exactly what caused the crash, how to fix it, and provide the fully corrected operational code inside a markdown code block.";
        prompt = `Code:\n\`\`\`python\n${code}\n\`\`\`\n\nTraceback / Error:\n${error}`;
      } else if (type === "suggest_challenge_hint") {
        systemInstruction = lang === "ar"
          ? "أنت معلم بايثون ودود. يريد المستخدم تلميحاً لحل التحدي البرمجي المعطى. لا تكتب الكود البرمجي لحل التحدي مباشرة! بل وجه مهارات المستخدم الفكرية عبر شرح الفكرة والخوارزمية وكيف يبدأ بالتنسيق العربي الجميل."
          : "You are a warm Python teacher. Give the user a hint or algorithmic strategy to solve the coding challenge. Do NOT write the complete solution code! Guide them conceptually on how to approach the code structure in English.";
        prompt = `Challenge: ${req.body.challengeTitle}\nDescription: ${req.body.challengeDescription}\nUser's Current Code:\n\`\`\`python\n${code}\n\`\`\``;
      } else if (type === "chat") {
        systemInstruction = lang === "ar"
          ? "أنت مساعد ذكي ومتخصص في لغة بايثون برمجةً وتعليماً. أجب على أسئلة المستخدم حول بايثون بطريقة عملية وتفاعلية وجذابة للغاية باللغة العربية مع نماذج كود منسقة."
          : "You are an intelligent Python programming assistant. Help the user with any Python-related questions, explain syntax or libraries, write small snippets, and be extremely educational and engaging.";
        
        // Setup simple history conversation or prompt
        const formattedHistory = Array.isArray(history)
          ? history.map((h: any) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n")
          : "";
        prompt = formattedHistory
          ? `${formattedHistory}\nUser: ${message}\nAssistant:`
          : message;
      } else {
        return res.status(400).json({ error: "Invalid request type." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ response: response.text });
    } catch (err: any) {
      console.error("Gemini route error:", err);
      res.status(500).json({ 
        error: err.message || "An error occurred while calling the Gemini API. Ensure the GEMINI_API_KEY is configured." 
      });
    }
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start express server:", err);
});
