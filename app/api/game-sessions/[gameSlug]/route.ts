import { getRequiredGame } from "@/lib/games/registry";
import {
  listRegisteredGameSessions,
  type RegisteredGameSessionRuntimeDefinition,
  saveRegisteredGameSession,
} from "@/lib/games/session-api";

type RouteContext = {
  params: Promise<{
    gameSlug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { gameSlug } = await context.params;
  const game = getRequiredGame(gameSlug) as RegisteredGameSessionRuntimeDefinition;

  return listRegisteredGameSessions(game);
}

export async function POST(request: Request, context: RouteContext) {
  const { gameSlug } = await context.params;
  const game = getRequiredGame(gameSlug) as RegisteredGameSessionRuntimeDefinition;

  return saveRegisteredGameSession(game, request);
}
