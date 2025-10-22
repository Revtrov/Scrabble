import { ServerResponse } from "../../websocket";
import { Board } from "../Board";
import { Lobby } from "../Lobby";
import { Player } from "../Player";
import { z } from "zod";
import { TileBag } from "../TileBag";
import { Dictionary } from "../Dictionary";
import { Rack } from "../Rack";
import { Tile } from "../Tile";

enum StateUpdateType {
  TileBag = "TileBag",
  Board = "Board",
  Rack = "Rack",
  TurnIndicator = "TurnIndicator"
}
export interface StateUpdateBody {
  type: StateUpdateType,
  data: any

}
export interface StateUpdateMessage extends ServerResponse {
  type: string,
  stateUpdate: StateUpdateBody,
}

enum TurnActionId { Move = "Move", Exchange = "Exchange", Pass = "Pass" }

export enum Direction {
  Vertical = "V",
  Horizontal = "H"
}
export interface Coord {
  i: number,
  j: number
}

const MoveDataSchema = z.object({
  direction: z.string(),
  startIndex: z.object({
    i: z.number(),
    j: z.number()
  }),
  tileIds: z.array(z.string())
});

const ExchangeDataSchema = z.object({
  tileIds: z.array(z.string())
});

const PassDataSchema = z.undefined();

const TurnActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(TurnActionId.Move), data: MoveDataSchema }),
  z.object({ type: z.literal(TurnActionId.Exchange), data: ExchangeDataSchema }),
  z.object({ type: z.literal(TurnActionId.Pass), data: PassDataSchema }),
]);

type TurnActionDTO = z.infer<typeof TurnActionSchema>;

enum TurnActionResult {
  Success = "Success",
  Failure = "Failure",
  InvalidWord = "InvalidWord",
  IllegalTiles = "IllegalTiles",
  NotPlayersTurn = "NotPlayersTurn",
  InvalidLocation = "InvalidLocation"
}

