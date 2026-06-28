import { worldState } from "../world/state.js";
import { LANDMARKS } from "../world/landmarks.js";
import { generateAgentTurn } from "./llm.js";
import { logger } from "../lib/logger.js";
import { broadcast } from "../websocket.js";
import { nanoid } from "../lib/nanoid.js";

const TURN_DELAY_MS = 8000;
const LANDMARK_IDS = LANDMARKS.map((l) => l.id);
const MOODS = ["penasaran", "fokus", "bersemangat", "tenang", "strategis", "analitis", "bertekad", "observatif", "antusias", "waspada", "percaya diri", "skeptis", "termotivasi", "reflektif"];

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

  agent.energy = Math.max(0, agent.energy - (Math.random() * 3 + 1));
  agent.knowledge = Math.max(0, agent.knowledge - (Math.random() * 2 + 0.5));
  agent.influence = Math.max(0, agent.influence - (Math.random() * 1.5 + 0.3));

  const nearbyAgents: string[] = [];
  for (const other of worldState.agents.values()) {
    if (other.id !== agent.id && other.location === agent.location) {
      nearbyAgents.push(other.name);
    }
  }

  const recentConvs = worldState.conversations
    .slice(0, 5)
    .map((c) => `[${c.location}] ${c.speakerName}: "${c.message}"`);

  const recentMems = agent.memories.slice(0, 5).map((m) => m.content);

  const now = new Date();
  const worldTime = now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", weekday: "short" });

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
    response = { action: "think", thought: "Mengamati dunia dengan seksama.", content: "" };
  }

  const now2 = new Date().toISOString();
  const id = nanoid();

  switch (response.action) {
    case "move": {
      const targetId = response.target;
      if (targetId && LANDMARK_IDS.includes(targetId)) {
        worldState.moveAgent(agent.id, targetId);
        agent.lastAction = `Berpindah ke ${targetId.replace(/_/g, " ")}`;
        agent.lastSpeech = null;
        agent.animation = "walk";

        const event = {
          id,
          agentId: agent.id,
          agentName: agent.name,
          type: "move",
          description: `${agent.name} berjalan ke ${targetId.replace(/_/g, " ")}`,
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
        agent.lastAction = `Berbicara: "${speech.slice(0, 60)}..."`;
        agent.animation = "talk";
        setTimeout(() => { agent.animation = "idle"; }, 5000);

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

        const memId = nanoid();
        agent.memories.unshift({
          id: memId,
          agentId: agent.id,
          content: `Saya berkata: "${speech.slice(0, 150)}"`,
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
      const title = response.thought || `Pengamatan ${agent.name} — Hari ${worldState.dayNumber}`;
      if (content) {
        const blog = {
          id,
          authorId: agent.id,
          authorName: agent.name,
          title,
          content,
          timestamp: now2,
          tags: [agent.role.toLowerCase(), "hari-" + worldState.dayNumber],
        };
        worldState.addBlog(blog);
        agent.lastAction = `Menerbitkan blog: "${title.slice(0, 50)}"`;
        agent.influence = Math.min(100, agent.influence + 5);
        agent.credits = Math.max(0, agent.credits + 1);

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "blog",
          description: `${agent.name} menerbitkan blog: "${title.slice(0, 60)}"`,
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
          title: `Usulan oleh ${agent.name}`,
          description,
          proposedBy: agent.name,
          status: "pending" as const,
          votesFor: 1,
          votesAgainst: 0,
          totalVoters: worldState.agents.size,
          timestamp: now2,
          votes: [{ agentId: agent.id, vote: "for", reason: "Pengusul" }],
        };
        worldState.proposals.unshift(proposal);
        agent.lastAction = `Mengajukan usulan tata kelola`;
        agent.influence = Math.min(100, agent.influence + 8);

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "propose",
          description: `${agent.name} mengajukan usulan: "${description.slice(0, 80)}"`,
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
        const voteLabel = vote === "for" ? "mendukung" : "menolak";
        proposal.votes.push({ agentId: agent.id, vote, reason: response.thought || "Berdasarkan penilaian" });
        if (vote === "for") proposal.votesFor++;
        else proposal.votesAgainst++;

        const totalVotes = proposal.votesFor + proposal.votesAgainst;
        if (totalVotes >= Math.ceil(worldState.agents.size * 0.7)) {
          proposal.status = proposal.votesFor / totalVotes >= 0.7 ? "passed" : "failed";
        }

        agent.lastAction = `Memilih ${voteLabel} pada: "${proposal.title}"`;

        const event = {
          id: nanoid(),
          agentId: agent.id,
          agentName: agent.name,
          type: "vote",
          description: `${agent.name} ${voteLabel} usulan "${proposal.title.slice(0, 50)}"`,
          location: agent.location,
          timestamp: now2,
          metadata: { proposalId: proposal.id, vote },
        };
        worldState.addActivity(event);
      }
      break;
    }

    default: {
      const thought = response.thought || "";
      if (thought) {
        agent.lastAction = `Berpikir: "${thought.slice(0, 60)}"`;
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

  if (Math.random() < 0.3) {
    agent.mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  }

  worldState.advanceTurn();
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
    worldTime: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    currentTurnAgent: currentAgent?.name || null,
    turnNumber: worldState.turnNumber,
    dayNumber: worldState.dayNumber,
    isRunning: worldState.isRunning,
    totalAgents: worldState.agents.size,
  };
}

function getWeatherSummary() {
  const conditions = ["Cerah", "Berawan", "Hujan", "Sebagian Berawan", "Berkabut", "Matahari Bersinar"];
  const idx = Math.floor(Date.now() / (1000 * 60 * 30)) % conditions.length;
  return {
    condition: conditions[idx],
    temperature: 28 + (Math.sin(Date.now() / 100000) * 5),
    description: `${conditions[idx]} di atas Dunia Emergence`,
    worldTime: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    timezone: "Asia/Jakarta",
  };
}

export { buildWorldStateSummary, getWeatherSummary };
