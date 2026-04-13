import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createEmptyFlowersScoreSheet } from "@/lib/flowers-score";
import type {
  FlowersPartySnapshot,
  FlowersPartySummary,
  SaveFlowersPartyInput,
} from "@/types/flowers-party";
import type { FlowersScoreSheetsByPlayer } from "@/types/flowers-score";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$extends" | "$on" | "$transaction" | "$use"
>;

function toPartySummary(party: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  players: unknown[];
  rounds: unknown[];
}): FlowersPartySummary {
  return {
    id: party.id,
    name: party.name,
    createdAt: party.createdAt.toISOString(),
    updatedAt: party.updatedAt.toISOString(),
    playerCount: party.players.length,
    roundCount: party.rounds.length,
  };
}

function toPartySnapshot(party: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  players: Array<{ clientId: string; name: string; position: number; id: string }>;
  rounds: Array<{ clientId: string; name: string; position: number; id: string }>;
  scores: Array<{
    playerId: string;
    roundId: string;
    blueScore: number;
    yellowScore: number;
    redScore: number;
    greenScore: number;
    butterflyScore: number;
    invalidCards: number;
  }>;
}): FlowersPartySnapshot {
  const players = [...party.players]
    .sort((left, right) => left.position - right.position)
    .map((player) => ({
      id: player.clientId,
      name: player.name,
    }));

  const rounds = [...party.rounds]
    .sort((left, right) => left.position - right.position)
    .map((round) => ({
      id: round.clientId,
      name: round.name,
    }));

  const scoreSheets: FlowersScoreSheetsByPlayer = Object.fromEntries(
    players.map((player) => [player.id, Object.fromEntries(rounds.map((round) => [round.id, createEmptyFlowersScoreSheet()]))]),
  );

  const playerClientIds = new Map(party.players.map((player) => [player.id, player.clientId]));
  const roundClientIds = new Map(party.rounds.map((round) => [round.id, round.clientId]));

  for (const score of party.scores) {
    const playerClientId = playerClientIds.get(score.playerId);
    const roundClientId = roundClientIds.get(score.roundId);

    if (!playerClientId || !roundClientId) {
      continue;
    }

    scoreSheets[playerClientId][roundClientId] = {
      blueScore: score.blueScore,
      yellowScore: score.yellowScore,
      redScore: score.redScore,
      greenScore: score.greenScore,
      butterflyScore: score.butterflyScore,
      invalidCards: score.invalidCards,
    };
  }

  return {
    id: party.id,
    name: party.name,
    createdAt: party.createdAt.toISOString(),
    updatedAt: party.updatedAt.toISOString(),
    players,
    rounds,
    scoreSheets,
  };
}

export async function listFlowersParties(): Promise<FlowersPartySummary[]> {
  const parties = await prisma.flowersParty.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: 12,
    include: {
      players: true,
      rounds: true,
    },
  });

  return parties.map(toPartySummary);
}

export async function getFlowersPartyById(id: string): Promise<FlowersPartySnapshot | null> {
  const party = await prisma.flowersParty.findUnique({
    where: { id },
    include: {
      players: {
        orderBy: {
          position: "asc",
        },
      },
      rounds: {
        orderBy: {
          position: "asc",
        },
      },
      scores: true,
    },
  });

  if (!party) {
    return null;
  }

  return toPartySnapshot(party);
}

export async function saveFlowersParty(input: SaveFlowersPartyInput): Promise<FlowersPartySnapshot> {
  const normalizedName = input.name.trim() || "Partie Flowers";

  const party = await prisma.$transaction(async (tx: TransactionClient) => {
    const savedParty = input.id
      ? await tx.flowersParty.update({
          where: { id: input.id },
          data: { name: normalizedName },
        })
      : await tx.flowersParty.create({
          data: { name: normalizedName },
        });

    await tx.flowersPartyScore.deleteMany({
      where: { partyId: savedParty.id },
    });
    await tx.flowersPartyPlayer.deleteMany({
      where: { partyId: savedParty.id },
    });
    await tx.flowersPartyRound.deleteMany({
      where: { partyId: savedParty.id },
    });

    const players = await Promise.all(
      input.players.map((player, index) =>
        tx.flowersPartyPlayer.create({
          data: {
            partyId: savedParty.id,
            clientId: player.id,
            name: player.name.trim() || `Joueur ${index + 1}`,
            position: index,
          },
        }),
      ),
    );

    const rounds = await Promise.all(
      input.rounds.map((round, index) =>
        tx.flowersPartyRound.create({
          data: {
            partyId: savedParty.id,
            clientId: round.id,
            name: round.name.trim() || `Manche ${index + 1}`,
            position: index,
          },
        }),
      ),
    );

    const playerIdsByClientId = new Map(players.map((player) => [player.clientId, player.id]));
    const roundIdsByClientId = new Map(rounds.map((round) => [round.clientId, round.id]));

    const scores = input.players.flatMap((player) =>
      input.rounds.map((round) => {
        const roundScore = input.scoreSheets[player.id]?.[round.id] ?? createEmptyFlowersScoreSheet();

        return {
          partyId: savedParty.id,
          playerId: playerIdsByClientId.get(player.id)!,
          roundId: roundIdsByClientId.get(round.id)!,
          blueScore: roundScore.blueScore,
          yellowScore: roundScore.yellowScore,
          redScore: roundScore.redScore,
          greenScore: roundScore.greenScore,
          butterflyScore: roundScore.butterflyScore,
          invalidCards: roundScore.invalidCards,
        };
      }),
    );

    if (scores.length > 0) {
      await tx.flowersPartyScore.createMany({
        data: scores,
      });
    }

    return tx.flowersParty.findUniqueOrThrow({
      where: { id: savedParty.id },
      include: {
        players: {
          orderBy: {
            position: "asc",
          },
        },
        rounds: {
          orderBy: {
            position: "asc",
          },
        },
        scores: true,
      },
    });
  });

  return toPartySnapshot(party);
}
