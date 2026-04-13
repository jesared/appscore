import { NextResponse } from "next/server";

import { FLOWERS_MAX_PLAYERS } from "@/lib/flowers-score";
import { listFlowersParties, saveFlowersParty } from "@/lib/flowers-parties";
import type { SaveFlowersPartyInput } from "@/types/flowers-party";

export async function GET() {
  try {
    const parties = await listFlowersParties();
    return NextResponse.json({ parties });
  } catch {
    return NextResponse.json(
      { message: "Base de donnees indisponible pour le moment." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SaveFlowersPartyInput;

    if (!payload || !Array.isArray(payload.players) || !Array.isArray(payload.rounds)) {
      return NextResponse.json({ message: "Payload de partie invalide." }, { status: 400 });
    }

    if (payload.players.length > FLOWERS_MAX_PLAYERS) {
      return NextResponse.json(
        {
          message: `Une partie Flowers ne peut pas depasser ${FLOWERS_MAX_PLAYERS} joueurs.`,
        },
        { status: 400 },
      );
    }

    const party = await saveFlowersParty(payload);

    return NextResponse.json({ party });
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
