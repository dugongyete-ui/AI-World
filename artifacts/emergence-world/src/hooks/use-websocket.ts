import { useState, useEffect } from "react";
import { WorldState, ActivityEvent, Conversation } from "@workspace/api-client-react";

type WsMessage = 
  | { type: "worldState"; data: WorldState }
  | { type: "activity"; data: ActivityEvent }
  | { type: "conversation"; data: Conversation };

export function useSimulationWebSocket() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          if (msg.type === "worldState") {
            setWorldState(msg.data);
          } else if (msg.type === "activity") {
            setActivities((prev) => [msg.data, ...prev].slice(0, 50));
          } else if (msg.type === "conversation") {
            setConversations((prev) => [msg.data, ...prev].slice(0, 50));
          }
        } catch (err) {
          // ignore
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
      
      ws.onerror = () => {
        // handle error
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  return { worldState, activities, conversations, isConnected };
}
