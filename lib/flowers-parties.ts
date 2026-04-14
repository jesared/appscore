import {
  deleteGameSession,
  getGameSessionById,
  listGameSessionRecords,
  saveGameSession,
  updateGameSessionMetadata,
} from "@/lib/game-sessions";
import {
  FLOWERS_MAX_PLAYERS,
  createEmptyFlowersScoreSheet,
} from "@/lib/flowers-score";
import type {
  GameSessionRecord,
  GameSessionSummary,
} from "@/types/game-session";
import type {
  FlowersPartySnapshot,
  FlowersPartySummary,
  SaveFlowersPartyInput,
} from "@/types/flowers-party";
import type {
  FlowersRound,
  FlowersScoreSheet,
  FlowersScoreSheetsByPlayer,
} from "@/types/flowers-score";
import type { Player } from "@/types/player";

const FLOWERS_GAME_SLUG = "flowers" as const;

type FlowersPartyData = {
  players: Player[];
  rounds: FlowersRound[];
  scoreSheets: FlowersScoreSheetsByPlayer;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeNonNegativeNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return value < 0 ? 0 : value;
}

function normalizeFlowersScoreSheet(value: unknown): FlowersScoreSheet {
  const input = isRecord(value) ? value : {};

  return {
    blueScore: normalizeNonNegativeNumber(input.blueScore),
    yellowScore: normalizeNonNegativeNumber(input.yellowScore),
    redScore: normalizeNonNegativeNumber(input.redScore),
    greenScore: normalizeNonNegativeNumber(input.greenScore),
    butterflyScore: normalizeNonNegativeNumber(input.butterflyScore),
    invalidCards: normalizeNonNegativeNumber(input.invalidCards),
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

function normalizeRounds(value: unknown): FlowersRound[] {
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
  rounds: FlowersRound[],
  value: unknown,
): FlowersScoreSheetsByPlayer {
  const input: Record<string, unknown> = isRecord(value) ? value : {};
  const output: FlowersScoreSheetsByPlayer = {};

  for (const player of players) {
    const rawPlayerScores = input[player.id];
    const playerScores: Record<string, unknown> = isRecord(rawPlayerScores)
      ? rawPlayerScores
      : {};

    output[player.id] = {};

    for (const round of rounds) {
      output[player.id][round.id] = normalizeFlowersScoreSheet(
        playerScores[round.id],
      );
    }
  }

  return output;
}

function normalizeFlowersPartyData(data: unknown): FlowersPartyData {
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

function toFlowersPartySummary(session: GameSessionSummary): FlowersPartySummary {
  return {
    id: session.id,
    name: session.name,
    gameSlug: FLOWERS_GAME_SLUG,
    isActive: session.isActive,
    isFinished: session.isFinished,
    createdAt: session.createdAt,
    finishedAt: session.finishedAt,
    updatedAt: session.updatedAt,
    playerCount: 0,
    roundCount: 0,
  };
}

function toFlowersPartySnapshot(
  session: GameSessionRecord<FlowersPartyData>,
): FlowersPartySnapshot {
  return {
    id: session.id,
    name: session.name,
    gameSlug: FLOWERS_GAME_SLUG,
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

export async function listFlowersParties(): Promise<FlowersPartySummary[]> {
  const sessions = await listGameSessionRecords<unknown>(FLOWERS_GAME_SLUG);

  return sessions.map((session) => {
    const data = normalizeFlowersPartyData(session.data);

    return {
      ...toFlowersPartySummary(session),
      playerCount: data.players.length,
      roundCount: data.rounds.length,
    };
  });
}

export async function getFlowersPartyById(
  id: string,
): Promise<FlowersPartySnapshot | null> {
  const session = await getGameSessionById<unknown>(id);

  if (!session || session.gameSlug !== FLOWERS_GAME_SLUG) {
    return null;
  }

  const data = normalizeFlowersPartyData(session.data);

  return toFlowersPartySnapshot({
    ...session,
    data,
  });
}

export async function setFlowersPartyActive(
  id: string,
  isActive: boolean,
): Promise<FlowersPartySummary | null> {
  const session = await updateGameSessionMetadata(id, { isActive });

  if (!session || session.gameSlug !== FLOWERS_GAME_SLUG) {
    return null;
  }

  const snapshot = await getFlowersPartyById(id);

  return snapshot
    ? {
        ...toFlowersPartySummary(session),
        playerCount: snapshot.players.length,
        roundCount: snapshot.rounds.length,
      }
    : {
        ...toFlowersPartySummary(session),
        playerCount: 0,
        roundCount: 0,
      };
}

export async function renameFlowersParty(
  id: string,
  name: string,
): Promise<FlowersPartySummary | null> {
  const session = await updateGameSessionMetadata(id, { name });

  if (!session || session.gameSlug !== FLOWERS_GAME_SLUG) {
    return null;
  }

  const snapshot = await getFlowersPartyById(id);

  return snapshot
    ? {
        ...toFlowersPartySummary(session),
        playerCount: snapshot.players.length,
        roundCount: snapshot.rounds.length,
      }
    : {
        ...toFlowersPartySummary(session),
        playerCount: 0,
        roundCount: 0,
      };
}

export async function deleteFlowersParty(id: string): Promise<boolean> {
  return deleteGameSession(id);
}

export async function saveFlowersParty(
  input: SaveFlowersPartyInput,
): Promise<FlowersPartySnapshot> {
  if (input.players.length > FLOWERS_MAX_PLAYERS) {
    throw new Error(
      `Flowers est limite a ${FLOWERS_MAX_PLAYERS} joueurs par partie.`,
    );
  }

  const data: FlowersPartyData = {
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
        input.scoreSheets[player.id]?.[round.id] ?? createEmptyFlowersScoreSheet();
    }
  }

  const session = await saveGameSession<FlowersPartyData>({
    id: input.id,
    name: input.name,
    gameSlug: FLOWERS_GAME_SLUG,
    isFinished: input.isFinished,
    finishedAt: input.finishedAt,
    data,
  });

  return toFlowersPartySnapshot(session);
}
