import { pgTable, text, timestamp, boolean, uuid, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  aiName: text("ai_name"),
  voiceId: text("voice_id"),
  onboarded: boolean("onboarded").notNull().default(false),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memoriesTable = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("user"),
  content: text("content").notNull(),
  category: text("category").notNull().default("chat"),
  tags: text("tags").array().default([]),
  relevance: real("relevance").notNull().default(0.75),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMemorySchema = createInsertSchema(memoriesTable).omit({ id: true });
export type Memory = typeof memoriesTable.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;

export const insertProfileSchema = createInsertSchema(profilesTable);
export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true });

export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
