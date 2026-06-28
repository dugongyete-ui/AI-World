import { Router } from "express";
import { worldState } from "../world/state.js";

const router = Router();

router.get("/", (_req, res) => {
  const agents = Array.from(worldState.agents.values()).map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    location: a.location,
    position: a.position,
    mood: a.mood,
    energy: a.energy,
    credits: a.credits,
    isCurrentTurn: a.isCurrentTurn,
    lastAction: a.lastAction,
    lastSpeech: a.lastSpeech,
    animation: a.animation,
    color: a.color,
    portrait: a.portrait,
  }));
  res.json(agents);
});

router.get("/:agentId", (req, res) => {
  const agent = worldState.agents.get(req.params.agentId);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.json({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    personality: agent.personality,
    northStar: agent.northStar,
    location: agent.location,
    position: agent.position,
    mood: agent.mood,
    energy: agent.energy,
    knowledge: agent.knowledge,
    influence: agent.influence,
    credits: agent.credits,
    isCurrentTurn: agent.isCurrentTurn,
    lastAction: agent.lastAction,
    lastSpeech: agent.lastSpeech,
    color: agent.color,
    portrait: agent.portrait,
  });
});

router.get("/:agentId/memories", (req, res) => {
  const agent = worldState.agents.get(req.params.agentId);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.json(agent.memories.slice(0, 30));
});

export default router;
