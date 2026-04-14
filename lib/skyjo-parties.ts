import {
  deleteGameSession,
  getGameSessionById,
  listGameSessionRecords,
  saveGameSession,
  updateGameSessionMetadata,
} from "@/lib/game-sessions";
import { createEmptySkyjoScoreSheet } from "@/lib/skyjo-score";
import type {
  GameSessionRecord,
  GameSessionSummary,
} from "@/types/game-session";
import type {
  SaveSkyjoPartyInput,
  SkyjoPartySnapshot,
  SkyjoPartySummary,
} from "@/types/skyjo-party";
import type {
  SkyjoRound,
  SkyjoScoreSheet,
  SkyjoScoreSheetsByPlayer,
} from "@/types/skyjo-score";
import type { Player } from "@/types/player";

const SKYJO_GAME_SLUG = "skyjo" as const;

type SkyjoPartyData = {
  players: Player[];
  rounds: SkyjoRound[];
  scoreSheets: SkyjoScoreSheetsByPlayer;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function normalizeSkyjoScoreSheet(value: unknown): SkyjoScoreSheet {
  const input = isRecord(value) ? value : {};

  return {
    points: normalizeNumber(input.points),
  };
}

function normalizePlayers(value: unknown): Player[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== "string") {
      return [];
    }

    return [
      {
        id: entry.id,
        name: normalizeText(entry.name),
      },
    ];
  });
}

function normalizeRounds(value: unknown): SkyjoRound[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    if (!isRecord(entry) || typeof entry.id !== "string") {
      return [];
    }

    const name = normalizeText(entry.name).trim() || `Manche ${index + 1}`;

    return [
      {
        id: entry.id,
        name,
        note: typeof entry.note === "string" ? entry.note : undefined,
      },
    ];
  });
}

function normalizeScoreSheets(
  players: Player[],
  rounds: SkyjoRound[],
  value: unknown,
): SkyjoScoreSheetsByPlayer {
  const input: Record<string, unknown> = isRecord(value) ? value : {};
  const output: SkyjoScoreSheetsByPlayer = {};

  for (const player of players) {
    const rawPlayerScores = input[player.id];
    const playerScores: Record<string, unknown> = isRecord(rawPlayerScores)
      ? rawPlayerScores
      : {};

    output[player.id] = {};

    for (const round of rounds) {
      output[player.id][round.id] = normalizeSkyjoScoreSheet(
        playerScores[round.id],
      );
    }
  }

  return output;
}

function normalizeSkyjoPartyData(data: unknown): SkyjoPartyData {
  const input = isRecord(data) ? data : {};
  const players = normalizePlayers(input.players);
  const rounds = normalizeRounds(input.rounds);
  const scoreSheets = normalizeScoreSheets(players, rounds, input.scoreSheets);

  return {
    players,
    rounds,
    scoreSheets,
  };
}

function toSkyjoPartySummary(session: GameSessionSummary): SkyjoPartySummary {
  return {
    id: session.id,
    name: session.name,
    gameSlug: SKYJO_GAME_SLUG,
    isActive: session.isActive,
    isFinished: session.isFinished,
    createdAt: session.createdAt,
    finishedAt: session.finishedAt,
    updatedAt: session.updatedAt,
    playerCount: 0,
    roundCount: 0,
  };
}

function toSkyjoPartySnapshot(
  session: GameSessionRecord<SkyjoPartyData>,
): SkyjoPartySnapshot {
  return {
    id: session.id,
    name: session.name,
    gameSlug: SKYJO_GAME_SLUG,
    isActive: session.isActive,
    isFinished: session.isFinished,
    createdAt: session.createdAt,
    finishedAt: session.finishedAt,
    updatedAt: session.updatedAt,
    players: session.data.players,
    rounds: session.data.rounds,
    scoreSheets: session.data.scoreSheets,
  };
}

export async function listSkyjoParties(): Promise<SkyjoPartySummary[]> {
  const sessions = await listGameSessionRecords<unknown>(SKYJO_GAME_SLUG);

  return sessions.map((session) => {
    const data = normalizeSkyjoPartyData(session.data);

    return {
      ...toSkyjoPartySummary(session),
      playerCount: data.players.length,
      roundCount: data.rounds.length,
    };
  });
}

export async function getSkyjoPartyById(
  id: string,
): Promise<SkyjoPartySnapshot | null> {
  const session = await getGameSessionById<unknown>(id);

  if (!session || session.gameSlug !== SKYJO_GAME_SLUG) {
    return null;
  }

  const data = normalizeSkyjoPartyData(session.data);

  return toSkyjoPartySnapshot({
    ...session,
    data,
  });
}

export async function setSkyjoPartyActive(
  id: string,
  isActive: boolean,
): Promise<SkyjoPartySummary | null> {
  const session = await updateGameSessionMetadata(id, { isActive });

  if (!session || session.gameSlug !== SKYJO_GAME_SLUG) {
    return null;
  }

  const snapshot = await getSkyjoPartyById(id);

  return snapshot
    ? {
        ...toSkyjoPartySummary(session),
        playerCount: snapshot.players.length,
        roundCount: snapshot.rounds.length,
      }
    : {
        ...toSkyjoPartySummary(session),
        playerCount: 0,
        roundCount: 0,
      };
}

export async function renameSkyjoParty(
  id: string,
  name: string,
): Promise<SkyjoPartySummary | null> {
  const session = await updateGameSessionMetadata(id, { name });

  if (!session || session.gameSlug !== SKYJO_GAME_SLUG) {
    return null;
  }

  const snapshot = await getSkyjoPartyById(id);

  return snapshot
    ? {
        ...toSkyjoPartySummary(session),
        playerCount: snapshot.players.length,
        roundCount: snapshot.rounds.length,
      }
    : {
        ...toSkyjoPartySummary(session),
        playerCount: 0,
        roundCount: 0,
      };
}

export async function deleteSkyjoParty(id: string): Promise<boolean> {
  return deleteGameSession(id);
}

export async function saveSkyjoParty(
  input: SaveSkyjoPartyInput,
): Promise<SkyjoPartySnapshot> {
  const data: SkyjoPartyData = {
    players: input.players.map((player, index) => ({
      id: player.id,
      name: player.name.trim() || `Joueur ${index + 1}`,
    })),
    rounds: input.rounds.map((round, index) => ({
      id: round.id,
      name: round.name.trim() || `Manche ${index + 1}`,
      note: round.note?.trim() ? round.note.trim() : "",
    })),
    scoreSheets: {},
  };

  for (const player of data.players) {
    data.scoreSheets[player.id] = {};

    for (const round of data.rounds) {
      data.scoreSheets[player.id][round.id] =
        input.scoreSheets[player.id]?.[round.id] ??
        createEmptySkyjoScoreSheet();
    }
  }

  const session = await saveGameSession<SkyjoPartyData>({
    id: input.id,
    name: input.name,
    gameSlug: SKYJO_GAME_SLUG,
    isFinished: input.isFinished,
    finishedAt: input.finishedAt,
    data,
  });

  return toSkyjoPartySnapshot(session);
}
