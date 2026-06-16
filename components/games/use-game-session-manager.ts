"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createEntityId } from "@/lib/score/ids";
import type { AppToast } from "@/components/ui/toast-stack";
import type { Player } from "@/types/player";

type RoundBase = {
  id: string;
  name: string;
  note?: string;
};

type ScoreSheetsByPlayer<TScoreSheet> = Record<string, Record<string, TScoreSheet>>;

type StoredSessionSummary = {
  id: string;
  name: string;
  isActive: boolean;
  isFinished: boolean;
  updatedAt: string;
  playerCount: number;
  roundCount: number;
};

type StoredSessionSnapshot<TRound extends RoundBase, TScoreSheet> = {
  id: string;
  name: string;
  isFinished: boolean;
  finishedAt?: string;
  updatedAt: string;
  players: Player[];
  rounds: TRound[];
  scoreSheets: ScoreSheetsByPlayer<TScoreSheet>;
};

type SessionResponse<TRound extends RoundBase, TScoreSheet, TSummary> = {
  party: StoredSessionSnapshot<TRound, TScoreSheet> | TSummary;
};

type SessionsResponse<TSummary> = {
  parties: TSummary[];
};

type SaveMode = "auto" | "manual";
type SaveStatus = "dirty" | "error" | "idle" | "saved" | "saving";

type UseGameSessionManagerOptions<TRound extends RoundBase, TScoreSheet> = {
  apiBasePath: string;
  defaultSessionName: string;
  gameName: string;
  maxPlayers: number;
  sessionLabel: string;
  sessionLabelPlural: string;
  createRound: (roundNumber: number) => TRound;
  createEmptyScoreSheet: () => TScoreSheet;
};

function capitalize(value: string) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function formatSaveTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

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

function renameRounds<TRound extends RoundBase>(rounds: TRound[]): TRound[] {
  return rounds.map((round, index) => ({
    ...round,
    name: `Manche ${index + 1}`,
  }));
}

