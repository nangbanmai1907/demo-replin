import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: integer("priority").notNull().default(1),
  category: text("category").notNull().default("general"),
  completed: boolean("completed").notNull().default(false),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true })
  .extend({
    dueDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
  });

export const priorities = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" }
] as const;

export const defaultCategories = [
  "general",
  "work",
  "personal",
  "shopping",
  "health"
] as const;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  prayerType: text("prayer_type").notNull(), // "alive" for cầu an, "deceased" for cầu siêu
  birthYear: integer("birth_year").notNull(),
  address: text("address"),
  deathYear: integer("death_year"),
  burialLocation: text("burial_location"),
});

export const insertPrayerSchema = createInsertSchema(prayers)
  .omit({ id: true })
  .refine(
    (data) => {
      if (data.prayerType === "deceased") {
        return !!data.deathYear && !!data.burialLocation;
      }
      return true;
    },
    {
      message: "Cầu siêu cần điền năm mất và nơi an táng",
    }
  );

export type InsertPrayer = z.infer<typeof insertPrayerSchema>;
export type Prayer = typeof prayers.$inferSelect;