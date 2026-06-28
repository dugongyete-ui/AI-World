import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { logger } from "./lib/logger.js";

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    logger.info({ ip: req.socket.remoteAddress }, "WebSocket client connected");

    ws.on("error", (err) => {
      logger.warn({ err }, "WebSocket client error");
    });

    ws.on("close", () => {
      logger.info("WebSocket client disconnected");
    });

    // Send a welcome message
    ws.send(JSON.stringify({ type: "connected", data: { message: "Connected to Emergence World" } }));
  });

  logger.info("WebSocket server initialized on path /ws");
}

export function broadcast(data: unknown) {
  if (!wss) return;
  const message = JSON.stringify(data);
  let count = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      count++;
    }
  });
  if (count > 0) {
    logger.debug({ clientCount: count, type: (data as Record<string, string>).type }, "Broadcasted to WS clients");
  }
}
