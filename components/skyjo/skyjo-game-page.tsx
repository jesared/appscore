"use client";

import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { FlowersPartyStoragePanel } from "@/components/flowers/flowers-party-storage-panel";
import { AddPlayerForm } from "@/components/players/add-player-form";
import { SkyjoFinishedSummary } from "@/components/skyjo/skyjo-finished-summary";
import { SkyjoRankingList } from "@/components/skyjo/skyjo-ranking-list";
import { SkyjoScoreTable } from "@/components/skyjo/skyjo-score-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToastStack, type AppToast } from "@/components/ui/toast-stack";
import { getRequiredGame } from "@/lib/games/registry";
import {
  SKYJO_MAX_PLAYERS,
  buildSkyjoRanking,
  createEmptySkyjoScoreSheet,
} from "@/lib/skyjo-score";
import { createEntityId } from "@/lib/score/ids";
import type {
  SkyjoPartySnapshot,
  SkyjoPartySummary,
} from "@/types/skyjo-party";
import type {
  SkyjoRound,
  SkyjoScoreSheetsByPlayer,
} from "@/types/skyjo-score";
import type { Player } from "@/types/player";

function createRound(roundNumber: number): SkyjoRound {
  return {
    id: createEntityId("round"),
    name: `Manche ${roundNumber}`,
    note: "",
  };
}

function renameRounds(rounds: SkyjoRound[]): SkyjoRound[] {
  return rounds.map((round, index) => ({
    ...round,
    name: `Manche ${index + 1}`,
  }));
}

function createInitialRounds() {
  return [createRound(1)];
}

type SkyjoPartiesResponse = {
  parties: SkyjoPartySummary[];
};

type SkyjoPartyResponse = {
  party: SkyjoPartySnapshot;
};

type SaveMode = "auto" | "manual";
type SaveStatus = "dirty" | "error" | "idle" | "saved" | "saving";

