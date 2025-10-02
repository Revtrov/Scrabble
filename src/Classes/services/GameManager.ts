import { ServerResponse } from "../../websocket";
import { Board } from "../Board";
import { Lobby } from "../Lobby";
import { Player } from "../Player";
import { z } from "zod";

enum TurnActionId { Move = "Move", Exchange = "Exchange", Pass = "Pass" }

const MoveDataSchema = z.object({
  direction:z.string(),
  startIndex:z.object({
    i:z.number(),
    j:z.number()
  }),
  tileIds: z.array(z.string())
});

const ExchangeDataSchema = z.object({
  tileIds: z.array(z.string())
});

const PassDataSchema = z.object({});

const TurnActionSchema = z.discriminatedUnion("actionId", [
  z.object({ actionId: z.literal(TurnActionId.Move), actionData: MoveDataSchema }),
  z.object({ actionId: z.literal(TurnActionId.Exchange), actionData: ExchangeDataSchema }),
  z.object({ actionId: z.literal(TurnActionId.Pass), actionData: PassDataSchema }),
]);

type TurnActionDTO = z.infer<typeof TurnActionSchema>;

export class GameManager {
  private lobby: Lobby;
  private players: Set<Player>;
  private board: Board;
  private turnOrder: Array<Player>;
  private turnIndex: number = 0;
  constructor(lobby: Lobby, players: Set<Player>) {
    this.lobby = lobby;
    this.players = players;
    this.turnOrder = [...this.players.values()];
    this.board = new Board()
    this.board.print()
  }

  handleTurnAction(msg: ServerResponse) {
    if (!msg.gameAction) return;

    let action: TurnActionDTO;
    try {
      action = TurnActionSchema.parse(msg.gameAction);
    } catch (err) {
      console.error("Invalid action:", err);
      return;
    }

    switch (action.actionId) {
      case TurnActionId.Move:
        this.handleMove(action.actionData);
        break;
      case TurnActionId.Exchange:
        this.handleExchange(action.actionData);
        break;
      case TurnActionId.Pass:
        this.handlePass(action.actionData);
        break;
    }

    this.advanceTurn();
  }
  private handleMove(moveData: z.infer<typeof MoveDataSchema>) {
    const {direction, startIndex, tileIds} = moveData;
    // validate placement, update board, score points
  }

  private handleExchange(exchangeData: z.infer<typeof ExchangeDataSchema>) {
    // remove tiles from rack, draw new ones from bag
  }

  private handlePass(_: z.infer<typeof PassDataSchema>) {
    // maybe track consecutive passes to end the game
  }
  private advanceTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length;
  }

  private gameEnd(){
    //this.lobby.closeLobby();
  }


}