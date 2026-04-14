import {
  deleteFlowersParty,
  getFlowersPartyById,
  listFlowersParties,
  renameFlowersParty,
  saveFlowersParty,
  setFlowersPartyActive,
} from "@/lib/flowers-parties";
import { FLOWERS_MAX_PLAYERS } from "@/lib/flowers-score";
import type {
  FlowersPartySnapshot,
  FlowersPartySummary,
  SaveFlowersPartyInput,
} from "@/types/flowers-party";
import type { RegisteredGameDefinition } from "@/types/registered-game";

export const flowersGameDefinition: RegisteredGameDefinition<
  FlowersPartySummary,
  FlowersPartySnapshot,
  SaveFlowersPartyInput
> = {
  slug: "flowers",
  name: "Flowers",
  description:
    "Une feuille de marque multi-manches avec total cumule, classement final et sauvegarde de partie.",
  sessionLabel: "partie",
  sessionLabelPlural: "parties",
  apiBasePath: "/api/game-sessions/flowers",
  maxPlayers: FLOWERS_MAX_PLAYERS,
  adapter: {
    listSessions: listFlowersParties,
    getSessionById: getFlowersPartyById,
    saveSession: saveFlowersParty,
    renameSession: renameFlowersParty,
    setSessionActive: setFlowersPartyActive,
    deleteSession: deleteFlowersParty,
  },
};
