import { Router } from "express";
import { worldState } from "../world/state.js";

const router = Router();

router.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const locationId = req.query.locationId as string | undefined;
  let convs = worldState.conversations;
  if (locationId) convs = convs.filter((c) => c.location === locationId);
  res.json(convs.slice(0, limit));
});

router.get("/live", (_req, res) => {
  // "Live" conversations = last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const live = worldState.conversations.filter((c) => c.timestamp >= fiveMinAgo);
  res.json(live);
});

export default router;
