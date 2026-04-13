import { NextResponse } from "next/server";

import { getFlowersPartyById } from "@/lib/flowers-parties";

type RouteContext = {
  params: Promise<{
    partyId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    const party = await getFlowersPartyById(partyId);

    if (!party) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    return NextResponse.json({ party });
  } catch {
    return NextResponse.json(
      { message: "Chargement de la partie impossible." },
      { status: 503 },
    );
  }
}
