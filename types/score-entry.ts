import type { GameTemplate } from "@/types/game-template";
import type { Player } from "@/types/player";
import type { ScoreField } from "@/types/score-field";

export type ScoreValues = Record<ScoreField["id"], number>;

export type ScoreEntry = {
  gameId: GameTemplate["id"];
  playerId: Player["id"];
  values: ScoreValues;
};
