import { Router, type IRouter } from "express";
import { db, profilesTable, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Profiles
router.get("/profiles/:id", async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, req.params.id))
      .limit(1);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Error fetching profile");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/profiles", async (req, res) => {
  try {
    const { id, ai_name, voice_id, onboarded, display_name } = req.body;
    const [profile] = await db
      .insert(profilesTable)
      .values({ id, aiName: ai_name, voiceId: voice_id, onboarded: onboarded ?? false, displayName: display_name })
      .onConflictDoUpdate({
        target: profilesTable.id,
        set: {
          aiName: ai_name,
          voiceId: voice_id,
          onboarded: onboarded ?? false,
          displayName: display_name,
          updatedAt: new Date(),
        },
      })
      .returning();
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Error upserting profile");
    res.status(500).json({ error: "Internal error" });
  }
});

// Chat Messages
router.get("/chat-messages", async (req, res) => {
  try {
    const { user_id, offset, limit } = req.query;
    if (!user_id || typeof user_id !== "string") {
      res.status(400).json({ error: "user_id required" });
      return;
    }
    const off = offset ? parseInt(String(offset), 10) : 0;
    const lim = limit ? Math.min(parseInt(String(limit), 10), 100) : 50;
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.userId, user_id))
      .orderBy(chatMessagesTable.createdAt)
      .offset(off)
      .limit(lim);
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Error fetching chat messages");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/chat-messages", async (req, res) => {
  try {
    const { user_id, role, content, created_at } = req.body;
    if (!user_id || !role || !content) {
      res.status(400).json({ error: "user_id, role, and content are required" });
      return;
    }
    const [message] = await db
      .insert(chatMessagesTable)
      .values({
        userId: user_id,
        role,
        content,
        createdAt: created_at ? new Date(created_at) : new Date(),
      })
      .returning();
    res.status(201).json(message);
  } catch (err) {
    req.log.error({ err }, "Error inserting chat message");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/chat-messages", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id || typeof user_id !== "string") {
      res.status(400).json({ error: "user_id required" });
      return;
    }
    await db.delete(chatMessagesTable).where(eq(chatMessagesTable.userId, user_id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting chat messages");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
