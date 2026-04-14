import { getRequiredGame } from "@/lib/games/registry";
import {
  listRegisteredGameSessions,
  saveRegisteredGameSession,
} from "@/lib/games/session-api";

const flowersGame = getRequiredGame("flowers");

export async function GET() {
  return listRegisteredGameSessions(flowersGame);
}

export async function POST(request: Request) {
  return saveRegisteredGameSession(flowersGame, request);
}
