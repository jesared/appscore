"use client";

import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { FlowersPartyStoragePanel } from "@/components/flowers/flowers-party-storage-panel";
import { FlowersRankingList } from "@/components/flowers/flowers-ranking-list";
import { FlowersScoreTable } from "@/components/flowers/flowers-score-table";
import { AddPlayerForm } from "@/components/players/add-player-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FLOWERS_MAX_PLAYERS,
  buildFlowersRanking,
  createEmptyFlowersScoreSheet,
} from "@/lib/flowers-score";
import { createEntityId } from "@/lib/score/ids";
import type {
  FlowersPartySnapshot,
  FlowersPartySummary,
} from "@/types/flowers-party";
import type {
  FlowersRound,
  FlowersScoreFieldId,
  FlowersScoreSheetsByPlayer,
} from "@/types/flowers-score";
import type { Player } from "@/types/player";

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

function createInitialRounds() {
  return [createRound(1)];
}

type FlowersPartiesResponse = {
  parties: FlowersPartySummary[];
};

type FlowersPartyResponse = {
  party: FlowersPartySnapshot;
};

async function getApiErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as { message?: string };

    if (payload.message) {
      return payload.message;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export default function HomePage() {
  const [partyId, setPartyId] = useState<string | undefined>();
  const [partyName, setPartyName] = useState("Partie Flowers");
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<FlowersRound[]>(() =>
    createInitialRounds(),
  );
  const [scoreSheets, setScoreSheets] = useState<FlowersScoreSheetsByPlayer>(
    {},
  );
  const [savedParties, setSavedParties] = useState<FlowersPartySummary[]>([]);
  const [isLoadingParty, setIsLoadingParty] = useState(false);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [isMutatingParty, setIsMutatingParty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>();

  async function refreshSavedParties() {
    const response = await fetch("/api/flowers-parties", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          "Impossible de charger les parties sauvegardees.",
        ),
      );
    }

    const payload = (await response.json()) as FlowersPartiesResponse;
    setSavedParties(payload.parties);
  }

  function applyPartySnapshot(party: FlowersPartySnapshot) {
    setPartyId(party.id);
    setPartyName(party.name);
    setPlayers(party.players);
    setRounds(party.rounds);
    setScoreSheets(party.scoreSheets);
  }

  function resetParty() {
    setPartyId(undefined);
    setPartyName("Partie Flowers");
    setPlayers([]);
    setRounds(createInitialRounds());
    setScoreSheets({});
    setStatusMessage("Nouvelle partie prete.");
  }

  useEffect(() => {
    void (async () => {
      try {
        await refreshSavedParties();
      } catch (error) {
        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Chargement initial impossible.",
        );
      }
    })();
  }, []);

  async function handleLoadParty(nextPartyId: string) {
    setIsLoadingParty(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(`/api/flowers-parties/${nextPartyId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Impossible de charger cette partie."),
        );
      }

      const payload = (await response.json()) as FlowersPartyResponse;
      applyPartySnapshot(payload.party);
      setStatusMessage(`Partie "${payload.party.name}" chargee.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Chargement impossible.",
      );
    } finally {
      setIsLoadingParty(false);
    }
  }

  async function handleSaveParty() {
    setIsSavingParty(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch("/api/flowers-parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: partyId,
          name: partyName,
          players,
          rounds,
          scoreSheets,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "La sauvegarde a echoue."),
        );
      }

      const payload = (await response.json()) as FlowersPartyResponse;
      applyPartySnapshot(payload.party);
      await refreshSavedParties();
      setStatusMessage(`Partie "${payload.party.name}" sauvegardee.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Sauvegarde impossible.",
      );
    } finally {
      setIsSavingParty(false);
    }
  }

  async function handleTogglePartyActive(targetPartyId: string, isActive: boolean) {
    setIsMutatingParty(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(`/api/flowers-parties/${targetPartyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Impossible de mettre a jour le statut de la partie.",
          ),
        );
      }

      await refreshSavedParties();

      const targetParty = savedParties.find((party) => party.id === targetPartyId);
      const actionLabel = isActive ? "reactivee" : "desactivee";
      setStatusMessage(
        `Partie "${targetParty?.name ?? "Flowers"}" ${actionLabel}.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Mise a jour de la partie impossible.",
      );
    } finally {
      setIsMutatingParty(false);
    }
  }

  async function handleRenameParty(targetPartyId: string, nextName: string) {
    const normalizedName = nextName.trim();

    if (!normalizedName) {
      setStatusMessage("Le nom de la partie ne peut pas etre vide.");
      return;
    }

    setIsMutatingParty(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(`/api/flowers-parties/${targetPartyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: normalizedName }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Impossible de renommer la partie.",
          ),
        );
      }

      if (partyId === targetPartyId) {
        setPartyName(normalizedName);
      }

      await refreshSavedParties();
      setStatusMessage(`Partie renommee en "${normalizedName}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Renommage impossible.",
      );
    } finally {
      setIsMutatingParty(false);
    }
  }

  async function handleDeleteParty(targetPartyId: string) {
    setIsMutatingParty(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(`/api/flowers-parties/${targetPartyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Impossible de supprimer la partie.",
          ),
        );
      }

      const deletedParty = savedParties.find((party) => party.id === targetPartyId);

      if (partyId === targetPartyId) {
        resetParty();
      }

      await refreshSavedParties();
      setStatusMessage(
        `Partie "${deletedParty?.name ?? "Flowers"}" supprimee.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Suppression impossible.",
      );
    } finally {
      setIsMutatingParty(false);
    }
  }

  function handleAddPlayer(name: string) {
    if (players.length >= FLOWERS_MAX_PLAYERS) {
      setStatusMessage(
        `Une partie Flowers est limitee a ${FLOWERS_MAX_PLAYERS} joueurs.`,
      );
      return;
    }

    const playerId = createEntityId("player");
    const playerScoreSheets = rounds.reduce<FlowersScoreSheetsByPlayer[string]>(
      (scores, round) => {
        scores[round.id] = createEmptyFlowersScoreSheet();
        return scores;
      },
      {},
    );

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

    setStatusMessage(undefined);
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
    setPlayers((currentPlayers) =>
      currentPlayers.filter((player) => player.id !== playerId),
    );

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

      for (const [playerId, playerRounds] of Object.entries(
        currentScoreSheets,
      )) {
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

      return renameRounds(
        currentRounds.filter((round) => round.id !== roundId),
      );
    });

    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets: FlowersScoreSheetsByPlayer = {};

      for (const [playerId, playerRounds] of Object.entries(
        currentScoreSheets,
      )) {
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
          ...(currentScoreSheets[playerId]?.[roundId] ??
            createEmptyFlowersScoreSheet()),
          [fieldId]: value,
        },
      },
    }));
  }

  const rankingPlayers = buildFlowersRanking(players, rounds, scoreSheets);
  const leader = rankingPlayers[0];
  const isPlayerLimitReached = players.length >= FLOWERS_MAX_PLAYERS;

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
                  <CardTitle className="font-display text-4xl md:text-5xl">
                    Flowers
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-base">
                    Une feuille de marque multi-manches, simple a remplir, avec
                    total cumule, classement final et sauvegarde en base
                    Postgres.
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
                Chaque manche calcule un total. Le classement final additionne
                toutes les manches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground">
              <p>Score couleurs = Bleu + Jaune + Rouge + Vert</p>
              <p>Total manche = Score couleurs + Bonus papillon - Malus</p>
              <p>Total cumule = Somme de toutes les manches</p>
              <div className="rounded-2xl bg-accent p-4">
                <p className="text-xs uppercase tracking-wide text-accent-foreground">
                  Leader actuel
                </p>
                <p className="mt-2 text-2xl font-semibold text-accent-foreground">
                  {leader
                    ? `${leader.name || "Sans nom"} (${leader.cumulativeTotal})`
                    : "Aucun"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <FlowersPartyStoragePanel
          activePartyId={partyId}
          isLoadingParty={isLoadingParty}
          isSavingParty={isSavingParty}
          isMutatingParty={isMutatingParty}
          partyName={partyName}
          savedParties={savedParties}
          statusMessage={statusMessage}
          onChangePartyName={setPartyName}
          onCreateParty={resetParty}
          onDeleteParty={handleDeleteParty}
          onLoadParty={handleLoadParty}
          onRenameParty={handleRenameParty}
          onSaveParty={handleSaveParty}
          onTogglePartyActive={handleTogglePartyActive}
        />

        <AddPlayerForm
          description={
            isPlayerLimitReached
              ? `Limite atteinte: Flowers se joue jusqu'a ${FLOWERS_MAX_PLAYERS} joueurs.`
              : `Ajoute jusqu'a ${FLOWERS_MAX_PLAYERS} joueurs pour cette partie Flowers.`
          }
          isDisabled={isPlayerLimitReached}
          onAddPlayer={handleAddPlayer}
          placeholder="Nom du joueur"
        />

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
