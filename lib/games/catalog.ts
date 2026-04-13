import { gameTemplates, gameTemplatesById } from "@/data/games";

export function getGameCatalog() {
  return gameTemplates;
}

export function getGameById(gameId: string) {
  return gameTemplatesById[gameId];
}

export function hasGame(gameId: string) {
  return Boolean(getGameById(gameId));
}
