import { pgTable, text, timestamp, boolean, uuid, real, integer } from "drizzle-orm/pg-core";
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

export const skillsTable = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("geral"),
  icon: text("icon").notNull().default("⚡"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(100),
  knowledge: text("knowledge").notNull().default(""),
  status: text("status").notNull().default("ready"),
  isEquipped: boolean("is_equipped").notNull().default(false),
  fusionParents: text("fusion_parents").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSkillSchema = createInsertSchema(skillsTable).omit({ id: true, createdAt: true });
export type Skill = typeof skillsTable.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export const insertProfileSchema = createInsertSchema(profilesTable);
export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true });

export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
