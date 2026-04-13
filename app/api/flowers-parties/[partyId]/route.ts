import { NextResponse } from "next/server";

import {
  deleteFlowersParty,
  getFlowersPartyById,
  renameFlowersParty,
  setFlowersPartyActive,
} from "@/lib/flowers-parties";

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    const payload = (await request.json()) as { isActive?: boolean; name?: string };

    if (typeof payload?.name === "string") {
      const party = await renameFlowersParty(partyId, payload.name);

      if (!party) {
        return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
      }

      return NextResponse.json({ party });
    }

    if (typeof payload?.isActive !== "boolean") {
      return NextResponse.json(
        { message: "Mise a jour de partie invalide." },
        { status: 400 },
      );
    }

    const party = await setFlowersPartyActive(partyId, payload.isActive);

    if (!party) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    return NextResponse.json({ party });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Mise a jour de la partie impossible." },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    const wasDeleted = await deleteFlowersParty(partyId);

    if (!wasDeleted) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Suppression de la partie impossible." },
      { status: 503 },
    );
  }
}
