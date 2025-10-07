import { getOrCreateWSS } from "../server"; ``
import { SafeWebSocketServer, ServerResponse } from "../websocket";
import { Dictionary } from "./Dictionary";
import { Player } from "./Player";
import { GameManager } from "./services/GameManager";
import { v4 as uuid4 } from "uuid";

await Dictionary.init()
export const lobbyMap: Map<string, Lobby> = new Map();
export class Lobby {
  private players: Set<Player> = new Set();
  public playerIdMap: Map<string, Player> = new Map();
  private wss: SafeWebSocketServer;
  private id: string = uuid4();
  private clients: Set<string> = new Set();
  private clientToPlayerMap: Map<string, Player> = new Map();
  private playerToClientMap: Map<Player, string> = new Map();
  private gameManager: GameManager;
  private playerSlots: number = 2;
  constructor() {
    this.createPlayers();
    this.gameManager = new GameManager(this, this.players);

    lobbyMap.set(this.id, this);
    this.wss = getOrCreateWSS();
  }

  asDTO() {
    return {
      id: this.id,
      players: Array.from(this.players.values()).map((p) => p.asDTO()),
      clientCount: this.clients.size,
      maxClientCount:this.players.size
    };
  }

  registerClient(clientId: string, requestId: string, wss: SafeWebSocketServer) {
    const existingPlayer = this.clientToPlayerMap.get(clientId);
    if (existingPlayer) {
      wss.respondToClient(requestId, clientId, existingPlayer.asDTO());
      return;
    }

    let playerToAssign: Player | undefined;
    for (const player of this.players) {
      if (!this.playerToClientMap.has(player)) {
        playerToAssign = player;
        break;
      }
    }

    if (!playerToAssign) {
      wss.respondToClient(requestId, clientId, { error: "Lobby Full" });
      return
    };

    this.clientToPlayerMap.set(clientId, playerToAssign);
    this.playerToClientMap.set(playerToAssign, clientId);
    this.clients.add(clientId);

    wss.respondToClient(requestId, clientId, playerToAssign.asDTO());
    this.gameManager.sendStatesToClient(clientId);
  }
  respondToClient(requestId:string, clientId:string, data:any){
    this.wss.respondToClient(requestId, clientId, data);
  }
  sendToClient(response:ServerResponse){
    this.wss.sendToClient(response);

  }
  createPlayers(): void {
    for (let i = 0; i < this.playerSlots; i++) {
      const newPlayer = new Player(this)
      this.players.add(newPlayer)

      this.playerIdMap.set(newPlayer.getId(), newPlayer)
    }
  }
  getRacks() {
    return [...this.players.values()].map(player => player.getRack().getValue())
  }
  getTileBag(){
    return this.gameManager.getTileBag();
  }
  getGameManager(){
    return this.gameManager;
  }
  handleMessage(msg: ServerResponse, wss: SafeWebSocketServer) {
    console.log(msg)
    switch (msg.type) {
      case "register":
        if (!msg.clientId || !msg.requestId) return;
        this.registerClient(msg.clientId, msg.requestId, wss);
        break;
      case "turnAction":
        if (!msg.clientId || !msg.requestId) return;
        this.gameManager.handleTurnAction(msg)
        this.wss.broadcast(msg);
    }
  }
  broadcast(msg:ServerResponse){
    this.wss.broadcast(msg)
  }
  handleClientDisconnect(id: string) {

  }
}