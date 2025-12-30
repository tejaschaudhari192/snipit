import Groq from "groq-sdk";
import type { Request, Response } from "express";
import configurations from "@/config/configurations.js";

const apiKey = configurations.groq_api_key;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set in the environment variables");
}

const groq = new Groq({ apiKey });

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
      "shell",
      "bash",
      "other",
      "text",
    ];

    const prompt = `Analyze the following text/code and detect its programming language or format.
Return ONLY one of the following strings: ${validLanguages.join(", ")}.
If it is code but doesn't match any specific language listed above, return 'other'.
If it is clearly plain text (like a note or message), return 'text'.

Code snippet:
${content.slice(0, 1000)}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    let language = "text";
    if (chatCompletion.choices[0]?.message?.content) {
      language = chatCompletion.choices[0].message.content;
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
