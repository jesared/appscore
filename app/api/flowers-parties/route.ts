import { NextResponse } from "next/server";

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

    const party = await saveFlowersParty(payload);

    return NextResponse.json({ party });
  } catch {
    return NextResponse.json(
      { message: "La sauvegarde en base a echoue." },
      { status: 503 },
    );
  }
}
