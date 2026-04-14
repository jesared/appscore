import {
  deleteSkyjoParty,
  getSkyjoPartyById,
  listSkyjoParties,
  renameSkyjoParty,
  saveSkyjoParty,
  setSkyjoPartyActive,
} from "@/lib/skyjo-parties";
import type {
  SaveSkyjoPartyInput,
  SkyjoPartySnapshot,
  SkyjoPartySummary,
} from "@/types/skyjo-party";
import type { RegisteredGameDefinition } from "@/types/registered-game";

export const skyjoGameDefinition: RegisteredGameDefinition<
  SkyjoPartySummary,
  SkyjoPartySnapshot,
  SaveSkyjoPartyInput
> = {
  slug: "skyjo",
  name: "Skyjo",
  description:
    "Structure de session multi-manches prete pour une future feuille de score Skyjo.",
  sessionLabel: "partie",
  sessionLabelPlural: "parties",
  apiBasePath: "/api/game-sessions/skyjo",
  adapter: {
    listSessions: listSkyjoParties,
    getSessionById: getSkyjoPartyById,
    saveSession: saveSkyjoParty,
    renameSession: renameSkyjoParty,
    setSessionActive: setSkyjoPartyActive,
    deleteSession: deleteSkyjoParty,
  },
};
