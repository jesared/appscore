"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { FlowersFinishedSummary } from "@/components/flowers/flowers-finished-summary";
import { FlowersPartyStoragePanel } from "@/components/flowers/flowers-party-storage-panel";
import { FlowersRankingList } from "@/components/flowers/flowers-ranking-list";
import { FlowersScoreTable } from "@/components/flowers/flowers-score-table";
import { useGameSessionManager } from "@/components/games/use-game-session-manager";
import { AddPlayerForm } from "@/components/players/add-player-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToastStack } from "@/components/ui/toast-stack";
import { getRequiredGame } from "@/lib/games/registry";
import {
  buildFlowersRanking,
  createEmptyFlowersScoreSheet,
} from "@/lib/flowers-score";
import { createEntityId } from "@/lib/score/ids";
import type { FlowersPartySummary } from "@/types/flowers-party";
import type {
  FlowersRound,
  FlowersScoreFieldId,
  FlowersScoreSheet,
  FlowersScoreSheetsByPlayer,
} from "@/types/flowers-score";

function createRound(roundNumber: number): FlowersRound {
  return {
    id: createEntityId("round"),
    name: `Manche ${roundNumber}`,
    note: "",
  };
}

const flowersGame = getRequiredGame("flowers");
const flowersMaxPlayers = flowersGame.maxPlayers ?? 4;
const flowersDefaultPartyName = `${flowersGame.sessionLabel[0].toUpperCase()}${flowersGame.sessionLabel.slice(1)} ${flowersGame.name}`;

export function FlowersGamePage() {
  const session = useGameSessionManager<
    FlowersRound,
    FlowersScoreSheet,
    FlowersPartySummary
  >({
    apiBasePath: flowersGame.apiBasePath,
    createEmptyScoreSheet: createEmptyFlowersScoreSheet,
    createRound,
    defaultSessionName: flowersDefaultPartyName,
    gameName: flowersGame.name,
    maxPlayers: flowersMaxPlayers,
    sessionLabel: flowersGame.sessionLabel,
    sessionLabelPlural: flowersGame.sessionLabelPlural,
  });

  function handleChangeScore(
    playerId: string,
    roundId: string,
    fieldId: FlowersScoreFieldId,
    value: number,
  ) {
    if (session.isPartyFinished) {
      return;
    }

    session.setScoreSheets((currentScoreSheets) => ({
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

  const scoreSheets = session.scoreSheets as FlowersScoreSheetsByPlayer;
  const rankingPlayers = buildFlowersRanking(
    session.players,
    session.rounds,
    scoreSheets,
  );
  const leader = rankingPlayers[0];
  const isPlayerLimitReached = session.players.length >= flowersMaxPlayers;
  const canFinishParty = session.players.length > 0 && !session.isPartyFinished;

  return (
    <main className="container py-3 sm:py-5 md:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase text-primary">
                  Feuille numerique
                </p>
                <CardTitle className="font-display text-2xl sm:text-3xl">
                  {flowersGame.name}
                </CardTitle>
                <CardDescription className="max-w-2xl">
                  Scores par manche, sauvegarde et classement en direct.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  href="/"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Jeux
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 border-t border-border/70 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Joueurs</p>
              <p className="text-lg font-semibold">{session.players.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Manches</p>
              <p className="text-lg font-semibold">{session.rounds.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Leader</p>
              <p className="truncate text-lg font-semibold">
                {leader
                  ? `${leader.name || "Sans nom"} (${leader.cumulativeTotal})`
                  : "Aucun"}
              </p>
            </div>
          </CardContent>
        </Card>

        {session.isPartyFinished ? (
          <FlowersFinishedSummary
            finishedAt={session.finishedAt}
            rankingPlayers={rankingPlayers}
            rounds={session.rounds}
            onReopenParty={session.handleReopenParty}
          />
        ) : (
          <AddPlayerForm
            description={
              isPlayerLimitReached
                ? `Limite atteinte: ${flowersGame.name} se joue jusqu'a ${flowersMaxPlayers} joueurs.`
                : `Ajoute jusqu'a ${flowersMaxPlayers} joueurs pour cette ${flowersGame.sessionLabel} ${flowersGame.name}.`
            }
            isDisabled={isPlayerLimitReached || session.isPartyFinished}
            onAddPlayer={session.handleAddPlayer}
            placeholder="Nom du joueur"
          />
        )}

        <FlowersScoreTable
          isLocked={session.isPartyFinished}
          players={session.players}
          rounds={session.rounds}
          scoreSheets={scoreSheets}
          rankingPlayers={rankingPlayers}
          onAddRound={session.handleAddRound}
          onChangePlayerName={session.handleChangePlayerName}
          onChangeRoundName={session.handleChangeRoundName}
          onChangeRoundNote={session.handleChangeRoundNote}
          onChangeScore={handleChangeScore}
          onRemovePlayer={session.handleRemovePlayer}
          onRemoveRound={session.handleRemoveRound}
        />

        {!session.isPartyFinished && session.players.length > 0 ? (
          <Card>
            <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
              <p className="text-sm text-muted-foreground">
                Termine la partie pour verrouiller la feuille et afficher le
                resume.
              </p>
              <Button
                onClick={session.handleFinishParty}
                disabled={!canFinishParty}
              >
                Terminer la partie
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <FlowersRankingList rankingPlayers={rankingPlayers} />

        <FlowersPartyStoragePanel
          activePartyId={session.partyId}
          isLoadingParty={session.isLoadingParty}
          isSavingParty={session.isSavingParty}
          isMutatingParty={session.isMutatingParty}
          partyName={session.partyName}
          savedParties={session.savedParties}
          statusMessage={session.statusMessage}
          onChangePartyName={session.setPartyName}
          onCreateParty={session.resetParty}
          onDeleteParty={session.handleDeleteParty}
          onLoadParty={session.handleLoadParty}
          onRenameParty={session.handleRenameParty}
          onSaveParty={session.handleSaveParty}
          onTogglePartyActive={session.handleTogglePartyActive}
        />
      </div>
      <ToastStack onDismiss={session.dismissToast} toasts={session.toasts} />
    </main>
  );
}
