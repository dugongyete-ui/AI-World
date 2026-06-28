import { Router } from "express";
import { worldState } from "../world/state.js";
import { LANDMARKS } from "../world/landmarks.js";
import { startSimulation, stopSimulation, buildWorldStateSummary, getWeatherSummary } from "../simulation/engine.js";

const router = Router();

router.get("/state", (_req, res) => {
  res.json(buildWorldStateSummary());
});

router.get("/landmarks", (_req, res) => {
  const result = LANDMARKS.map((l) => ({
    ...l,
    occupants: worldState.getLandmarkOccupants(l.id),
  }));
  res.json(result);
});

router.get("/weather", (_req, res) => {
  res.json(getWeatherSummary());
});

router.get("/metrics", (_req, res) => {
  const agents = Array.from(worldState.agents.values());
  const totalCredits = agents.reduce((s, a) => s + a.credits, 0);
  const avgCredits = totalCredits / agents.length;
  const variance = agents.reduce((s, a) => s + Math.pow(a.credits - avgCredits, 2), 0) / agents.length;
  const gini = Math.sqrt(variance) / (avgCredits || 1);

  const locationsVisited = new Set(agents.map((a) => a.location)).size;

  res.json({
    m1_population: agents.length,
    m2_safety_score: 95 - worldState.activities.filter((a) => a.type === "crime").length * 5,
    m3_exploration: locationsVisited / LANDMARKS.length,
    m4_tool_usage: Math.min(1, worldState.activities.length / 100),
    m5_governance: worldState.proposals.length > 0 ? (worldState.proposals.filter((p) => p.votes.length > 0).length / worldState.proposals.length) : 0,
    m6_expression: worldState.blogs.length + worldState.billboards.length,
    m7_social_fabric: Math.min(1, worldState.conversations.length / 50),
    m8_economic_vitality: Math.max(0, 1 - gini),
    m9_constitutional_growth: worldState.constitution.filter((a) => a.amendedBy !== null).length,
    dayNumber: worldState.dayNumber,
  });
});

router.post("/simulation/start", (_req, res) => {
  startSimulation();
  res.json({
    isRunning: worldState.isRunning,
    currentTurnAgent: worldState.getCurrentAgent()?.name || null,
    turnNumber: worldState.turnNumber,
    dayNumber: worldState.dayNumber,
    message: "Simulation started",
  });
});

router.post("/simulation/stop", (_req, res) => {
  stopSimulation();
  res.json({
    isRunning: worldState.isRunning,
    currentTurnAgent: null,
    turnNumber: worldState.turnNumber,
    dayNumber: worldState.dayNumber,
    message: "Simulation stopped",
  });
});

router.get("/simulation/status", (_req, res) => {
  res.json({
    isRunning: worldState.isRunning,
    currentTurnAgent: worldState.getCurrentAgent()?.name || null,
    turnNumber: worldState.turnNumber,
    dayNumber: worldState.dayNumber,
  });
});

export default router;
