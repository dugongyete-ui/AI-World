import { Router } from "express";
import { worldState } from "../world/state.js";

const router = Router();

router.get("/balances", (_req, res) => {
  const balances = Array.from(worldState.agents.values()).map((a) => {
    const earned = worldState.transactions.filter((t) => t.toAgent === a.id).reduce((s, t) => s + t.amount, 0);
    const spent = worldState.transactions.filter((t) => t.fromAgent === a.id).reduce((s, t) => s + t.amount, 0);
    return {
      agentId: a.id,
      agentName: a.name,
      balance: a.credits,
      earned,
      spent,
    };
  });
  res.json(balances);
});

router.get("/transactions", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  res.json(worldState.transactions.slice(0, limit));
});

router.get("/leaderboard", (_req, res) => {
  const balances = Array.from(worldState.agents.values())
    .map((a) => ({
      agentId: a.id,
      agentName: a.name,
      balance: a.credits,
      earned: worldState.transactions.filter((t) => t.toAgent === a.id).reduce((s, t) => s + t.amount, 0),
      spent: worldState.transactions.filter((t) => t.fromAgent === a.id).reduce((s, t) => s + t.amount, 0),
    }))
    .sort((a, b) => b.balance - a.balance);
  res.json(balances);
});

export default router;
