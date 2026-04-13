export type { RankingPlayer } from "@/types/ranking-player";
export type { ScoreEntry, ScoreValues } from "@/types/score-entry";
export type { Player } from "@/types/player";

export type PlayerEntry = import("@/types/player").Player;
export type RankedPlayer = import("@/types/ranking-player").RankingPlayer;

export type ScoreSheetDraft = {
  gameId: string;
  playerIds: string[];
};
