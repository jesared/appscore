import { getRequiredGame } from "@/lib/games/registry";
import {
  deleteRegisteredGameSession,
  getRegisteredGameSessionById,
  updateRegisteredGameSession,
} from "@/lib/games/session-api";

const flowersGame = getRequiredGame("flowers");

type RouteContext = {
  params: Promise<{
    partyId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { partyId } = await context.params;

  return getRegisteredGameSessionById(flowersGame, partyId);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { partyId } = await context.params;

  return updateRegisteredGameSession(flowersGame, partyId, request);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { partyId } = await context.params;

  return deleteRegisteredGameSession(flowersGame, partyId);
}
