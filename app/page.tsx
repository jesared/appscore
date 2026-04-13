"use client";

import { useEffect, useRef, useState } from "react";

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
import { ToastStack, type AppToast } from "@/components/ui/toast-stack";
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

type SaveMode = "auto" | "manual";
type SaveStatus = "dirty" | "error" | "idle" | "saved" | "saving";

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

function serializePartyDraft(input: {
  id?: string;
  name: string;
  players: Player[];
  rounds: FlowersRound[];
  scoreSheets: FlowersScoreSheetsByPlayer;
}) {
  return JSON.stringify({
    id: input.id,
    name: input.name.trim(),
    players: input.players,
    rounds: input.rounds,
    scoreSheets: input.scoreSheets,
  });
}

function formatSaveTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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
  const [activeSaveMode, setActiveSaveMode] = useState<SaveMode | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const persistPartyRef = useRef<(saveMode: SaveMode) => Promise<void>>(async () => {});

  function pushToast(message: string, variant: AppToast["variant"] = "info") {
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: createEntityId("toast"),
        message,
        variant,
      },
    ]);
  }

  function dismissToast(toastId: string) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  }

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
    lastSavedSnapshotRef.current = serializePartyDraft({
      id: party.id,
      name: party.name,
      players: party.players,
      rounds: party.rounds,
      scoreSheets: party.scoreSheets,
    });
    setLastSavedAt(party.updatedAt);
    setSaveStatus("saved");
  }

  function resetParty(showToast = true) {
    const nextRounds = createInitialRounds();

    setPartyId(undefined);
    setPartyName("Partie Flowers");
    setPlayers([]);
    setRounds(nextRounds);
    setScoreSheets({});
    setLastSavedAt(undefined);
    setSaveStatus("idle");
    setActiveSaveMode(null);
    lastSavedSnapshotRef.current = serializePartyDraft({
      name: "Partie Flowers",
      players: [],
      rounds: nextRounds,
      scoreSheets: {},
    });

    if (showToast) {
      pushToast("Nouvelle partie prete.", "info");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        await refreshSavedParties();
      } catch (error) {
        pushToast(
          error instanceof Error ? error.message : "Chargement initial impossible.",
          "error",
        );
      }
    })();
  }, []);

  const currentSnapshot = serializePartyDraft({
    id: partyId,
    name: partyName,
    players,
    rounds,
    scoreSheets,
  });

  persistPartyRef.current = async (saveMode: SaveMode) => {
    if (isLoadingParty || isMutatingParty || isSavingParty) {
      return;
    }

    if (saveMode === "auto" && currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setIsSavingParty(true);
    setActiveSaveMode(saveMode);
    setSaveStatus("saving");

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

      if (saveMode === "manual") {
        pushToast(`Partie "${payload.party.name}" sauvegardee.`, "success");
      }
    } catch (error) {
      setSaveStatus("error");
      pushToast(
        error instanceof Error
          ? saveMode === "auto"
            ? `Autosauvegarde impossible: ${error.message}`
            : error.message
          : saveMode === "auto"
            ? "Autosauvegarde impossible."
            : "Sauvegarde impossible.",
        "error",
      );
    } finally {
      setIsSavingParty(false);
      setActiveSaveMode(null);
    }
  };

  useEffect(() => {
    if (lastSavedSnapshotRef.current === null) {
      lastSavedSnapshotRef.current = currentSnapshot;
      return;
    }

    if (isLoadingParty || isMutatingParty || isSavingParty) {
      return;
    }

    const hasSomethingToSave = Boolean(partyId) || players.length > 0;

    if (!hasSomethingToSave) {
      setSaveStatus("idle");
      return;
    }

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setSaveStatus("dirty");

    const timeout = window.setTimeout(() => {
      void persistPartyRef.current("auto");
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [
    currentSnapshot,
    isLoadingParty,
    isMutatingParty,
    isSavingParty,
    partyId,
    players.length,
  ]);

  async function handleLoadParty(nextPartyId: string) {
    setIsLoadingParty(true);

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
      pushToast(`Partie "${payload.party.name}" chargee.`, "info");
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Chargement impossible.",
        "error",
      );
    } finally {
      setIsLoadingParty(false);
    }
  }

  async function handleSaveParty() {
    await persistPartyRef.current("manual");
  }

  async function handleTogglePartyActive(targetPartyId: string, isActive: boolean) {
    setIsMutatingParty(true);

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
      pushToast(`Partie "${targetParty?.name ?? "Flowers"}" ${actionLabel}.`, "success");
    } catch (error) {
      pushToast(
        error instanceof Error
          ? error.message
          : "Mise a jour de la partie impossible.",
        "error",
      );
    } finally {
      setIsMutatingParty(false);
    }
  }

  async function handleRenameParty(targetPartyId: string, nextName: string) {
    const normalizedName = nextName.trim();

    if (!normalizedName) {
      pushToast("Le nom de la partie ne peut pas etre vide.", "error");
      return;
    }

    setIsMutatingParty(true);

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

      const payload = (await response.json()) as {
        party: FlowersPartySummary;
      };

      if (partyId === targetPartyId) {
        setPartyName(normalizedName);
        setLastSavedAt(payload.party.updatedAt);
        setSaveStatus("saved");
        lastSavedSnapshotRef.current = serializePartyDraft({
          id: targetPartyId,
          name: normalizedName,
          players,
          rounds,
          scoreSheets,
        });
      }

      await refreshSavedParties();
      pushToast(`Partie renommee en "${normalizedName}".`, "success");
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Renommage impossible.",
        "error",
      );
    } finally {
      setIsMutatingParty(false);
    }
  }

  async function handleDeleteParty(targetPartyId: string) {
    setIsMutatingParty(true);

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
        resetParty(false);
      }

      await refreshSavedParties();
      pushToast(`Partie "${deletedParty?.name ?? "Flowers"}" supprimee.`, "success");
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Suppression impossible.",
        "error",
      );
    } finally {
      setIsMutatingParty(false);
    }
  }

  function handleAddPlayer(name: string) {
    if (players.length >= FLOWERS_MAX_PLAYERS) {
      pushToast(
        `Une partie Flowers est limitee a ${FLOWERS_MAX_PLAYERS} joueurs.`,
        "error",
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
  const statusMessage =
    saveStatus === "saving"
      ? activeSaveMode === "auto"
        ? "Autosauvegarde en cours..."
        : "Sauvegarde en cours..."
      : saveStatus === "dirty"
        ? "Modifications detectees. Autosauvegarde imminente."
        : saveStatus === "saved" && lastSavedAt
          ? `Derniere sauvegarde a ${formatSaveTime(lastSavedAt)}.`
          : saveStatus === "error"
            ? "La derniere sauvegarde a rencontre un probleme."
            : undefined;

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
      <ToastStack onDismiss={dismissToast} toasts={toasts} />
    </main>
  );
}
