import { CODE_OUTPUT_INSTRUCTION, VITE_PROMPT } from "./prompts";
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { GroqService } from "./services/groqService";
import { createClient } from "@supabase/supabase-js";
import { requestLogger } from "./middleware/logger";
import { prisma } from "./lib/prisma";
import archiver from "archiver";

const app = express();
const port = process.env.PORT || 8080;

// --- CONFIG: Allowed Origins ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-create-updated-18vauinku-sameers-projects-3ce6a679.vercel.app",
  "https://project-create-updated.vercel.app"
];

// Initialize Services
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
let groqService: GroqService;

try {
  groqService = new GroqService();
  console.log("✓ Groq Service initialized");
} catch (error) {
  console.error("Failed to initialize Groq:", error);
  process.exit(1);
}

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
app.use(requestLogger);

// --- HELPER: Verify Auth Token ---
const verifyUser = async (token: string) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
};

// --- ROUTES ---

// 1. GENERATE CODE
app.post("/template", async (req: Request, res: Response) => {
  try {
    const { prompt, groqApiKey } = req.body;
    const service = groqApiKey ? GroqService.createWithKey(groqApiKey) : groqService;
    const templateType = await service.getTemplate(prompt);
    res.json({
      prompt: [VITE_PROMPT],
      uiPrompt: templateType // 'react' or 'node'
    });
  } catch (error) {
    res.status(500).json({ error: "Template generation failed" });
  }
});

app.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, groqApiKey } = req.body;
    const service = groqApiKey ? GroqService.createWithKey(groqApiKey) : groqService;
    const responseText = await service.getContent(message);
    
    let finalResponse = responseText;
    if (!responseText.includes("<boltArtifact")) {
      finalResponse = `<boltArtifact id="project" title="Project">${responseText}</boltArtifact>`;
    }
    
    res.json({ response: finalResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Generation failed" });
  }
});

// 2. SAVE PROJECT
app.post("/projects", async (req: Request, res: Response) => {
  try {
    const { prompt, files, steps, llmHistory, title } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    let userId = null;
    if (token) {
      const user = await verifyUser(token);
      if (user) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email! },
          update: {},
          create: { id: user.id, email: user.email! }
        });
        userId = dbUser.id;
      }
    }

    const project = await prisma.project.create({
      data: {
        title: title || prompt.substring(0, 30) + "...",
        prompt,
        files,
        steps,
        llmHistory,
        userId
      }
    });

    res.json({ success: true, id: project.id });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: "Failed to save project" });
  }
});

// 3. GET PROJECT (Load)
app.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      // @ts-ignore
      where: { id: req.params.id }
    });
    
    if (!project) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Load failed" });
  }
});

// 4. GET USER PROJECTS (Dashboard)
app.get("/my-projects", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await verifyUser(token);
    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, title: true, prompt: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 5. DOWNLOAD PROJECT AS ZIP (FIXED)
app.get("/projects/:id/download", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      // @ts-ignore
      where: { id: req.params.id }
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Initialize ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set Headers
    const safeTitle = (project.title || "project").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // --- RECURSIVE FILE ADDER ---
    // Handles the nested structure from your frontend (children array)
    const addFilesToArchive = (items: any[]) => {
      items.forEach((item) => {
        if (item.type === 'file') {
          // Add file to zip
          // item.path is typically "src/App.tsx", so we use that as the name
          archive.append(item.content || "", { name: item.path });
        } else if (item.type === 'folder' && item.children) {
          // Recurse into folders
          addFilesToArchive(item.children);
        }
      });
    };

    // Parse files (Prisma stores JSON as any/object, so we cast it)
    const filesArray = Array.isArray(project.files) ? project.files : [];
    
    if (filesArray.length > 0) {
      addFilesToArchive(filesArray);
    } else {
      // Fallback if files are empty
      archive.append("# No files found", { name: "README.md" });
    }

    // Finalize
    await archive.finalize();

  } catch (error) {
    console.error("Download Error:", error);
    // Only send error if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed" });
    }
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));