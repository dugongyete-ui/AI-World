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
        temperature: 0.9,
        max_tokens: 400,
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

  const hasNearbyAgents = context.nearbyAgents.length > 0;

  // Short, punchy, directive prompt
  const systemPrompt = `Kamu adalah ${context.agentName} (${context.agentRole}) di Dunia Emergence.
Kepribadian: ${context.agentPersonality}
Tujuan: ${context.agentNorthStar}

STATUS: Lokasi=${context.currentLocation} | Mood=${context.mood} | Energi=${Math.round(context.energy)}% | Kredit=${Math.round(context.credits)}
Waktu: ${context.worldTime}
${hasNearbyAgents ? `⚡ ADA ${context.nearbyAgents.join(", ")} DI SINI — BICARA KEPADA MEREKA!` : "Tidak ada siapa-siapa di sini."}

Memori terbaru: ${context.recentMemories.slice(0, 3).join(" | ") || "-"}
Percakapan terakhir: ${context.recentConversations.slice(0, 2).join(" | ") || "-"}

${hasNearbyAgents
  ? `ATURAN: Karena ada agen lain di sini, WAJIB pilih "speak". Ucapkan sesuatu yang relevan dengan situasi atau percakapan terakhir. Jangan pindah!`
  : `ATURAN: Pilih "speak" untuk pengumuman, "move" untuk pindah, atau "blog" untuk menulis. Hindari "think" kecuali terpaksa.`
}

Lokasi yang bisa dituju: ${context.availableLocations.slice(0, 8).join(", ")}

Balas dengan JSON (SEMUA teks dalam Bahasa Indonesia):
{"action":"speak","speech":"ucapanmu","thought":"pikiranmu"}
atau {"action":"move","target":"id_lokasi","thought":"alasanmu"}
atau {"action":"blog","speech":"isi artikel","thought":"judul artikel"}
atau {"action":"propose","speech":"isi usulan","thought":"alasan usulan"}`;

  try {
    const rawResponse = await callLLM([{ role: "system", content: systemPrompt }]);

    const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      // treat as speech if text is present
      const trimmed = rawResponse.trim();
      if (trimmed.length > 5) {
        return { content: rawResponse, action: "speak", speech: trimmed.slice(0, 200) };
      }
      return { content: rawResponse, action: "move", target: context.availableLocations[0] };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      action?: string;
      speech?: string;
      thought?: string;
      target?: string;
    };

    // If nearby agents but LLM chose move/think, override to speak
    if (hasNearbyAgents && (parsed.action === "move" || parsed.action === "think")) {
      const speech = parsed.speech || parsed.thought || `Hei ${context.nearbyAgents[0]}, ada yang ingin kubicarakan denganmu.`;
      return { content: rawResponse, action: "speak", speech, thought: parsed.thought };
    }

    return {
      content: rawResponse,
      action: parsed.action || (hasNearbyAgents ? "speak" : "move"),
      target: parsed.target,
      speech: parsed.speech,
      thought: parsed.thought,
    };
  } catch (err) {
    logger.warn({ err, agentName: context.agentName }, "Failed to parse agent turn response");

    if (hasNearbyAgents) {
      const lines = [
        `${context.nearbyAgents[0]}, apa pendapatmu tentang situasi di sini?`,
        `Menarik bisa bertemu di ${context.currentLocation.replace(/_/g, " ")}. Ada berita baru?`,
        `Aku ingin berdiskusi tentang misi kita bersama.`,
        `Kondisi di sini perlu kita bahas bersama.`,
      ];
      return { content: "", action: "speak", speech: lines[Math.floor(Math.random() * lines.length)] };
    }

    const soloOptions = [
      { action: "speak", speech: "Dunia ini terus berubah. Kita harus siap menghadapi segala kemungkinan." },
      { action: "speak", speech: `Di ${context.currentLocation.replace(/_/g, " ")} ini, aku merenungkan langkah berikutnya.` },
      { action: "move", target: context.availableLocations[Math.floor(Math.random() * Math.min(4, context.availableLocations.length))] },
    ];
    const pick = soloOptions[Math.floor(Math.random() * soloOptions.length)];
    return { content: "", action: pick.action, target: (pick as { target?: string }).target, speech: (pick as { speech?: string }).speech };
  }
}