export class GameManager {
  private lobby: Lobby;
  private players: Set<Player>;
  private board: Board;
  private turnOrder: Array<Player>;
  private turnIndex: number = 0;
  private turnNumber: number = 1;
  private tileBag: TileBag;
  constructor(lobby: Lobby, players: Set<Player>) {
    this.lobby = lobby;
    this.players = players;
    this.turnOrder = [...this.players.values()];
    this.tileBag = new TileBag()
    for (const player of this.players.values()) {
      player.setRack(new Rack(this.tileBag));
    }
    this.board = new Board()
    this.board.print()
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
      containsStart =
        start.i === startIndex.i &&
        start.j >= startIndex.j &&
        start.j < startIndex.j + tiles.length;
    } else {
      containsStart =
        start.j === startIndex.j &&
        start.i >= startIndex.i &&
        start.i < startIndex.i + tiles.length;
    }
    return containsStart;
  }
  private getAdjoiningWords(startIndex: Coord, direction: Direction, tiles: Tile[]): Tile[][] {
  const words: Tile[][] = [];

  // place tiles temporarily (assume placeWord handles intersections)
  this.board.placeWord(direction, startIndex, tiles);

  const step = (d: Direction, delta: number): [number, number] =>
    d === Direction.Horizontal ? [0, delta] : [delta, 0];

  const buildWord = (si: number, sj: number, d: Direction): Tile[] => {
    const [backDi, backDj] = step(d, -1);
    const [forwDi, forwDj] = step(d, 1);

    // start from the given cell but use local vars
    let i = si;
    let j = sj;

    // move backward to the beginning of contiguous tiles
    while (this.board.isInBounds(i + backDi, j + backDj) &&
           this.board.getCell(i + backDi, j + backDj)?.getTile()) {
      i += backDi;
      j += backDj;
    }

    // collect forward
    const word: Tile[] = [];
    while (this.board.isInBounds(i, j) && this.board.getCell(i, j)?.getTile()) {
      word.push(this.board.getCell(i, j)!.getTile()!);
      i += forwDi;
      j += forwDj;
    }

    return word;
  };

  try {
    // 1) main word: build from the span of the placed tiles
    const mainWord = buildWord(startIndex.i, startIndex.j, direction);
    if (mainWord.length > 0) words.push(mainWord);

    // 2) perpendicular words: iterate over the placed span and build only when there's a perpendicular neighbor
    const perpendicular = direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;

    for (let k = 0; k < tiles.length; k++) {
      const i = startIndex.i + (direction === Direction.Vertical ? k : 0);
      const j = startIndex.j + (direction === Direction.Horizontal ? k : 0);

      // skip if cell has no tile (shouldn't after placeWord but safe)
      const cell = this.board.getCell(i, j);
      if (!cell || !cell.getTile()) continue;

      // quick check: only build a perpendicular word if there's at least one neighbor along perpendicular axis
      const [backDi, backDj] = step(perpendicular, -1);
      const [forwDi, forwDj] = step(perpendicular, 1);
      const hasNeighbor =
        (this.board.isInBounds(i + backDi, j + backDj) && this.board.getCell(i + backDi, j + backDj)?.getTile()) ||
        (this.board.isInBounds(i + forwDi, j + forwDj) && this.board.getCell(i + forwDi, j + forwDj)?.getTile());

      if (!hasNeighbor) continue;

      const word = buildWord(i, j, perpendicular);
      if (word.length > 1) words.push(word);
    }
  } finally {
    // 3) cleanup - always unplace
    this.board.unPlaceWord(direction, startIndex, tiles);
  }
  return words;
}



  private handleMove(playerId: string, moveData: z.infer<typeof MoveDataSchema>): TurnActionResult {
    const { direction, startIndex, tileIds } = moveData;

    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`))
      return TurnActionResult.NotPlayersTurn;
    }

    const playerRack = player.getRack()
    if (!playerRack.hasTileIds(tileIds)) {
      console.log(new Error("Used tiles not in player's Rack"))
      return TurnActionResult.IllegalTiles;
    }

    const tiles = tileIds.map(tileId => playerRack.getTileIdMap().get(tileId));

    const words = this.getAdjoiningWords(startIndex as Coord, direction as Direction, tiles);
    const wordCheck = words.every(word => Dictionary.hasWord(word.map(tile=>tile.getLetter()).join("")));
    if (!wordCheck) {
      console.log(new Error(`not in Dictionary`))
      return TurnActionResult.InvalidWord
    };

    if (this.turnNumber == 0) { // must place word on center on first turn
      if (!this.isValidStartMove(startIndex as Coord, direction as Direction, tiles)) return TurnActionResult.InvalidLocation;
    }
    // check if connected words too
    // update board
    this.board.placeWord(direction as Direction, startIndex as Coord, tiles);
    playerRack.removeTiles(tiles);
    playerRack.fill()
    return TurnActionResult.Success;
  }

  private handleExchange(playerId: string, exchangeData: z.infer<typeof ExchangeDataSchema>): TurnActionResult {
    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`))
      return TurnActionResult.NotPlayersTurn;
    }

    const playerRack = player.getRack()
    if (!playerRack.hasTileIds(exchangeData.tileIds)) {
      console.log(new Error("Used tiles not in player's Rack"))
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
      console.log(new Error(`Not player ${player.getId()}'s turn`))
      return TurnActionResult.NotPlayersTurn;
    }
    return TurnActionResult.Success;
  }
  private broadcastStates() {
    for (const state of Object.values(this.getStates()) as ServerResponse[]) {
      this.lobby.broadcast(state);
    };
  }
  public sendStatesToClient(clientId: string) {
    for (const state of Object.values(this.getStates()) as ServerResponse[]) {
      state.clientId = clientId;
      this.lobby.sendToClient(state);
    };
  }
  private getStates(): Record<any, ServerResponse> {
    const tileBagUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TileBag,
        data: {
          tileBag: this.tileBag.asDTO()
        }
      }
    }
    const boardUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Board,
        data: {
          board: this.board.asDTO()
        }
      }
    }
    const rackUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Rack,
        data: null
      }
    }
    const turnIndicatorUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TurnIndicator,
        data: {
          players: this.turnOrder.map(player => player.asDTO()),
          turnIndex: this.turnIndex
        }
      }
    }
    return { tileBagUpdate, boardUpdate, rackUpdate, turnIndicatorUpdate }
  }
  private advanceTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length;
    console.log(this.turnIndex)
    this.turnNumber++;
    this.broadcastStates();
    this.board.print()
  }

  private gameEnd() {
    //this.lobby.closeLobby();
  }
  public getTileBag() {
    return this.tileBag;
  }


}