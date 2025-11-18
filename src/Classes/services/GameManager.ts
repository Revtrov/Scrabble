import { ServerResponse } from "../../websocket";
import { Board } from "../Board";
import { Lobby } from "../Lobby";
import { Player } from "../Player";
import { z } from "zod";
import { TileBag } from "../TileBag";
import { Dictionary } from "../Dictionary";
import { Rack } from "../Rack";
import { Tile } from "../Tile";
import ScoringEngine from "./ScoringEngine";

enum StateUpdateType {
  TileBag = "TileBag",
  Board = "Board",
  Rack = "Rack",
  TurnIndicator = "TurnIndicator",
}
export interface StateUpdateBody {
  type: StateUpdateType;
  data: any;
}
export interface StateUpdateMessage extends ServerResponse {
  type: string;
  stateUpdate: StateUpdateBody;
}

enum TurnActionId {
  Move = "Move",
  Exchange = "Exchange",
  Pass = "Pass",
}

export enum Direction {
  Vertical = "V",
  Horizontal = "H",
}
export interface Coord {
  i: number;
  j: number;
}
export const TilePlacementSchema = z.object({
  id: z.string(),
  i: z.number().int().nonnegative(),
  j: z.number().int().nonnegative(),
});
const MoveDataSchema = z.object({
  direction: z.string(),
  startIndex: z.object({
    i: z.number(),
    j: z.number(),
  }),
  tiles: z.array(TilePlacementSchema),
});

const ExchangeDataSchema = z.object({
  tileIds: z.array(z.string()),
});

const PassDataSchema = z.undefined();

const TurnActionSchema = z.discriminatedUnion("type", [z.object({ type: z.literal(TurnActionId.Move), data: MoveDataSchema }), z.object({ type: z.literal(TurnActionId.Exchange), data: ExchangeDataSchema }), z.object({ type: z.literal(TurnActionId.Pass), data: PassDataSchema })]);

type TurnActionDTO = z.infer<typeof TurnActionSchema>;

enum TurnActionResult {
  Success = "Success",
  Failure = "Failure",
  InvalidWord = "InvalidWord",
  IllegalTiles = "IllegalTiles",
  NotPlayersTurn = "NotPlayersTurn",
  InvalidLocation = "InvalidLocation",
}

export class GameManager {
  private lobby: Lobby;
  private players: Set<Player>;
  private board: Board;
  private turnOrder: Array<Player>;
  private turnIndex: number = 0;
  private turnNumber: number = 1;
  private tileBag: TileBag;
  private scoringEngine: ScoringEngine;
  constructor(lobby: Lobby, players: Set<Player>) {
    this.lobby = lobby;
    this.players = players;
    this.turnOrder = [...this.players.values()];
    this.tileBag = new TileBag();
    for (const player of this.players.values()) {
      player.setRack(new Rack(this.tileBag));
    }
    this.board = new Board();
    this.board.print();
    this.scoringEngine = new ScoringEngine(this.board);
  }

  handleTurnAction(msg: ServerResponse) {
    if (!msg.turnAction) return;

    let action: TurnActionDTO;
    try {
      action = TurnActionSchema.parse(msg.turnAction);
    } catch (err) {
      console.error("Invalid action:", err);
      return;
    }
    let turnActionResult: TurnActionResult;
    switch (action.type) {
      case TurnActionId.Move:
        turnActionResult = this.handleMove(msg.playerId, action.data);
        break;
      case TurnActionId.Exchange:
        turnActionResult = this.handleExchange(msg.playerId, action.data);
        break;
      case TurnActionId.Pass:
        turnActionResult = this.handlePass(msg.playerId, action.data);
        break;
    }
    this.lobby.respondToClient(msg.requestId, msg.clientId, turnActionResult);
    if (turnActionResult == TurnActionResult.Success) {
      this.advanceTurn();
    }
  }
  private isValidStartMove(startIndex: Coord, direction: Direction, tiles: Tile[]): boolean {
    const start = this.board.getStartIndex();
    let containsStart = false;

    if (direction === Direction.Horizontal) {
      containsStart = start.i === startIndex.i && start.j >= startIndex.j && start.j < startIndex.j + tiles.length;
    } else {
      containsStart = start.j === startIndex.j && start.i >= startIndex.i && start.i < startIndex.i + tiles.length;
    }
    return containsStart;
  }
  private getAdjoiningWords(moveData: z.infer<typeof MoveDataSchema>): Tile[][] {
    const { direction, tiles } = moveData;
    const words: Tile[][] = [];

    const step = (d: Direction, delta: number): [number, number] => (d === Direction.Horizontal ? [0, delta] : [delta, 0]);

    // Map tileId => real Tile instance (from board/rack)
    const tileIdMap = new Map<string, Tile>();
    for (const t of tiles) {
      const cellTile = this.board.getCell(t.i, t.j)?.getTile();
      if (cellTile) {
        tileIdMap.set(t.id, cellTile);
      } else {
        // fetch from the current player rack
        const player = this.lobby.playerIdMap.get(this.turnOrder[this.turnIndex].getId());
        const rackTile = player.getRack().getTileIdMap().get(t.id);
        if (rackTile) tileIdMap.set(t.id, rackTile);
      }
    }

    const getTileAt = (i: number, j: number, consume: boolean): Tile | undefined => {
      const cellTile = this.board.getCell(i, j)?.getTile();
      if (cellTile) return cellTile;

      // Find a tile being placed at i/j
      const t = tiles.find((tile) => tile.i === i && tile.j === j);
      if (!t) return undefined;

      return tileIdMap.get(t.id);
    };

    const buildWord = (i: number, j: number, d: Direction, consume: boolean): Tile[] => {
      const [backDi, backDj] = step(d, -1);
      const [forwDi, forwDj] = step(d, 1);

      let si = i,
        sj = j;
      while (this.board.isInBounds(si + backDi, sj + backDj) && getTileAt(si + backDi, sj + backDj, false)) {
        si += backDi;
        sj += backDj;
      }

      const word: Tile[] = [];
      while (this.board.isInBounds(si, sj)) {
        const tile = getTileAt(si, sj, consume);
        if (!tile) break;
        word.push(tile);
        si += forwDi;
        sj += forwDj;
      }

      return word;
    };

    // Build main word from the first tile
    const mainWord = buildWord(tiles[0].i, tiles[0].j, direction as Direction, true);
    if (mainWord.length > 1) words.push(mainWord);

    // Build cross words
    const perpendicular = direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
    for (const tile of tiles) {
      const crossWord = buildWord(tile.i, tile.j, perpendicular, false);
      if (crossWord.length > 1) words.push(crossWord);
    }

    return words;
  }