const skyjoGame = getRequiredGame("skyjo");
const skyjoApiBasePath = skyjoGame.apiBasePath;
const skyjoMaxPlayers = skyjoGame.maxPlayers ?? SKYJO_MAX_PLAYERS;
const skyjoDefaultPartyName = `${skyjoGame.sessionLabel[0].toUpperCase()}${skyjoGame.sessionLabel.slice(1)} ${skyjoGame.name}`;
const skyjoSessionLabel = `${skyjoGame.sessionLabel[0].toUpperCase()}${skyjoGame.sessionLabel.slice(1)}`;

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
  finishedAt?: string;
  isFinished: boolean;
  name: string;
  players: Player[];
  rounds: SkyjoRound[];
  scoreSheets: SkyjoScoreSheetsByPlayer;
}) {
  return JSON.stringify({
    id: input.id,
    finishedAt: input.finishedAt,
    isFinished: input.isFinished,
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

export function SkyjoGamePage() {
  const [partyId, setPartyId] = useState<string | undefined>();
  const [partyName, setPartyName] = useState(skyjoDefaultPartyName);
  const [isPartyFinished, setIsPartyFinished] = useState(false);
  const [finishedAt, setFinishedAt] = useState<string>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<SkyjoRound[]>(() => createInitialRounds());
  const [scoreSheets, setScoreSheets] = useState<SkyjoScoreSheetsByPlayer>({});
  const [savedParties, setSavedParties] = useState<SkyjoPartySummary[]>([]);
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
    const response = await fetch(skyjoApiBasePath, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          `Impossible de charger les ${skyjoGame.sessionLabelPlural} sauvegardees.`,
        ),
      );
    }

    const payload = (await response.json()) as SkyjoPartiesResponse;
    setSavedParties(payload.parties);
  }

  function applyPartySnapshot(party: SkyjoPartySnapshot) {
    setPartyId(party.id);
    setPartyName(party.name);
    setIsPartyFinished(party.isFinished);
    setFinishedAt(party.finishedAt);
    setPlayers(party.players);
    setRounds(party.rounds);
    setScoreSheets(party.scoreSheets);
    lastSavedSnapshotRef.current = serializePartyDraft({
      id: party.id,
      finishedAt: party.finishedAt,
      isFinished: party.isFinished,
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
    setPartyName(skyjoDefaultPartyName);
    setIsPartyFinished(false);
    setFinishedAt(undefined);
    setPlayers([]);
    setRounds(nextRounds);
    setScoreSheets({});
    setLastSavedAt(undefined);
    setSaveStatus("idle");
    setActiveSaveMode(null);
    lastSavedSnapshotRef.current = serializePartyDraft({
      name: skyjoDefaultPartyName,
      isFinished: false,
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
    finishedAt,
    isFinished: isPartyFinished,
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
      const response = await fetch(skyjoApiBasePath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: partyId,
          finishedAt,
          isFinished: isPartyFinished,
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

      const payload = (await response.json()) as SkyjoPartyResponse;
      applyPartySnapshot(payload.party);
      await refreshSavedParties();

      if (saveMode === "manual") {
        pushToast(
          `${skyjoSessionLabel} "${payload.party.name}" sauvegardee.`,
          "success",
        );
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
      const targetParty = savedParties.find((party) => party.id === nextPartyId);

      if (targetParty && !targetParty.isActive) {
        const restoreResponse = await fetch(`${skyjoApiBasePath}/${nextPartyId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: true }),
        });

        if (!restoreResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              restoreResponse,
              "Impossible de restaurer cette partie avant ouverture.",
            ),
          );
        }
      }

      const response = await fetch(`${skyjoApiBasePath}/${nextPartyId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Impossible de charger cette partie."),
        );
      }

      const payload = (await response.json()) as SkyjoPartyResponse;
      applyPartySnapshot(payload.party);
      await refreshSavedParties();
      pushToast(
        targetParty && !targetParty.isActive
          ? `${skyjoSessionLabel} "${payload.party.name}" restauree et chargee.`
          : `${skyjoSessionLabel} "${payload.party.name}" chargee.`,
        "info",
      );
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
      const targetParty = savedParties.find((party) => party.id === targetPartyId);
      const response = await fetch(`${skyjoApiBasePath}/${targetPartyId}`, {
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

      if (!isActive && partyId === targetPartyId) {
        resetParty(false);
      }

      await refreshSavedParties();

      pushToast(
        isActive
          ? `${skyjoGame.name} "${targetParty?.name ?? skyjoGame.name}" restauree.`
          : partyId === targetPartyId
            ? `${skyjoGame.name} "${targetParty?.name ?? skyjoGame.name}" archivee et fermee.`
            : `${skyjoGame.name} "${targetParty?.name ?? skyjoGame.name}" archivee.`,
        "success",
      );
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
      const response = await fetch(`${skyjoApiBasePath}/${targetPartyId}`, {
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
        party: SkyjoPartySummary;
      };

      if (partyId === targetPartyId) {
        setPartyName(normalizedName);
        setLastSavedAt(payload.party.updatedAt);
        setSaveStatus("saved");
        lastSavedSnapshotRef.current = serializePartyDraft({
          id: targetPartyId,
          finishedAt,
          isFinished: isPartyFinished,
          name: normalizedName,
          players,
          rounds,
          scoreSheets,
        });
      }

      await refreshSavedParties();
      pushToast(
        `${skyjoSessionLabel} renommee en "${normalizedName}".`,
        "success",
      );
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
      const response = await fetch(`${skyjoApiBasePath}/${targetPartyId}`, {
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
      pushToast(
        `${skyjoGame.name} "${deletedParty?.name ?? skyjoGame.name}" supprimee.`,
        "success",
      );
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
    if (isPartyFinished) {
      pushToast("La partie est terminee. Reouvre-la pour ajouter un joueur.", "error");
      return;
    }

    if (players.length >= skyjoMaxPlayers) {
      pushToast(
        `Une partie ${skyjoGame.name} est limitee a ${skyjoMaxPlayers} joueurs.`,
        "error",
      );
      return;
    }

    const playerId = createEntityId("player");
    const playerScoreSheets = rounds.reduce<SkyjoScoreSheetsByPlayer[string]>(
      (scores, round) => {
        scores[round.id] = createEmptySkyjoScoreSheet();
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
    if (isPartyFinished) {
      return;
    }

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === playerId
          ? {
              ...player,
              name,
            }
          : player,
      ),
    );
  }

  function handleRemovePlayer(playerId: string) {
    if (isPartyFinished) {
      return;
    }

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
    if (isPartyFinished) {
      pushToast("La partie est terminee. Reouvre-la pour ajouter une manche.", "error");
      return;
    }

    const nextRound = createRound(rounds.length + 1);

    setRounds((currentRounds) => renameRounds([...currentRounds, nextRound]));
    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets: SkyjoScoreSheetsByPlayer = {};

      for (const [playerId, playerRounds] of Object.entries(currentScoreSheets)) {
        nextScoreSheets[playerId] = {
          ...playerRounds,
          [nextRound.id]: createEmptySkyjoScoreSheet(),
        };
      }

      return nextScoreSheets;
    });
  }

  function handleRemoveRound(roundId: string) {
    if (isPartyFinished) {
      return;
    }

    setRounds((currentRounds) => {
      if (currentRounds.length === 1) {
        return currentRounds;
      }

      return renameRounds(
        currentRounds.filter((round) => round.id !== roundId),
      );
    });

    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets: SkyjoScoreSheetsByPlayer = {};

      for (const [playerId, playerRounds] of Object.entries(currentScoreSheets)) {
        const nextRounds = { ...playerRounds };
        delete nextRounds[roundId];
        nextScoreSheets[playerId] = nextRounds;
      }

      return nextScoreSheets;
    });
  }

  function handleChangeScore(playerId: string, roundId: string, value: number) {
    if (isPartyFinished) {
      return;
    }

    setScoreSheets((currentScoreSheets) => ({
      ...currentScoreSheets,
      [playerId]: {
        ...(currentScoreSheets[playerId] ?? {}),
        [roundId]: {
          points: value,
        },
      },
    }));
  }

  function handleChangeRoundName(roundId: string, name: string) {
    if (isPartyFinished) {
      return;
    }

    setRounds((currentRounds) =>
      currentRounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              name,
            }
          : round,
      ),
    );
  }

  function handleChangeRoundNote(roundId: string, note: string) {
    if (isPartyFinished) {
      return;
    }

    setRounds((currentRounds) =>
      currentRounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              note,
            }
          : round,
      ),
    );
  }

  function handleFinishParty() {
    if (players.length === 0) {
      pushToast("Ajoute au moins un joueur avant de terminer la partie.", "error");
      return;
    }

    setIsPartyFinished(true);
    setFinishedAt(new Date().toISOString());
    pushToast("Partie terminee. La feuille est maintenant verrouillee.", "success");
  }

  function handleReopenParty() {
    setIsPartyFinished(false);
    setFinishedAt(undefined);
    pushToast("Partie reouverte. La feuille est de nouveau modifiable.", "info");
  }

  const rankingPlayers = buildSkyjoRanking(players, rounds, scoreSheets);
  const leader = rankingPlayers[0];
  const isPlayerLimitReached = players.length >= skyjoMaxPlayers;
  const canFinishParty = players.length > 0 && !isPartyFinished;
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
                    {skyjoGame.name}
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-base">
                    Une feuille de score multi-manches simple, avec total
                    cumule, classement ascendant et sauvegarde en base.
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
                Chaque manche ajoute des points. A Skyjo, le meilleur score est
                le plus faible total final.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground">
              <p>Score de manche = points saisis pour le joueur</p>
              <p>Total cumule = somme de toutes les manches</p>
              <p>Classement final = plus petit total en tete</p>
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

        {isPartyFinished ? (
          <SkyjoFinishedSummary
            finishedAt={finishedAt}
            rankingPlayers={rankingPlayers}
            rounds={rounds}
            onReopenParty={handleReopenParty}
          />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Cloturer la partie</CardTitle>
                <CardDescription>
                  Quand tous les points sont saisis, termine la partie pour
                  figer la feuille et afficher un resume final propre.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  La cloture verrouille les joueurs, les manches et les scores.
                </p>
                <Button onClick={handleFinishParty} disabled={!canFinishParty}>
                  Terminer la partie
                </Button>
              </CardContent>
            </Card>

            <AddPlayerForm
              description={
                isPlayerLimitReached
                  ? `Limite atteinte: ${skyjoGame.name} se joue jusqu'a ${skyjoMaxPlayers} joueurs.`
                  : `Ajoute jusqu'a ${skyjoMaxPlayers} joueurs pour cette ${skyjoGame.sessionLabel} ${skyjoGame.name}.`
              }
              isDisabled={isPlayerLimitReached || isPartyFinished}
              onAddPlayer={handleAddPlayer}
              placeholder="Nom du joueur"
            />
          </>
        )}

        <SkyjoScoreTable
          isLocked={isPartyFinished}
          players={players}
          rounds={rounds}
          scoreSheets={scoreSheets}
          rankingPlayers={rankingPlayers}
          onAddRound={handleAddRound}
          onChangePlayerName={handleChangePlayerName}
          onChangeRoundName={handleChangeRoundName}
          onChangeRoundNote={handleChangeRoundNote}
          onChangeScore={handleChangeScore}
          onRemovePlayer={handleRemovePlayer}
          onRemoveRound={handleRemoveRound}
        />

        <SkyjoRankingList rankingPlayers={rankingPlayers} />
      </div>
      <ToastStack onDismiss={dismissToast} toasts={toasts} />
    </main>
  );
}
