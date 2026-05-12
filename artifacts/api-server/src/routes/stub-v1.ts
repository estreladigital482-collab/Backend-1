import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/v1/abilities/list", (_req, res) => res.json({ abilities: [] }));
router.post("/v1/abilities/add", (_req, res) => res.json({ success: true }));
router.post("/v1/abilities/search", (_req, res) => res.json({ results: [] }));
router.get("/v1/actions/pending", (_req, res) => res.json({ actions: [] }));
router.post("/v1/actions/:id/approve", (_req, res) => res.json({ success: true }));
router.post("/v1/actions/:id/reject", (_req, res) => res.json({ success: true }));
router.get("/v1/costs/summary", (_req, res) => res.json({ total: 0, currency: "USD" }));
router.get("/v1/costs/trends", (_req, res) => res.json({ trends: [] }));
router.get("/v1/costs/alerts", (_req, res) => res.json({ alerts: [] }));
router.get("/v1/costs/free-alternatives", (_req, res) => res.json({ alternatives: [] }));
router.get("/v1/device/profile", (_req, res) => res.json({ device: null }));
router.get("/v1/device/sync/status", (_req, res) => res.json({ status: "idle" }));
router.post("/v1/device/optimize", (_req, res) => res.json({ success: true }));
router.get("/v1/memory/list", (_req, res) => res.json({ memories: [] }));
router.delete("/v1/memory/:id", (_req, res) => res.json({ success: true }));
router.get("/v1/planning/plans/:userId", (_req, res) => res.json({ plans: [] }));
router.post("/v1/planning/plans", (_req, res) => res.json({ success: true }));
router.get("/v1/security/issues", (_req, res) => res.json({ issues: [] }));
router.get("/v1/security/summary", (_req, res) => res.json({ score: 100, issues: 0 }));
router.post("/v1/security/audit", (_req, res) => res.json({ success: true }));
router.patch("/v1/security/issues/:id/status", (_req, res) => res.json({ success: true }));
router.get("/v1/social/instagram/collections", (_req, res) => res.json({ collections: [] }));
router.get("/v1/social/instagram/sync", (_req, res) => res.json({ success: true, items: [] }));
router.post("/v1/social/instagram/login", (_req, res) => res.json({ success: false, message: "Não disponível neste plano" }));
router.get("/v1/social/instagram/recommendations", (_req, res) => res.json({ recommendations: [] }));
router.post("/v1/memory", (_req, res) => res.json({ success: true, id: null }));
router.get("/v1/search", (_req, res) => res.json({ results: [] }));

export default router;
