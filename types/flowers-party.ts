import type { FlowersRound, FlowersScoreSheetsByPlayer } from "@/types/flowers-score";
import type { Player } from "@/types/player";

export type FlowersPartySummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  playerCount: number;
  roundCount: number;
};

export type FlowersPartySnapshot = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  players: Player[];
  rounds: FlowersRound[];
  scoreSheets: FlowersScoreSheetsByPlayer;
};

export type SaveFlowersPartyInput = {
  id?: string;
  name: string;
  players: Player[];
  rounds: FlowersRound[];
  scoreSheets: FlowersScoreSheetsByPlayer;
};
