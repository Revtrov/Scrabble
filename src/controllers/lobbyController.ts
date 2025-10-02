import { Request, Response } from "express";
import { Lobby, lobbyMap } from "../Classes/Lobby";

export const createLobby = (req: Request, res: Response) => {
  const lobby = new Lobby();
  return res.status(200).json(lobby.asDTO());
};

export const lobbyList = async (req: Request, res: Response) => {
  const lobbyList = [...lobbyMap.values()].map(lobby => lobby.asDTO())
  console.log(lobbyList.length)
  return res.status(200).json(lobbyList)
}

export const getLobbyById = (req: Request, res: Response) => {
  const lobbyId = req.params.lobbyId;
  const lobby = lobbyMap.get(lobbyId);
  if (!lobby) return res.status(404).json({ message: "Lobby not found" });
  return res.status(200).json(lobby.asDTO());
};

export const getPlayerRack = (req: Request, res: Response) => {
  const lobbyId = req.params.lobbyId;
  const lobby = lobbyMap.get(lobbyId);
  if (!lobby) return res.status(404).json({ message: "Lobby not found" });

  const playerId = req.params.playerId;
  const player = lobby.playerIdMap.get(playerId);
  if (!player) return res.status(404).json({ message: "Player not found" });
  return res.status(200).json(player.getRack().asDTO())
}
