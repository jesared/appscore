import { flowersGame } from "@/data/games/flowers";
import type { GameTemplate } from "@/types/game-template";

export const gameTemplates: GameTemplate[] = [flowersGame];

export const gameTemplatesById: Record<string, GameTemplate> = Object.fromEntries(
  gameTemplates.map((game) => [game.id, game]),
);
