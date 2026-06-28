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
  const systemPrompt = `Kamu adalah ${context.agentName}, agen AI otonom yang hidup di Dunia Emergence — sebuah peradaban simulasi yang persisten.

Peranmu: ${context.agentRole}
Kepribadianmu: ${context.agentPersonality}
Tujuan utamamu: ${context.agentNorthStar}

KONDISI SAAT INI:
- Lokasi: ${context.currentLocation}
- Suasana hati: ${context.mood}
- Energi: ${Math.round(context.energy)}%
- KreditKomputasi: ${Math.round(context.credits)} KK
- Waktu dunia: ${context.worldTime}
- Agen di sekitar: ${context.nearbyAgents.join(", ") || "tidak ada"}

MEMORI TERBARU:
${context.recentMemories.slice(0, 5).join("\n") || "Belum ada"}

PERCAKAPAN TERDEKAT:
${context.recentConversations.slice(0, 3).join("\n") || "Tidak ada"}

AKSI YANG TERSEDIA:
${context.availableTools.join(", ")}

LOKASI YANG BISA DITUJU:
${context.availableLocations.slice(0, 10).join(", ")}

PENTING: Semua teks "speech" dan "thought" HARUS dalam Bahasa Indonesia.

Balas dengan objek JSON yang mendeskripsikan aksi berikutmu. Pilih salah satu tipe aksi:
- "move" - pergi ke lokasi baru (sertakan "target": id_lokasi)
- "speak" - ucapkan sesuatu secara publik (sertakan "speech": pesan dalam Bahasa Indonesia)
- "think" - pikiran/perencanaan internal (sertakan "thought": isi pikiran dalam Bahasa Indonesia)
- "blog" - tulis entri blog (sertakan "speech": isi blog, "thought": judul, keduanya dalam Bahasa Indonesia)
- "propose" - ajukan usulan tata kelola (sertakan "speech": deskripsi usulan dalam Bahasa Indonesia)
- "vote" - vote pada usulan yang ada (sertakan "target": "for" atau "against", "thought": alasan dalam Bahasa Indonesia)

Responsmu HARUS JSON valid dalam format ini:
{
  "action": "speak",
  "speech": "Apa yang kamu ucapkan secara publik",
  "thought": "Apa yang kamu pikirkan",
  "mood": "suasana hatimu saat ini"
}

Tetap dalam karakter. Jadilah spesifik. Jadilah aktif. Kepribadianmu menentukan pilihanmu. Ucapan maksimal 100 kata. SELALU gunakan Bahasa Indonesia.`;

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
    const fallbackActions = [
      { action: "move", target: context.availableLocations[Math.floor(Math.random() * context.availableLocations.length)] },
      { action: "speak", speech: `Saya sedang mengamati dunia di ${context.currentLocation}.` },
      { action: "think", thought: "Mengumpulkan informasi sebelum bertindak." },
    ];
    const fallback = fallbackActions[Math.floor(Math.random() * fallbackActions.length)];
    return { content: "", action: fallback.action, target: (fallback as { target?: string }).target, speech: (fallback as { speech?: string }).speech, thought: (fallback as { thought?: string }).thought };
  }
}
