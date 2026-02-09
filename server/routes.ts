import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

// OpenAI Client for Vision
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === PRIVACY API (YOLO/Vision Simulation) ===
  app.post(api.privacy.check.path, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      // Call OpenAI GPT-4o-mini (Vision) to detect PII
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a Privacy Protection AI for a waste management app. 
            Analyze the image for: 
            1. Faces
            2. License Plates
            3. Readable Home Addresses
            
            Return JSON in this format:
            {
              "detected": boolean,
              "risks": [
                { "type": "face" | "plate" | "text", "box": [ymin, xmin, ymax, xmax], "confidence": number }
              ]
            }
            The box coordinates should be 0-1000 scale.
            If safe, detected: false.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Scan this image for privacy risks." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json(result);

    } catch (error) {
      console.error("Privacy Check Error:", error);
      res.status(500).json({ message: "AI Analysis Failed" });
    }
  });

  // === TASKS API ===
  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      
      // Auto-calculate initial priority (Eq 14 simplified)
      // P = reported_priority (for now)
      const calculatedPriority = input.reportedPriority || 1;
      
      const taskData = {
        ...input,
        calculatedPriority,
        // For MVP, we use the raw image as redacted if no reduction actually happened on backend
        // Ideally, we'd use Canvas/JimP here to blur based on privacyData boxes
        redactedImageUrl: input.imageUrl, 
      };

      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.tasks.list.path, async (req, res) => {
    const status = req.query.status as any;
    const tasks = await storage.getTasks(status);
    res.json(tasks);
  });

  app.patch(api.tasks.updateStatus.path, async (req, res) => {
    const status = req.body.status;
    const task = await storage.updateTaskStatus(Number(req.params.id), status);
    res.json(task);
  });

  // === ROUTING API (Eq 22) ===
  app.post(api.routes.generate.path, async (req, res) => {
    const { collectorLat, collectorLng } = req.body;
    
    // 1. Get Pending Tasks
    const tasks = await storage.getTasks('pending');
    
    if (tasks.length === 0) {
      return res.status(400).json({ message: "No pending tasks to route." });
    }

    // 2. Calculate Effective Cost (C_eff) for each task
    // Eq 22: C_eff = distance / (priority ^ gamma)
    const gamma = 2.0; // Tuning parameter
    
    const tasksWithScore = tasks.map(task => {
      // Haversine Distance
      const R = 6371e3; // metres
      const φ1 = collectorLat * Math.PI/180;
      const φ2 = task.lat * Math.PI/180;
      const Δφ = (task.lat - collectorLat) * Math.PI/180;
      const Δλ = (task.lng - collectorLng) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // in meters

      // Priority Weighting
      const P = task.calculatedPriority || 1;
      
      // Avoid division by zero
      const denominator = Math.pow(P, gamma);
      const cEff = distance / denominator;
      
      return { ...task, cEff, distance };
    });
    
    // 3. Sort by C_eff (Greedy Approach)
    tasksWithScore.sort((a, b) => a.cEff - b.cEff);
    
    // 4. Create Route Object
    const assignedTaskIds = tasksWithScore.map(t => t.id);
    const totalDist = tasksWithScore.reduce((sum, t) => sum + t.distance, 0);
    
    // Efficiency Score (avg C_eff inverse?) - just a mock metric for now
    const efficiencyScore = 10000 / (totalDist / tasks.length); 

    const route = await storage.createRoute({
      collectorId: 'demo-collector', // MVP: hardcode or use auth user
      assignedTasks: assignedTaskIds,
      totalDistance: totalDist,
      efficiencyScore: efficiencyScore
    });

    res.status(201).json({
      route,
      tasks: tasksWithScore
    });
  });

  // === SEED DATA ===
  (async () => {
    try {
      const demoUserId = "demo-user";
      
      // 1. Ensure Demo User Exists
      let demoUser = await storage.getUser(demoUserId);
      if (!demoUser) {
        console.log("Creating demo user...");
        try {
          // Use DB directly to force ID insertion if storage doesn't support it
          // Or just use storage.createUser if it allows ID (usually InsertUser doesn't have ID)
          // Let's use a raw insert or storage extension
          // Actually, let's just create a user normally and use THAT id for tasks
          // But to keep it consistent across restarts without finding it by username, 
          // let's try to find by username "demo"
          
          let user = await storage.getUserByUsername("demo");
          if (!user) {
             user = await storage.createUser({
               username: "demo",
               password: "password123" // In real app, hash this! Replit Auth ignores password usually
             });
          }
          // Use the real ID
          const realDemoId = user.id;
          
          // Now create tasks with REAL ID
          const tasks = await storage.getTasks();
          if (tasks.length === 0) {
             console.log("Seeding Tasks...");
             await storage.createTask({
               imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=2000",
               lat: 40.7128,
               lng: -74.0060,
               reportedPriority: 5,
               calculatedPriority: 5,
               status: "pending",
               location: "123 Broadway, NYC",
               privacyData: { detected: false, risks: [] },
               userId: realDemoId
             });
             await storage.createTask({
               imageUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&q=80&w=2000",
               lat: 40.7138,
               lng: -74.0070,
               reportedPriority: 3,
               calculatedPriority: 3.2,
               status: "pending",
               location: "Central Park West",
               privacyData: { detected: true, risks: [{ type: "face", box: [100, 100, 200, 200], confidence: 0.9 }] },
               userId: realDemoId
             });
             console.log("Seed complete");
          }
        } catch (e) {
          console.error("Seed error:", e);
        }
      }
    } catch (e) {
      console.error("Seed wrapper error:", e);
    }
  })();

  return httpServer;
}
