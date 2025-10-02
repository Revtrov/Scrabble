import { Router } from "express";
import * as lobbyController from "../controllers/lobbyController";

const router = Router();

/**
 * GET /board
 * Returns the full chess board
 */
router.get("/create", lobbyController.createLobby);
router.get("/list", lobbyController.lobbyList);
router.get("/:lobbyId", lobbyController.getLobbyById);

// router.patch("/:lobbyId/piece/:pieceId/move/:location", lobbyController.movePiece);

// router.get("/piece/:pieceId", lobbyController.getPieceById);

// router.get("/:lobbyId/board", lobbyController.getBoard);

/**
 * Get the rack of a player
 */
router.get("/:lobbyId/player/:playerId/rack", lobbyController.getPlayerRack);


export default router;
