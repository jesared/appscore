import { NextResponse } from "next/server";

import type { RegisteredGameDefinition } from "@/types/registered-game";

type SessionMutationPayload = {
  isActive?: boolean;
  name?: string;
};

export type RegisteredGameSessionRuntimeDefinition = RegisteredGameDefinition<
  unknown,
  unknown,
  {
    players: unknown[];
    rounds: unknown[];
  }
>;

function getGamePlayerLimitMessage<
  TSummary,
  TSnapshot,
  TSaveInput,
>(
  game: RegisteredGameDefinition<TSummary, TSnapshot, TSaveInput>,
  maxPlayers: number,
) {
  return `Une ${game.sessionLabel} ${game.name} ne peut pas depasser ${maxPlayers} joueurs.`;
}

export async function listRegisteredGameSessions<
  TSummary,
  TSnapshot,
  TSaveInput,
>(game: RegisteredGameDefinition<TSummary, TSnapshot, TSaveInput>) {
  try {
    const sessions = await game.adapter.listSessions();
    return NextResponse.json({ parties: sessions });
  } catch {
    return NextResponse.json(
      { message: "Base de donnees indisponible pour le moment." },
      { status: 503 },
    );
  }
}

export async function saveRegisteredGameSession<
  TSummary,
  TSnapshot,
  TSaveInput extends {
    players: unknown[];
    rounds: unknown[];
  },
>(
  game: RegisteredGameDefinition<TSummary, TSnapshot, TSaveInput>,
  request: Request,
) {
  try {
    const payload = (await request.json()) as Partial<TSaveInput>;

    if (!payload || !Array.isArray(payload.players) || !Array.isArray(payload.rounds)) {
      return NextResponse.json(
        { message: "Payload de partie invalide." },
        { status: 400 },
      );
    }

    const maxPlayers = game.maxPlayers;

    if (typeof maxPlayers === "number" && payload.players.length > maxPlayers) {
      return NextResponse.json(
        {
          message: getGamePlayerLimitMessage(game, maxPlayers),
        },
        { status: 400 },
      );
    }

    const session = await game.adapter.saveSession(payload as TSaveInput);

    return NextResponse.json({ party: session });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "La sauvegarde en base a echoue." },
      { status: 503 },
    );
  }
}

export async function getRegisteredGameSessionById<
  TSummary,
  TSnapshot,
  TSaveInput,
>(
  game: RegisteredGameDefinition<TSummary, TSnapshot, TSaveInput>,
  sessionId: string,
) {
  try {
    const session = await game.adapter.getSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { message: `${game.sessionLabel[0].toUpperCase()}${game.sessionLabel.slice(1)} introuvable.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ party: session });
  } catch {
    return NextResponse.json(
      { message: `Chargement de la ${game.sessionLabel} impossible.` },
      { status: 503 },
    );
  }
}

export async function updateRegisteredGameSession<
  TSummary,
  TSnapshot,
  TSaveInput,
>(
  game: RegisteredGameDefinition<TSummary, TSnapshot, TSaveInput>,
  sessionId: string,
  request: Request,
) {
  try {
    const payload = (await request.json()) as SessionMutationPayload;

    if (typeof payload?.name === "string") {
      const session = await game.adapter.renameSession(sessionId, payload.name);

      if (!session) {
        return NextResponse.json(
          { message: `${game.sessionLabel[0].toUpperCase()}${game.sessionLabel.slice(1)} introuvable.` },
          { status: 404 },
        );
      }

      return NextResponse.json({ party: session });
    }

    if (typeof payload?.isActive !== "boolean") {
      return NextResponse.json(
        { message: `Mise a jour de ${game.sessionLabel} invalide.` },
        { status: 400 },
      );
    }

    const session = await game.adapter.setSessionActive(sessionId, payload.isActive);

    if (!session) {
      return NextResponse.json(
        { message: `${game.sessionLabel[0].toUpperCase()}${game.sessionLabel.slice(1)} introuvable.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ party: session });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: `Mise a jour de la ${game.sessionLabel} impossible.` },
      { status: 503 },
    );
  }
}

export async function deleteRegisteredGameSession<
  TSummary,
  TSnapshot,
  TSaveInput,
>(
  game: RegisteredGameDefinition<TSummary, TSnapshot, TSaveInput>,
  sessionId: string,
) {
  try {
    const wasDeleted = await game.adapter.deleteSession(sessionId);

    if (!wasDeleted) {
      return NextResponse.json(
        { message: `${game.sessionLabel[0].toUpperCase()}${game.sessionLabel.slice(1)} introuvable.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: `Suppression de la ${game.sessionLabel} impossible.` },
      { status: 503 },
    );
  }
}