  private handleMove(playerId: string, moveData: z.infer<typeof MoveDataSchema>): TurnActionResult {
    const { direction, startIndex, tiles } = moveData;
    const tileIds: string[] = tiles.map((tile) => tile.id);

    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`));
      return TurnActionResult.NotPlayersTurn;
    }

    const playerRack = player.getRack();
    if (!playerRack.hasTileIds(tileIds)) {
      console.log(new Error("Used tiles not in player's Rack"));
      return TurnActionResult.IllegalTiles;
    }

    const serverTiles = tileIds.map((tileId) => playerRack.getTileIdMap().get(tileId));

    const words = this.getAdjoiningWords(moveData);
    for (const word of words) {
      console.log(word.map((tile) => tile.getLetter()).join(""));
    }
    const wordCheck = words.every((word) => Dictionary.hasWord(word.map((tile) => tile.getLetter()).join("")));
    if (!wordCheck) {
      const incorrectWords = words.filter((word) => Dictionary.hasWord(word.map((tile) => tile.getLetter()).join("")));
      console.log(new Error(`${incorrectWords} not in Dictionary`));
      return TurnActionResult.InvalidWord;
    }

    if (this.turnNumber == 0) {
      // must place word on center on first turn
      if (!this.isValidStartMove(startIndex as Coord, direction as Direction, serverTiles)) return TurnActionResult.InvalidLocation;
    }
    // check if connected words too
    // update board
    this.board.placeTiles(serverTiles, moveData.tiles);
    playerRack.removeTiles(serverTiles);
    playerRack.fill();

    const moveScore = this.scoringEngine.scoreWord(startIndex, direction as Direction, serverTiles);
    player.addScore(moveScore);

    return TurnActionResult.Success;
  }

  private handleExchange(playerId: string, exchangeData: z.infer<typeof ExchangeDataSchema>): TurnActionResult {
    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`));
      return TurnActionResult.NotPlayersTurn;
    }

    const playerRack = player.getRack();
    if (!playerRack.hasTileIds(exchangeData.tileIds)) {
      console.log(new Error("Used tiles not in player's Rack"));
      return TurnActionResult.IllegalTiles;
    }

    playerRack.exchangeByIds(exchangeData.tileIds);
    // remove tiles from rack, draw new ones from bag
    return TurnActionResult.Success;
  }

  private handlePass(playerId: string, _: z.infer<typeof PassDataSchema>): TurnActionResult {
    // maybe track consecutive passes to end the game
    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`));
      return TurnActionResult.NotPlayersTurn;
    }
    return TurnActionResult.Success;
  }
  private broadcastStates() {
    for (const state of Object.values(this.getStates()) as ServerResponse[]) {
      this.lobby.broadcast(state);
    }
  }
  public sendStatesToClient(clientId: string) {
    for (const state of Object.values(this.getStates()) as ServerResponse[]) {
      state.clientId = clientId;
      this.lobby.sendToClient(state);
    }
  }
  private getStates(): Record<any, ServerResponse> {
    const tileBagUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TileBag,
        data: {
          tileBag: this.tileBag.asDTO(),
        },
      },
    };
    const boardUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Board,
        data: {
          board: this.board.asDTO(),
        },
      },
    };
    const rackUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Rack,
        data: null,
      },
    };
    const turnIndicatorUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TurnIndicator,
        data: {
          players: this.turnOrder.map((player) => player.asDTO()),
          claimedPlayers: this.lobby.getClaimedPlayers().map((player) => player.asDTO()),
          turnIndex: this.turnIndex,
        },
      },
    };
    return { tileBagUpdate, boardUpdate, rackUpdate, turnIndicatorUpdate };
  }
  private advanceTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length;
    this.turnNumber++;
    this.broadcastStates();
    this.board.print();
  }

  private gameEnd() {
    //this.lobby.closeLobby();
  }
  public getTileBag() {
    return this.tileBag;
  }
}
