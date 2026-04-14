import type {
  SkyjoRound,
  SkyjoScoreSheetsByPlayer,
} from "@/types/skyjo-score";
import type { Player } from "@/types/player";

export type SkyjoPartySummary = {
  id: string;
  name: string;
  gameSlug: "skyjo";
  isActive: boolean;
  isFinished: boolean;
  createdAt: string;
  finishedAt?: string;
  updatedAt: string;
  playerCount: number;
  roundCount: number;
};

export type SkyjoPartySnapshot = {
  id: string;
  name: string;
  gameSlug: "skyjo";
  isActive: boolean;
  isFinished: boolean;
  createdAt: string;
  finishedAt?: string;
  updatedAt: string;
  players: Player[];
  rounds: SkyjoRound[];
  scoreSheets: SkyjoScoreSheetsByPlayer;
};

export type SaveSkyjoPartyInput = {
  id?: string;
  name: string;
  isFinished?: boolean;
  finishedAt?: string;
  players: Player[];
  rounds: SkyjoRound[];
  scoreSheets: SkyjoScoreSheetsByPlayer;
};
