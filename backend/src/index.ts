import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

import { BASE_PROMPT, getSystemPrompt } from "./prompts";
require("dotenv").config();
import express from "express";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
const app = express();
app.use(express.json());

import cors from 'cors';



app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

const apiKey: any = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: getSystemPrompt(),
});

const generationConfig = {
  temperature: 0.88,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8000,
  responseMimeType: "text/plain",
};

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "Return either 'node' or 'react' based on what does user wants about project. does not return anything else.",
  });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  if (responseText.includes("react")) {
    res.json({
      prompt: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompt: reactBasePrompt,
    });
  } else if (responseText.includes("node")) {
    res.json({
      prompt: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompt: nodeBasePrompt,
    });
  } else {
    res.status(400).json({ error: "Failed to determine the framework" });
  }
});

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:getSystemPrompt(),
  });
  const result = await model.generateContent({contents: [message]});
  const responseText = result.response.text();
  res.json({ response: responseText });

});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
