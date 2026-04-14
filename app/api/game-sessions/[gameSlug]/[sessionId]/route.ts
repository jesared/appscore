import { getRequiredGame } from "@/lib/games/registry";
import {
  deleteRegisteredGameSession,
  getRegisteredGameSessionById,
  type RegisteredGameSessionRuntimeDefinition,
  updateRegisteredGameSession,
} from "@/lib/games/session-api";

type RouteContext = {
  params: Promise<{
    gameSlug: string;
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { gameSlug, sessionId } = await context.params;
  const game = getRequiredGame(gameSlug) as RegisteredGameSessionRuntimeDefinition;

  return getRegisteredGameSessionById(game, sessionId);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { gameSlug, sessionId } = await context.params;
  const game = getRequiredGame(gameSlug) as RegisteredGameSessionRuntimeDefinition;

  return updateRegisteredGameSession(game, sessionId, request);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { gameSlug, sessionId } = await context.params;
  const game = getRequiredGame(gameSlug) as RegisteredGameSessionRuntimeDefinition;

  return deleteRegisteredGameSession(game, sessionId);
}
