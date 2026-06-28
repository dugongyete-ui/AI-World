import { Router } from "express";
import { worldState } from "../world/state.js";

const router = Router();

router.get("/blogs", (req, res) => {
  const agentId = req.query.agentId as string | undefined;
  let blogs = worldState.blogs;
  if (agentId) blogs = blogs.filter((b) => b.authorId === agentId);
  res.json(blogs.slice(0, 30));
});

router.get("/billboard", (_req, res) => {
  res.json(worldState.billboards.slice(0, 20));
});

router.get("/activity", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  res.json(worldState.activities.slice(0, limit));
});

export default router;
