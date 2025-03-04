import { tasks, type Task, type InsertTask } from "@shared/schema";
import { prayers, type Prayer, type InsertPrayer } from "@shared/schema";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getPrayers(): Promise<Prayer[]>;
  getPrayer(id: number): Promise<Prayer | undefined>;
  createPrayer(prayer: InsertPrayer): Promise<Prayer>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private prayers: Map<number, Prayer>;
  private currentId: number;

  constructor() {
    this.tasks = new Map();
    this.prayers = new Map();
    this.currentId = 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getPrayers(): Promise<Prayer[]> {
    return Array.from(this.prayers.values());
  }

  async getPrayer(id: number): Promise<Prayer | undefined> {
    return this.prayers.get(id);
  }

  async createPrayer(insertPrayer: InsertPrayer): Promise<Prayer> {
    const id = this.currentId++;
    const prayer: Prayer = { ...insertPrayer, id };
    this.prayers.set(id, prayer);
    return prayer;
  }
}

export const storage = new MemStorage();