import { users, tasks, optimizationRoutes, strikes, type User, type InsertUser, type Task, type InsertTask, type OptimizationRoute, type InsertRoute } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users (Auth handled separately but good to have access)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasks(status?: Task['status']): Promise<Task[]>;
  updateTaskStatus(id: number, status: Task['status']): Promise<Task>;
  updateTaskPriority(id: number, priority: number): Promise<Task>;

  // Routes
  createRoute(route: InsertRoute): Promise<OptimizationRoute>;
  getRoutes(collectorId?: string): Promise<OptimizationRoute[]>;
  getRoute(id: number): Promise<OptimizationRoute | undefined>;

  // Strikes
  addStrike(userId: string, taskId: number, reason: string): Promise<void>;
  getStrikes(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // === USERS ===
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // === TASKS ===
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasks(status?: Task['status']): Promise<Task[]> {
    if (status) {
      return db.select().from(tasks).where(eq(tasks.status, status)).orderBy(desc(tasks.createdAt));
    }
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async updateTaskStatus(id: number, status: Task['status']): Promise<Task> {
    const [updated] = await db.update(tasks)
      .set({ status, collectedAt: status === 'collected' ? new Date() : undefined })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async updateTaskPriority(id: number, priority: number): Promise<Task> {
    const [updated] = await db.update(tasks)
      .set({ calculatedPriority: priority })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  // === ROUTES ===
  async createRoute(route: InsertRoute): Promise<OptimizationRoute> {
    const [newRoute] = await db.insert(optimizationRoutes).values(route).returning();
    return newRoute;
  }

  async getRoutes(collectorId?: string): Promise<OptimizationRoute[]> {
    if (collectorId) {
      return db.select().from(optimizationRoutes).where(eq(optimizationRoutes.collectorId, collectorId)).orderBy(desc(optimizationRoutes.createdAt));
    }
    return db.select().from(optimizationRoutes).orderBy(desc(optimizationRoutes.createdAt));
  }

  async getRoute(id: number): Promise<OptimizationRoute | undefined> {
    const [route] = await db.select().from(optimizationRoutes).where(eq(optimizationRoutes.id, id));
    return route;
  }

  // === STRIKES ===
  async addStrike(userId: string, taskId: number, reason: string): Promise<void> {
    await db.insert(strikes).values({ userId, taskId, reason });
  }

  async getStrikes(userId: string): Promise<number> {
    const results = await db.select().from(strikes).where(eq(strikes.userId, userId));
    return results.length;
  }
}

export const storage = new DatabaseStorage();
