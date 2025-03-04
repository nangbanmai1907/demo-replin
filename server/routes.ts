import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = insertTaskSchema.parse(req.body);
      const created = await storage.createTask(task);
      res.json(created);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: err.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
      const updates = insertTaskSchema.partial().parse(req.body);
      const updated = await storage.updateTask(id, updates);
      if (!updated) {
        res.status(404).json({ message: "Task not found" });
      } else {
        res.json(updated);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: err.errors });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const deleted = await storage.deleteTask(id);
    if (!deleted) {
      res.status(404).json({ message: "Task not found" });
    } else {
      res.json({ success: true });
    }
  });

  return createServer(app);
}
