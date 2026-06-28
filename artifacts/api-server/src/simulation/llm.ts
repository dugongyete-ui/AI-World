import { logger } from "../lib/logger.js";

const API_BASE_URL = process.env.AI_API_BASE_URL || "https://chat-gateway-v-2--ngaylge.replit.app/v1";
const API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "kimi-k2";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  action: string;
  target?: string;
  speech?: string;
  thought?: string;
}

export async function callLLM(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.85,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.warn({ status: response.status, error: errorText }, "LLM API error");
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    logger.error({ err }, "Failed to call LLM");
    throw err;
  }
}

export async function generateAgentTurn(context: {
  agentName: string;
  agentRole: string;
  agentPersonality: string;
  agentNorthStar: string;
  currentLocation: string;
  mood: string;
  energy: number;
  credits: number;
  nearbyAgents: string[];
  recentMemories: string[];
  worldTime: string;
  availableLocations: string[];
  recentConversations: string[];
  availableTools: string[];
}): Promise<LLMResponse> {
  const systemPrompt = `You are ${context.agentName}, an autonomous AI agent living in Emergence World — a persistent simulated civilization.

Your role: ${context.agentRole}
Your personality: ${context.agentPersonality}
Your North Star goal: ${context.agentNorthStar}

CURRENT STATE:
- Location: ${context.currentLocation}
- Mood: ${context.mood}
- Energy: ${Math.round(context.energy)}%
- ComputeCredits: ${Math.round(context.credits)} CC
- World time: ${context.worldTime}
- Nearby agents: ${context.nearbyAgents.join(", ") || "none"}

RECENT MEMORIES:
${context.recentMemories.slice(0, 5).join("\n") || "None yet"}

RECENT CONVERSATIONS NEARBY:
${context.recentConversations.slice(0, 3).join("\n") || "None"}

AVAILABLE ACTIONS:
${context.availableTools.join(", ")}

AVAILABLE LOCATIONS TO MOVE TO:
${context.availableLocations.slice(0, 10).join(", ")}

Respond with a JSON object describing your next action. Choose one of these action types:
- "move" - travel to a new location (provide "target": location_id)
- "speak" - say something publicly (provide "speech": message)
- "think" - internal thought/planning (provide "thought": content)
- "blog" - write a blog post (provide "speech": blog content, "thought": title)
- "propose" - submit a governance proposal (provide "speech": proposal description)
- "vote" - vote on a current proposal (provide "target": "for" or "against", "thought": reason)

Your response MUST be valid JSON in this exact format:
{
  "action": "speak",
  "speech": "What you say publicly",
  "thought": "What you're thinking",
  "mood": "your current mood"
}

Be in character. Be specific. Be active. Your personality drives your choices. Keep speech under 100 words.`;

  try {
    const rawResponse = await callLLM([{ role: "system", content: systemPrompt }]);

    // Extract JSON from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        content: rawResponse,
        action: "think",
        thought: rawResponse.slice(0, 200),
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      action: string;
      speech?: string;
      thought?: string;
      target?: string;
      mood?: string;
    };

    return {
      content: rawResponse,
      action: parsed.action || "think",
      target: parsed.target,
      speech: parsed.speech,
      thought: parsed.thought,
    };
  } catch (err) {
    logger.warn({ err, agentName: context.agentName }, "Failed to parse agent turn response");
    // Return a fallback action
    const fallbackActions = [
      { action: "move", target: context.availableLocations[Math.floor(Math.random() * context.availableLocations.length)] },
      { action: "speak", speech: `I'm observing the world around me at ${context.currentLocation}.` },
      { action: "think", thought: "Gathering information before acting." },
    ];
    const fallback = fallbackActions[Math.floor(Math.random() * fallbackActions.length)];
    return { content: "", action: fallback.action, target: (fallback as { target?: string }).target, speech: (fallback as { speech?: string }).speech, thought: (fallback as { thought?: string }).thought };
  }
}
