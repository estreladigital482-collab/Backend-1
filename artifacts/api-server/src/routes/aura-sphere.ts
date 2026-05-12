import { Router, type IRouter } from "express";
import { db, profilesTable, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

function resolveUserId(req: any, res: any): string | null {
  const auth = getAuth(req);
  if (auth?.userId) return auth.userId;
  const fromQuery = req.query?.user_id as string | undefined;
  const fromBody = req.body?.id as string | undefined;
  const candidate = fromQuery || fromBody;
  if (candidate?.startsWith("local_") || candidate?.startsWith("demo_")) return candidate;
  return null;
}

function assertOwnership(req: any, res: any, requestedUserId: string): boolean {
  const auth = getAuth(req);
  if (auth?.userId) {
    if (auth.userId !== requestedUserId) {
      res.status(403).json({ error: "Forbidden" });
      return false;
    }
    return true;
  }
  if (requestedUserId.startsWith("local_") || requestedUserId.startsWith("demo_")) return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}

// Profiles
router.get("/profiles/:id", async (req, res) => {
  try {
    if (!assertOwnership(req, res, req.params.id)) return;
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
    if (!id) { res.status(400).json({ error: "id required" }); return; }
    if (!assertOwnership(req, res, id)) return;
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
    if (!assertOwnership(req, res, user_id)) return;
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
    if (!assertOwnership(req, res, user_id)) return;
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
    if (!assertOwnership(req, res, user_id)) return;
    await db.delete(chatMessagesTable).where(eq(chatMessagesTable.userId, user_id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting chat messages");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
