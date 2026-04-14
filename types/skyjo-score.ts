import type { Player } from "@/types/player";

export type SkyjoScoreSheet = {
  points: number;
};

export type SkyjoRound = {
  id: string;
  name: string;
  note?: string;
};

export type SkyjoRoundScoreSheets = Record<string, SkyjoScoreSheet>;

export type SkyjoScoreSheetsByPlayer = Record<string, SkyjoRoundScoreSheets>;

export type SkyjoRoundTotal = {
  points: number;
  roundId: string;
  roundName: string;
};

export type SkyjoRankingPlayer = Player & {
  rank: number;
  roundTotals: SkyjoRoundTotal[];
  cumulativeTotal: number;
};
