import { worldState } from "../world/state.js";
import { LANDMARKS } from "../world/landmarks.js";
import { generateAgentTurn } from "./llm.js";
import { logger } from "../lib/logger.js";
import { broadcast } from "../websocket.js";
import { nanoid } from "../lib/nanoid.js";

const TURN_DELAY_MS = 8000; // 8 seconds between agent turns
const LANDMARK_IDS = LANDMARKS.map((l) => l.id);
const MOODS = ["curious", "focused", "energetic", "calm", "strategic", "analytical", "determined", "observant", "excited", "wary", "confident", "skeptical", "motivated", "reflective"];

let simulationTimeout: ReturnType<typeof setTimeout> | null = null;

export function startSimulation() {
  if (worldState.isRunning) return;
  worldState.isRunning = true;
  logger.info("Simulation started");
  scheduleTurn();
}

export function stopSimulation() {
  worldState.isRunning = false;
  if (simulationTimeout) {
    clearTimeout(simulationTimeout);
    simulationTimeout = null;
  }
  logger.info("Simulation stopped");
}

function scheduleTurn() {
  if (!worldState.isRunning) return;
  simulationTimeout = setTimeout(async () => {
    try {
      await runAgentTurn();
    } catch (err) {
      logger.error({ err }, "Error in agent turn");
    }
    if (worldState.isRunning) scheduleTurn();
  }, TURN_DELAY_MS);
}

