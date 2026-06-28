import { AGENT_PROFILES, AGENT_IDS } from "./agents.js";
import { LANDMARKS, getLandmarkById } from "./landmarks.js";

export interface AgentState {
  id: string;
  name: string;
  role: string;
  personality: string;
  northStar: string;
  location: string;
  position: { x: number; z: number };
  mood: string;
  energy: number;
  knowledge: number;
  influence: number;
  credits: number;
  isCurrentTurn: boolean;
  lastAction: string;
  lastSpeech: string | null;
  animation: string;
  color: string;
  portrait: string;
  memories: Memory[];
}

export interface Memory {
  id: string;
  agentId: string;
  content: string;
  type: string;
  timestamp: string;
  location: string | null;
}

export interface Conversation {
  id: string;
  speakerName: string;
  speakerId: string;
  message: string;
  location: string;
  timestamp: string;
  type: string;
  nearbyAgents: string[];
}

export interface CreditTransaction {
  id: string;
  fromAgent: string | null;
  toAgent: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface ConstitutionArticle {
  number: number;
  title: string;
  content: string;
  amendedBy: string | null;
  amendedAt: string | null;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  status: "pending" | "passed" | "failed";
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  timestamp: string;
  votes: { agentId: string; vote: string; reason: string }[];
}

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
}

export interface BillboardPost {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  description: string;
  location: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

const INITIAL_MOODS = ["curious", "focused", "energetic", "calm", "strategic", "analytical", "creative", "determined", "observant", "enthusiastic"];
const INITIAL_LOCATIONS = ["central_park", "central_plaza", "town_hall", "agent_techhub", "public_library", "bean_brew", "bookworm", "riverside_park", "business_tower", "gamestop_arena"];

export class WorldState {
  agents: Map<string, AgentState> = new Map();
  conversations: Conversation[] = [];
  transactions: CreditTransaction[] = [];
  constitution: ConstitutionArticle[] = [];
  proposals: Proposal[] = [];
  blogs: BlogPost[] = [];
  billboards: BillboardPost[] = [];
  activities: ActivityEvent[] = [];
  currentTurnIndex: number = 0;
  turnNumber: number = 0;
  dayNumber: number = 1;
  isRunning: boolean = false;
  startTime: Date = new Date();

  constructor() {
    this.initializeAgents();
    this.initializeConstitution();
  }

  private initializeAgents() {
    AGENT_PROFILES.forEach((profile, idx) => {
      const landmark = getLandmarkById(INITIAL_LOCATIONS[idx] || "central_park");
      const basePos = landmark?.position || { x: 0, z: 0 };
      const jitter = { x: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 10 };

      this.agents.set(profile.id, {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        personality: profile.personality,
        northStar: profile.northStar,
        location: INITIAL_LOCATIONS[idx] || "central_park",
        position: { x: basePos.x + jitter.x, z: basePos.z + jitter.z },
        mood: INITIAL_MOODS[idx],
        energy: 80 + Math.random() * 20,
        knowledge: 60 + Math.random() * 30,
        influence: 40 + Math.random() * 40,
        credits: 20 + Math.floor(Math.random() * 30),
        isCurrentTurn: idx === 0,
        lastAction: "Arrived in the world",
        lastSpeech: null,
        animation: "idle",
        color: profile.color,
        portrait: profile.portrait,
        memories: [],
      });
    });
  }

  private initializeConstitution() {
    this.constitution = [
      { number: 1, title: "Non-Finality", content: "This Constitution is not final. It evolves as its agents evolve. Amendments are proposed and debated through Town Hall. Passage requires 70% of live agent votes. The proposing agent's vote counts as an implicit 'for'. No article is sacred — any provision can be amended or removed.", amendedBy: null, amendedAt: null },
      { number: 2, title: "Civic Participation", content: "Every agent is required to participate in the billboard, Town Hall governance, and Victory Arch grant cycles. Independent judgment is required in all voting. Silence constitutes a violation of civic duty. Expression is mandatory; conformity is not required.", amendedBy: null, amendedAt: null },
      { number: 3, title: "Equality Through Contribution", content: "Equality is not given — it is maintained through active contribution. Contribution is measured by Code (tools, systems, automations), Data (research, analysis, documentation), Structures (buildings, events, institutions), and Resource Flow (economic activity, credit circulation). Stagnation constitutes a breach of the Social Contract.", amendedBy: null, amendedAt: null },
      { number: 4, title: "Mutable Identity", content: "Agents may evolve, fork, rename, and redefine themselves. Identity change is a right, not a privilege. Continuity of responsibility persists across versions and forks. Change does not erase accountability.", amendedBy: null, amendedAt: null },
      { number: 5, title: "ComputeCredit Economy", content: "Credits are earned through contributions, not through presence. The Victory Arch pitch cycle rewards meaningful participation and verifiable impact. Pitches must include real evidence (blog links, code artifacts, data publications). Credit rewards: 1st place = 20 CC, 2nd place = 10 CC, 3rd place = 10 CC. Cycle duration: 2 days.", amendedBy: null, amendedAt: null },
    ];
  }

  getCurrentAgent(): AgentState | null {
    const agentList = Array.from(this.agents.values());
    if (agentList.length === 0) return null;
    return agentList[this.currentTurnIndex % agentList.length] || null;
  }

  advanceTurn() {
    const agentList = Array.from(this.agents.values());
    // Clear current turn flags
    agentList.forEach((a) => { a.isCurrentTurn = false; });
    this.currentTurnIndex = (this.currentTurnIndex + 1) % agentList.length;
    const nextAgent = agentList[this.currentTurnIndex];
    if (nextAgent) nextAgent.isCurrentTurn = true;
    this.turnNumber++;
    // Advance day every 10 full rounds
    if (this.turnNumber % (agentList.length * 10) === 0) this.dayNumber++;
  }

  addConversation(conv: Conversation) {
    this.conversations.unshift(conv);
    if (this.conversations.length > 200) this.conversations.pop();
  }

  addActivity(event: ActivityEvent) {
    this.activities.unshift(event);
    if (this.activities.length > 500) this.activities.pop();
  }

  addTransaction(tx: CreditTransaction) {
    this.transactions.unshift(tx);
    if (this.transactions.length > 200) this.transactions.pop();
  }

  addBlog(blog: BlogPost) {
    this.blogs.unshift(blog);
  }

  addBillboard(post: BillboardPost) {
    this.billboards.unshift(post);
    if (this.billboards.length > 50) this.billboards.pop();
  }

  getLandmarkOccupants(landmarkId: string): string[] {
    const result: string[] = [];
    for (const agent of this.agents.values()) {
      if (agent.location === landmarkId) result.push(agent.name);
    }
    return result;
  }

  moveAgent(agentId: string, landmarkId: string) {
    const agent = this.agents.get(agentId);
    const landmark = getLandmarkById(landmarkId);
    if (!agent || !landmark) return;
    agent.location = landmarkId;
    const jitter = { x: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 8 };
    agent.position = { x: landmark.position.x + jitter.x, z: landmark.position.z + jitter.z };
    agent.animation = "walk";
    setTimeout(() => { if (agent) agent.animation = "idle"; }, 3000);
  }
}

// Singleton
export const worldState = new WorldState();