function serializeSessionDraft<TRound extends RoundBase, TScoreSheet>(input: {
  id?: string;
  finishedAt?: string;
  isFinished: boolean;
  name: string;
  players: Player[];
  rounds: TRound[];
  scoreSheets: ScoreSheetsByPlayer<TScoreSheet>;
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

export function useGameSessionManager<
  TRound extends RoundBase,
  TScoreSheet,
  TSummary extends StoredSessionSummary,
>({
  apiBasePath,
  createEmptyScoreSheet,
  createRound,
  defaultSessionName,
  gameName,
  maxPlayers,
  sessionLabel,
  sessionLabelPlural,
}: UseGameSessionManagerOptions<TRound, TScoreSheet>) {
  const [partyId, setPartyId] = useState<string | undefined>();
  const [partyName, setPartyName] = useState(defaultSessionName);
  const [isPartyFinished, setIsPartyFinished] = useState(false);
  const [finishedAt, setFinishedAt] = useState<string>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<TRound[]>(() => [createRound(1)]);
  const [scoreSheets, setScoreSheets] = useState<ScoreSheetsByPlayer<TScoreSheet>>({});
  const [savedParties, setSavedParties] = useState<TSummary[]>([]);
  const [isLoadingParty, setIsLoadingParty] = useState(false);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [isMutatingParty, setIsMutatingParty] = useState(false);
  const [activeSaveMode, setActiveSaveMode] = useState<SaveMode | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const persistPartyRef = useRef<(saveMode: SaveMode) => Promise<void>>(async () => {});
  const capitalizedSessionLabel = capitalize(sessionLabel);

  const pushToast = useCallback((message: string, variant: AppToast["variant"] = "info") => {
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: createEntityId("toast"),
        message,
        variant,
      },
    ]);
  }, []);

  function dismissToast(toastId: string) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  }

  const refreshSavedParties = useCallback(async () => {
    const response = await fetch(apiBasePath, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          `Impossible de charger les ${sessionLabelPlural} sauvegardees.`,
        ),
      );
    }

    const payload = (await response.json()) as SessionsResponse<TSummary>;
    setSavedParties(payload.parties);
  }, [apiBasePath, sessionLabelPlural]);

  function applyPartySnapshot(party: StoredSessionSnapshot<TRound, TScoreSheet>) {
    setPartyId(party.id);
    setPartyName(party.name);
    setIsPartyFinished(party.isFinished);
    setFinishedAt(party.finishedAt);
    setPlayers(party.players);
    setRounds(party.rounds);
    setScoreSheets(party.scoreSheets);
    lastSavedSnapshotRef.current = serializeSessionDraft({
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
    const nextRounds = [createRound(1)];

    setPartyId(undefined);
    setPartyName(defaultSessionName);
    setIsPartyFinished(false);
    setFinishedAt(undefined);
    setPlayers([]);
    setRounds(nextRounds);
    setScoreSheets({});
    setLastSavedAt(undefined);
    setSaveStatus("idle");
    setActiveSaveMode(null);
    lastSavedSnapshotRef.current = serializeSessionDraft({
      name: defaultSessionName,
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
  }, [pushToast, refreshSavedParties]);

  const currentSnapshot = serializeSessionDraft({
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
      const response = await fetch(apiBasePath, {
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

      const payload = (await response.json()) as SessionResponse<TRound, TScoreSheet, TSummary>;
      applyPartySnapshot(payload.party as StoredSessionSnapshot<TRound, TScoreSheet>);
      await refreshSavedParties();

      if (saveMode === "manual") {
        pushToast(`${capitalizedSessionLabel} "${payload.party.name}" sauvegardee.`, "success");
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
        const restoreResponse = await fetch(`${apiBasePath}/${nextPartyId}`, {
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

      const response = await fetch(`${apiBasePath}/${nextPartyId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Impossible de charger cette partie."),
        );
      }

      const payload = (await response.json()) as SessionResponse<TRound, TScoreSheet, TSummary>;
      applyPartySnapshot(payload.party as StoredSessionSnapshot<TRound, TScoreSheet>);
      await refreshSavedParties();
      pushToast(
        targetParty && !targetParty.isActive
          ? `${capitalizedSessionLabel} "${payload.party.name}" restauree et chargee.`
          : `${capitalizedSessionLabel} "${payload.party.name}" chargee.`,
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
      const response = await fetch(`${apiBasePath}/${targetPartyId}`, {
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
          ? `${gameName} "${targetParty?.name ?? gameName}" restauree.`
          : partyId === targetPartyId
            ? `${gameName} "${targetParty?.name ?? gameName}" archivee et fermee.`
            : `${gameName} "${targetParty?.name ?? gameName}" archivee.`,
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
      const response = await fetch(`${apiBasePath}/${targetPartyId}`, {
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

      const payload = (await response.json()) as { party: TSummary };

      if (partyId === targetPartyId) {
        setPartyName(normalizedName);
        setLastSavedAt(payload.party.updatedAt);
        setSaveStatus("saved");
        lastSavedSnapshotRef.current = serializeSessionDraft({
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
      pushToast(`${capitalizedSessionLabel} renommee en "${normalizedName}".`, "success");
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
      const response = await fetch(`${apiBasePath}/${targetPartyId}`, {
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
        `${gameName} "${deletedParty?.name ?? gameName}" supprimee.`,
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

    if (players.length >= maxPlayers) {
      pushToast(
        `Une partie ${gameName} est limitee a ${maxPlayers} joueurs.`,
        "error",
      );
      return;
    }

    const playerId = createEntityId("player");
    const playerScoreSheets = rounds.reduce<Record<string, TScoreSheet>>(
      (scores, round) => {
        scores[round.id] = createEmptyScoreSheet();
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
      const nextScoreSheets: ScoreSheetsByPlayer<TScoreSheet> = {};

      for (const [playerId, playerRounds] of Object.entries(currentScoreSheets)) {
        nextScoreSheets[playerId] = {
          ...playerRounds,
          [nextRound.id]: createEmptyScoreSheet(),
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

      return renameRounds(currentRounds.filter((round) => round.id !== roundId));
    });

    setScoreSheets((currentScoreSheets) => {
      const nextScoreSheets: ScoreSheetsByPlayer<TScoreSheet> = {};

      for (const [playerId, playerRounds] of Object.entries(currentScoreSheets)) {
        const nextRounds = { ...playerRounds };
        delete nextRounds[roundId];
        nextScoreSheets[playerId] = nextRounds;
      }

      return nextScoreSheets;
    });
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

  return {
    finishedAt,
    handleAddPlayer,
    handleAddRound,
    handleChangePlayerName,
    handleChangeRoundName,
    handleChangeRoundNote,
    handleDeleteParty,
    handleFinishParty,
    handleLoadParty,
    handleRemovePlayer,
    handleRemoveRound,
    handleRenameParty,
    handleReopenParty,
    handleSaveParty,
    handleTogglePartyActive,
    isLoadingParty,
    isMutatingParty,
    isPartyFinished,
    isSavingParty,
    partyId,
    partyName,
    players,
    pushToast,
    resetParty,
    rounds,
    savedParties,
    scoreSheets,
    setPartyName,
    setScoreSheets,
    statusMessage,
    toasts,
    dismissToast,
  };
}
