import type {
  GameSession as PrismaGameSession,
  Prisma,
} from "../generated/prisma";

import { prisma } from "@/lib/prisma";
import type {
  GameSessionRecord,
  GameSessionSummary,
  SaveGameSessionInput,
} from "@/types/game-session";

type PersistedGameSession = Omit<PrismaGameSession, "data"> & {
  data: unknown;
};

function toGameSessionSummary(session: PersistedGameSession): GameSessionSummary {
  return {
    id: session.id,
    name: session.name,
    gameSlug: session.gameSlug,
    isActive: session.isActive,
    isFinished: session.isFinished,
    createdAt: session.createdAt.toISOString(),
    finishedAt: session.finishedAt?.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function toGameSessionRecord<TData>(
  session: PersistedGameSession,
): GameSessionRecord<TData> {
  return {
    ...toGameSessionSummary(session),
    data: session.data as TData,
  };
}

export async function listGameSessions(
  gameSlug?: string,
  take = 12,
): Promise<GameSessionSummary[]> {
  const sessions = await prisma.gameSession.findMany({
    where: gameSlug ? { gameSlug } : undefined,
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    take,
  });

  return sessions.map((session) => toGameSessionSummary(session));
}

export async function listGameSessionRecords<TData>(
  gameSlug?: string,
  take = 12,
): Promise<GameSessionRecord<TData>[]> {
  const sessions = await prisma.gameSession.findMany({
    where: gameSlug ? { gameSlug } : undefined,
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    take,
  });

  return sessions.map((session) => toGameSessionRecord<TData>(session));
}

export async function getGameSessionById<TData>(
  id: string,
): Promise<GameSessionRecord<TData> | null> {
  const session = await prisma.gameSession.findUnique({
    where: { id },
  });

  if (!session) {
    return null;
  }

  return toGameSessionRecord<TData>(session);
}

export async function saveGameSession<TData>(
  input: SaveGameSessionInput<TData>,
): Promise<GameSessionRecord<TData>> {
  const normalizedName = input.name.trim() || "Partie";
  const isFinished = input.isFinished ?? false;
  const parsedFinishedAt = input.finishedAt ? new Date(input.finishedAt) : new Date();
  const finishedAt = isFinished
    ? Number.isNaN(parsedFinishedAt.getTime())
      ? new Date()
      : parsedFinishedAt
    : null;

  const session = input.id
    ? await prisma.gameSession.update({
        where: { id: input.id },
        data: {
          name: normalizedName,
          gameSlug: input.gameSlug,
          isFinished,
          finishedAt,
          data: input.data as Prisma.InputJsonValue,
        },
      })
    : await prisma.gameSession.create({
        data: {
          name: normalizedName,
          gameSlug: input.gameSlug,
          isFinished,
          finishedAt,
          data: input.data as Prisma.InputJsonValue,
        },
      });

  return toGameSessionRecord<TData>(session);
}

export async function updateGameSessionMetadata(
  id: string,
  input: {
    isActive?: boolean;
    name?: string;
  },
): Promise<GameSessionSummary | null> {
  const data: {
    isActive?: boolean;
    name?: string;
  } = {};

  if (typeof input.isActive === "boolean") {
    data.isActive = input.isActive;
  }

  if (typeof input.name === "string") {
    const normalizedName = input.name.trim();

    if (!normalizedName) {
      throw new Error("Le nom de la partie ne peut pas etre vide.");
    }

    data.name = normalizedName;
  }

  const session = await prisma.gameSession
    .update({
      where: { id },
      data,
    })
    .catch(() => null);

  if (!session) {
    return null;
  }

  return toGameSessionSummary(session);
}

export async function deleteGameSession(id: string): Promise<boolean> {
  const deletedSession = await prisma.gameSession
    .delete({
      where: { id },
    })
    .catch(() => null);

  return deletedSession !== null;
}
