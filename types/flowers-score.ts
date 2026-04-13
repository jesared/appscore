import type { Player } from "@/types/player";

export type FlowersColorScoreFieldId =
  | "blueScore"
  | "yellowScore"
  | "redScore"
  | "greenScore";

export type FlowersExtraScoreFieldId = "butterflyScore" | "invalidCards";

export type FlowersScoreFieldId = FlowersColorScoreFieldId | FlowersExtraScoreFieldId;

export type FlowersScoreFieldKind = "color" | "bonus" | "penalty";

export type FlowersScoreField = {
  id: FlowersScoreFieldId;
  label: string;
  kind: FlowersScoreFieldKind;
  description?: string;
  accentColor?: string;
  min?: number;
};

export type FlowersScoreSheet = {
  blueScore: number;
  yellowScore: number;
  redScore: number;
  greenScore: number;
  butterflyScore: number;
  invalidCards: number;
};

export type FlowersScoreCalculation = {
  colorTotal: number;
  butterflyPoints: number;
  invalidPenalty: number;
  finalTotal: number;
};

export type FlowersRound = {
  id: string;
  name: string;
};

export type FlowersRoundScoreSheets = Record<string, FlowersScoreSheet>;

export type FlowersScoreSheetsByPlayer = Record<string, FlowersRoundScoreSheets>;

export type FlowersRoundTotal = FlowersScoreCalculation & {
  roundId: string;
  roundName: string;
};

export type FlowersRankingPlayer = Player & {
  rank: number;
  roundTotals: FlowersRoundTotal[];
  cumulativeTotal: number;
};
