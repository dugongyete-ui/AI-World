import { Router } from "express";
import { worldState } from "../world/state.js";

const router = Router();

router.get("/constitution", (_req, res) => {
  res.json({
    articles: worldState.constitution,
    version: 1 + worldState.constitution.filter((a) => a.amendedBy !== null).length,
    lastAmended: worldState.constitution
      .filter((a) => a.amendedAt !== null)
      .sort((a, b) => (b.amendedAt || "").localeCompare(a.amendedAt || ""))[0]?.amendedAt || new Date().toISOString(),
  });
});

router.get("/proposals", (_req, res) => {
  res.json(worldState.proposals.slice(0, 30));
});

export default router;
