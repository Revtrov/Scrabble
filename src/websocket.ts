import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { Lobby } from "./Classes/Lobby";
import { lobbyMap } from "./Classes/Lobby";
export function setupWebSocket(server: Server): SafeWebSocketServer {
  const wss = new WebSocketServer({ server });
  return new SafeWebSocketServer(wss, lobbyMap);
}

class SafeWebSocket {
  private ws: WebSocket;
  private queue: string[] = [];

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.flush();
  }

  send(data: unknown) {
    const msg = JSON.stringify(data);
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msg);
    } else {
      this.queue.push(msg);
    }
  }

  private flush() {
    while (this.queue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
      const msg = this.queue.shift();
      if (msg) this.ws.send(msg);
    }
  }
}

export interface ServerResponse {
  type: string;
  clientId?: string;
  lobbyId?: string;
  requestId?: string;
  playerId?: string;
  gameAction?:any;
}

export class SafeWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  lobbyMap: Map<string, Lobby>;

  constructor(wss: WebSocketServer, lobbyMap: Map<string, Lobby>) {
    this.wss = wss;
    this.lobbyMap = lobbyMap;

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Client connected");
      const safe = new SafeWebSocket(ws);

      ws.on("message", (data) => {
        let msg: ServerResponse;
        try {
          msg = JSON.parse(data.toString());
        } catch {
          console.warn("Invalid JSON:", data.toString());
          return;
        }
        // Save client connection
        if (msg.type === "connect" && msg.clientId) {
          this.clients.set(msg.clientId, ws);
          const response: ServerResponse = { type: "connected", clientId: msg.clientId };
          if (msg.requestId) response.requestId = msg.requestId;
          safe.send(response);
          return;
        }

        // Route to lobby
        if (msg.lobbyId) {
          const lobby = this.lobbyMap.get(msg.lobbyId);
          if (!lobby) {
            console.warn(`Lobby ${msg.lobbyId} not found`);
            return;
          }
          lobby.handleMessage(msg, this);
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected");
        for (const [id, clientWs] of this.clients.entries()) {
          if (clientWs === ws) {
            this.clients.delete(id);
            console.log(`Removed client ${id}`);
            // clean up from all lobbies
            for (const lobby of this.lobbyMap.values()) {
              lobby.handleClientDisconnect(id);
            }
            break;
          }
        }
      });
    });
  }

  broadcast(data: unknown) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        new SafeWebSocket(client as WebSocket).send(data);
      }
    });
  }

  sendToClient(requestId: string, clientId: string, data: unknown) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      new SafeWebSocket(ws).send({ requestId, data });
    }
  }
}
