import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import Auth Models (Replit Auth Blueprint)
export * from "./models/auth";
import { users } from "./models/auth";

// === WASTE MANAGEMENT TABLES ===

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Citizen who reported
  imageUrl: text("image_url").notNull(),
  redactedImageUrl: text("redacted_image_url"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  location: text("location"), // Human readable address
  
  // Priorities
  reportedPriority: integer("reported_priority").default(1), // 1-5 from user
  calculatedPriority: real("calculated_priority"), // Eq 14: ML Predicted
  
  // Status & Metadata
  status: text("status", { enum: ['pending', 'in_progress', 'collected', 'verified'] }).default('pending'),
  privacyData: jsonb("privacy_data"), // Stores bounding boxes { faces: [], plates: [] }
  
  createdAt: timestamp("created_at").defaultNow(),
  collectedAt: timestamp("collected_at"),
});

export const optimizationRoutes = pgTable("optimization_routes", {
  id: serial("id").primaryKey(),
  collectorId: varchar("collector_id").references(() => users.id),
  
  // The optimized sequence of task IDs
  assignedTasks: jsonb("assigned_tasks").$type<number[]>(), 
  
  // Metrics from Eq 22
  totalDistance: real("total_distance"),
  efficiencyScore: real("efficiency_score"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const strikes = pgTable("strikes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const tasksRelations = relations(tasks, ({ one }) => ({
  reporter: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const routesRelations = relations(optimizationRoutes, ({ one }) => ({
  collector: one(users, {
    fields: [optimizationRoutes.collectorId],
    references: [users.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true, 
  createdAt: true, 
  collectedAt: true,
  calculatedPriority: true,
  status: true 
});

export const insertRouteSchema = createInsertSchema(optimizationRoutes).omit({
  id: true,
  createdAt: true
});

// === TYPES ===
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type OptimizationRoute = typeof optimizationRoutes.$inferSelect;

// Request Types
export type CreateTaskRequest = InsertTask;
export type UpdateTaskStatusRequest = { status: Task['status'] };
export type GenerateRouteRequest = { 
  collectorLocation: { lat: number, lng: number },
  maxTasks?: number 
};

// Response Types
export interface PrivacyDetectionResponse {
  detected: boolean;
  risks: { type: 'face' | 'plate' | 'text', box: number[], confidence: number }[];
  redactedImageUrl?: string;
}
