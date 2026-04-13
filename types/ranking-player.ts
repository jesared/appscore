import type { Player } from "@/types/player";
import type { ScoreEntry } from "@/types/score-entry";

export type RankingPlayer = Player & {
  rank: number;
  total: number;
  scoreEntry: ScoreEntry;
};
