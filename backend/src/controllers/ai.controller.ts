import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";
import configurations from "@/config/configurations.js";

const apiKey = configurations.gemini_api_key;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables");
}

const genAI = new GoogleGenAI({ apiKey });

export const detectLanguage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const validLanguages = [
      "javascript",
      "typescript",
      "html",
      "css",
      "json",
      "java",
      "python",
      "c",
      "cpp",
      "csharp",
      "go",
      "rust",
      "markdown",
      "text",
    ];

    const prompt = `
            Analyze the following text/code and detect its programming language or format.
            Return ONLY one of the following strings: ${validLanguages.join(", ")}.
            If it is plain text or doesn't match a code format, return 'text'.
            
            Code snippet:
            ${content.slice(0, 1000)}
        `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let language = "text";
    if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      language = result.candidates[0].content.parts[0].text;
    }

    language = language.trim().toLowerCase();

    // Clean up any potential extra characters (like markdown code blocks if the model outputs them)
    language = language.replace(/```/g, "").trim();

    if (!validLanguages.includes(language)) {
      language = "text";
    }

    res.json({ language });
  } catch (error) {
    console.error("Error detecting language:", error);
    res.status(500).json({ error: "Failed to detect language" });
  }
};
