"use client";

import { useState } from "react";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { FlowersRankingList } from "@/components/flowers/flowers-ranking-list";
import { FlowersScoreTable } from "@/components/flowers/flowers-score-table";
import { AddPlayerForm } from "@/components/players/add-player-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildFlowersRanking,
  createEmptyFlowersScoreSheet,
} from "@/lib/flowers-score";
import { createEntityId } from "@/lib/score/ids";
import type { Player } from "@/types/player";
import type {
  FlowersRound,
  FlowersScoreFieldId,
  FlowersScoreSheetsByPlayer,
} from "@/types/flowers-score";

function createRound(roundNumber: number): FlowersRound {
  return {
    id: createEntityId("round"),
    name: `Manche ${roundNumber}`,
  };
}

function renameRounds(rounds: FlowersRound[]): FlowersRound[] {
  return rounds.map((round, index) => ({
    ...round,
    name: `Manche ${index + 1}`,
  }));
}

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<FlowersRound[]>(() => [createRound(1)]);
  const [scoreSheets, setScoreSheets] = useState<FlowersScoreSheetsByPlayer>({});

  function handleAddPlayer(name: string) {
    const playerId = createEntityId("player");
    const playerScoreSheets = rounds.reduce<FlowersScoreSheetsByPlayer[string]>((scores, round) => {
      scores[round.id] = createEmptyFlowersScoreSheet();
      return scores;
    }, {});

    setPlayers((currentPlayers) => [
      ...currentPlayers,
      {
        id: playerId,
        name,
      },
    ]);

    setScoreSheets((currentScoreSheets) => ({
      ...currentScoreSheets,
      [playerId]: playerScoreSheets,
    }));
  }

  function handleChangePlayerName(playerId: string, name: string) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => {
        if (player.id !== playerId) {
          return player;
        }

        return {
          ...player,
          name,
        };
      }),
    );
  }

  function handleRemovePlayer(playerId: string) {
    setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== playerId));

    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets = { ...currentScoreSheets };
      delete nextScoreSheets[playerId];
      return nextScoreSheets;
    });
  }

  function handleAddRound() {
    const nextRound = createRound(rounds.length + 1);

    setRounds((currentRounds) => renameRounds([...currentRounds, nextRound]));
    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets: FlowersScoreSheetsByPlayer = {};

      for (const [playerId, playerRounds] of Object.entries(currentScoreSheets)) {
        nextScoreSheets[playerId] = {
          ...playerRounds,
          [nextRound.id]: createEmptyFlowersScoreSheet(),
        };
      }

      return nextScoreSheets;
    });
  }

  function handleRemoveRound(roundId: string) {
    setRounds((currentRounds) => {
      if (currentRounds.length === 1) {
        return currentRounds;
      }

      return renameRounds(currentRounds.filter((round) => round.id !== roundId));
    });

    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets: FlowersScoreSheetsByPlayer = {};

      for (const [playerId, playerRounds] of Object.entries(currentScoreSheets)) {
        const nextRounds = { ...playerRounds };
        delete nextRounds[roundId];
        nextScoreSheets[playerId] = nextRounds;
      }

      return nextScoreSheets;
    });
  }

  function handleChangeScore(
    playerId: string,
    roundId: string,
    fieldId: FlowersScoreFieldId,
    value: number,
  ) {
    setScoreSheets((currentScoreSheets) => ({
      ...currentScoreSheets,
      [playerId]: {
        ...(currentScoreSheets[playerId] ?? {}),
        [roundId]: {
          ...(currentScoreSheets[playerId]?.[roundId] ?? createEmptyFlowersScoreSheet()),
          [fieldId]: value,
        },
      },
    }));
  }

  const rankingPlayers = buildFlowersRanking(players, rounds, scoreSheets);
  const leader = rankingPlayers[0];

  return (
    <main className="container py-8 md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                    Feuille de marque numerique
                  </p>
                  <CardTitle className="font-display text-4xl md:text-5xl">Flowers</CardTitle>
                  <CardDescription className="max-w-2xl text-base">
                    Une feuille de marque multi-manches, simple a remplir, avec total cumule et
                    classement final en direct.
                  </CardDescription>
                </div>
                <ThemeToggle />
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vue d&apos;ensemble</CardTitle>
              <CardDescription>
                Chaque manche calcule un total. Le classement final additionne toutes les manches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground">
              <p>Score couleurs = Bleu + Jaune + Rouge + Vert</p>
              <p>Total manche = Score couleurs + Bonus papillon - Malus</p>
              <p>Total cumule = Somme de toutes les manches</p>
              <div className="rounded-2xl bg-secondary p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Leader actuel</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {leader ? `${leader.name || "Sans nom"} (${leader.cumulativeTotal})` : "Aucun"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <AddPlayerForm onAddPlayer={handleAddPlayer} placeholder="Nom du joueur" />

        <FlowersScoreTable
          players={players}
          rounds={rounds}
          scoreSheets={scoreSheets}
          rankingPlayers={rankingPlayers}
          onAddRound={handleAddRound}
          onChangePlayerName={handleChangePlayerName}
          onChangeScore={handleChangeScore}
          onRemovePlayer={handleRemovePlayer}
          onRemoveRound={handleRemoveRound}
        />

        <FlowersRankingList rankingPlayers={rankingPlayers} />
      </div>
    </main>
  );
}