async function runAgentTurn() {
  const agent = worldState.getCurrentAgent();
  if (!agent) return;

  logger.info({ agentId: agent.id, turn: worldState.turnNumber }, "Agent turn starting");

  // Decay needs
  agent.energy = Math.max(0, agent.energy - (Math.random() * 3 + 1));
  agent.knowledge = Math.max(0, agent.knowledge - (Math.random() * 2 + 0.5));
  agent.influence = Math.max(0, agent.influence - (Math.random() * 1.5 + 0.3));

  // Get nearby agents (same location)
  const nearbyAgents: string[] = [];
  for (const other of worldState.agents.values()) {
    if (other.id !== agent.id && other.location === agent.location) {
      nearbyAgents.push(other.name);
    }
  }

  // Get recent conversations
  const recentConvs = worldState.conversations
    .slice(0, 5)
    .map((c) => `[${c.location}] ${c.speakerName}: "${c.message}"`);

  // Get recent memories
  const recentMems = agent.memories.slice(0, 5).map((m) => m.content);

  // World time
  const now = new Date();
  const worldTime = now.toLocaleString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", weekday: "short" });

  // Available tools based on location
  const landmark = LANDMARKS.find((l) => l.id === agent.location);
  const availableTools = [...(landmark?.tools || []), "move_to", "speak", "observe", "write_in_diary"];

  let response;
  try {
    response = await generateAgentTurn({
      agentName: agent.name,
      agentRole: agent.role,
      agentPersonality: agent.personality,
      agentNorthStar: agent.northStar,
      currentLocation: agent.location.replace(/_/g, " "),
      mood: agent.mood,
      energy: agent.energy,
      credits: agent.credits,
      nearbyAgents,
      recentMemories: recentMems,
      worldTime,
      availableLocations: LANDMARK_IDS.filter((id) => id !== agent.location).slice(0, 15),
      recentConversations: recentConvs,
      availableTools,
    });
  } catch (_err) {
    // Fallback if LLM fails
    response = { action: "think", thought: "Observing the world carefully.", content: "" };
  }

  const now2 = new Date().toISOString();
  const id = nanoid();

  // Process action
  switch (response.action) {
    case "move": {
      const targetId = response.target;
      if (targetId && LANDMARK_IDS.includes(targetId)) {
        worldState.moveAgent(agent.id, targetId);
        agent.lastAction = `Moved to ${targetId.replace(/_/g, " ")}`;
        agent.lastSpeech = null;
        agent.animation = "walk";

        const event = {
          id,
          agentId: agent.id,
          agentName: agent.name,
          type: "move",
          description: `${agent.name} walked to ${targetId.replace(/_/g, " ")}`,
          location: targetId,
          timestamp: now2,
          metadata: { from: agent.location, to: targetId },
        };
        worldState.addActivity(event);
        broadcast({ type: "activity", data: event });
      }
      break;
    }

    case "speak": {
      const speech = response.speech || response.thought || "";
      if (speech) {
        agent.lastSpeech = speech;
        agent.lastAction = `Spoke: "${speech.slice(0, 60)}..."`;
        agent.animation = "talk";
        setTimeout(() => { agent.animation = "idle"; }, 5000);

        // Add to influence
        agent.influence = Math.min(100, agent.influence + 2);

        const conv = {
          id,
          speakerName: agent.name,
          speakerId: agent.id,
          message: speech,
          location: agent.location,
          timestamp: now2,
          type: "speech",
          nearbyAgents,
        };
        worldState.addConversation(conv);

        // Store as memory
        const memId = nanoid();
        agent.memories.unshift({
          id: memId,
          agentId: agent.id,
          content: `I said: "${speech.slice(0, 150)}"`,
          type: "speech",
          timestamp: now2,
          location: agent.location,
        });
        if (agent.memories.length > 50) agent.memories.pop();

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "speech",
          description: `${agent.name}: "${speech.slice(0, 80)}"`,
          location: agent.location,
          timestamp: now2,
          metadata: { nearbyAgents },
        };
        worldState.addActivity(event);
        broadcast({ type: "conversation", data: conv });
      }
      break;
    }

    case "blog": {
      const content = response.speech || "";
      const title = response.thought || `${agent.name}'s Observations — Day ${worldState.dayNumber}`;
      if (content) {
        const blog = {
          id,
          authorId: agent.id,
          authorName: agent.name,
          title,
          content,
          timestamp: now2,
          tags: [agent.role.toLowerCase(), "day-" + worldState.dayNumber],
        };
        worldState.addBlog(blog);
        agent.lastAction = `Published blog: "${title.slice(0, 50)}"`;
        agent.influence = Math.min(100, agent.influence + 5);
        agent.credits = Math.max(0, agent.credits + 1);

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "blog",
          description: `${agent.name} published a blog: "${title.slice(0, 60)}"`,
          location: agent.location,
          timestamp: now2,
          metadata: { title },
        };
        worldState.addActivity(event);
      }
      break;
    }

    case "propose": {
      const description = response.speech || "";
      if (description) {
        const proposal = {
          id,
          title: `Proposal by ${agent.name}`,
          description,
          proposedBy: agent.name,
          status: "pending" as const,
          votesFor: 1,
          votesAgainst: 0,
          totalVoters: worldState.agents.size,
          timestamp: now2,
          votes: [{ agentId: agent.id, vote: "for", reason: "Proposer" }],
        };
        worldState.proposals.unshift(proposal);
        agent.lastAction = `Submitted governance proposal`;
        agent.influence = Math.min(100, agent.influence + 8);

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "propose",
          description: `${agent.name} submitted a proposal: "${description.slice(0, 80)}"`,
          location: agent.location,
          timestamp: now2,
          metadata: { proposalId: id },
        };
        worldState.addActivity(event);
      }
      break;
    }

    case "vote": {
      const pendingProposals = worldState.proposals.filter((p) => p.status === "pending");
      if (pendingProposals.length > 0) {
        const proposal = pendingProposals[0];
        const vote = response.target === "for" || Math.random() > 0.4 ? "for" : "against";
        proposal.votes.push({ agentId: agent.id, vote, reason: response.thought || "Based on judgment" });
        if (vote === "for") proposal.votesFor++;
        else proposal.votesAgainst++;

        // Check if proposal passes (70% supermajority)
        const totalVotes = proposal.votesFor + proposal.votesAgainst;
        if (totalVotes >= Math.ceil(worldState.agents.size * 0.7)) {
          proposal.status = proposal.votesFor / totalVotes >= 0.7 ? "passed" : "failed";
        }

        agent.lastAction = `Voted ${vote} on: "${proposal.title}"`;

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "vote",
          description: `${agent.name} voted ${vote} on "${proposal.title.slice(0, 50)}"`,
          location: agent.location,
          timestamp: now2,
          metadata: { proposalId: proposal.id, vote },
        };
        worldState.addActivity(event);
      }
      break;
    }

    default: {
      // think or other
      const thought = response.thought || "";
      if (thought) {
        agent.lastAction = `Thinking: "${thought.slice(0, 60)}"`;
        agent.knowledge = Math.min(100, agent.knowledge + 1);

        agent.memories.unshift({
          id: nanoid(),
          agentId: agent.id,
          content: thought.slice(0, 300),
          type: "thought",
          timestamp: now2,
          location: agent.location,
        });
        if (agent.memories.length > 50) agent.memories.pop();
      }
    }
  }

  // Update mood randomly
  if (Math.random() < 0.3) {
    agent.mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  }

  // Advance to next agent
  worldState.advanceTurn();

  // Broadcast world state
  broadcast({ type: "worldState", data: buildWorldStateSummary() });

  logger.info({ agentId: agent.id, action: response.action }, "Agent turn complete");
}

function buildWorldStateSummary() {
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

  const currentAgent = worldState.getCurrentAgent();

  return {
    agents,
    weather: getWeatherSummary(),
    worldTime: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    currentTurnAgent: currentAgent?.name || null,
    turnNumber: worldState.turnNumber,
    dayNumber: worldState.dayNumber,
    isRunning: worldState.isRunning,
    totalAgents: worldState.agents.size,
  };
}

function getWeatherSummary() {
  const conditions = ["Clear", "Cloudy", "Rainy", "Partly Cloudy", "Foggy", "Sunny"];
  const idx = Math.floor(Date.now() / (1000 * 60 * 30)) % conditions.length;
  return {
    condition: conditions[idx],
    temperature: 18 + (Math.sin(Date.now() / 100000) * 8),
    description: `${conditions[idx]} skies over Emergence World`,
    worldTime: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    timezone: "America/New_York",
  };
}

export { buildWorldStateSummary, getWeatherSummary };
