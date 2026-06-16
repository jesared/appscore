"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { FlowersPartyStoragePanel } from "@/components/flowers/flowers-party-storage-panel";
import { useGameSessionManager } from "@/components/games/use-game-session-manager";
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
import { ToastStack } from "@/components/ui/toast-stack";
import { getRequiredGame } from "@/lib/games/registry";
import {
  SKYJO_MAX_PLAYERS,
  buildSkyjoRanking,
  createEmptySkyjoScoreSheet,
} from "@/lib/skyjo-score";
import { createEntityId } from "@/lib/score/ids";
import type { SkyjoPartySummary } from "@/types/skyjo-party";
import type {
  SkyjoRound,
  SkyjoScoreSheet,
  SkyjoScoreSheetsByPlayer,
} from "@/types/skyjo-score";

function createRound(roundNumber: number): SkyjoRound {
  return {
    id: createEntityId("round"),
    name: `Manche ${roundNumber}`,
    note: "",
  };
}

const skyjoGame = getRequiredGame("skyjo");
const skyjoMaxPlayers = skyjoGame.maxPlayers ?? SKYJO_MAX_PLAYERS;
const skyjoDefaultPartyName = `${skyjoGame.sessionLabel[0].toUpperCase()}${skyjoGame.sessionLabel.slice(1)} ${skyjoGame.name}`;

export function SkyjoGamePage() {
  const session = useGameSessionManager<
    SkyjoRound,
    SkyjoScoreSheet,
    SkyjoPartySummary
  >({
    apiBasePath: skyjoGame.apiBasePath,
    createEmptyScoreSheet: createEmptySkyjoScoreSheet,
    createRound,
    defaultSessionName: skyjoDefaultPartyName,
    gameName: skyjoGame.name,
    maxPlayers: skyjoMaxPlayers,
    sessionLabel: skyjoGame.sessionLabel,
    sessionLabelPlural: skyjoGame.sessionLabelPlural,
  });

  function handleChangeScore(playerId: string, roundId: string, value: number) {
    if (session.isPartyFinished) {
      return;
    }

    session.setScoreSheets((currentScoreSheets) => ({
      ...currentScoreSheets,
      [playerId]: {
        ...(currentScoreSheets[playerId] ?? {}),
        [roundId]: {
          points: value,
        },
      },
    }));
  }

  const scoreSheets = session.scoreSheets as SkyjoScoreSheetsByPlayer;
  const rankingPlayers = buildSkyjoRanking(
    session.players,
    session.rounds,
    scoreSheets,
  );
  const leader = rankingPlayers[0];
  const isPlayerLimitReached = session.players.length >= skyjoMaxPlayers;
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
                  {skyjoGame.name}
                </CardTitle>
                <CardDescription className="max-w-2xl">
                  Points par manche, sauvegarde et classement du plus petit
                  total.
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
          <CardContent className="grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
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
          <SkyjoFinishedSummary
            finishedAt={session.finishedAt}
            rankingPlayers={rankingPlayers}
            rounds={session.rounds}
            onReopenParty={session.handleReopenParty}
          />
        ) : session.players.length === 0 ? (
          <AddPlayerForm
            description={
              isPlayerLimitReached
                ? `Limite atteinte: ${skyjoGame.name} se joue jusqu'a ${skyjoMaxPlayers} joueurs.`
                : `Ajoute jusqu'a ${skyjoMaxPlayers} joueurs pour cette ${skyjoGame.sessionLabel} ${skyjoGame.name}.`
            }
            isDisabled={isPlayerLimitReached || session.isPartyFinished}
            onAddPlayer={session.handleAddPlayer}
            placeholder="Nom du joueur"
          />
        ) : null}

        <SkyjoScoreTable
          isLocked={session.isPartyFinished}
          players={session.players}
          rounds={session.rounds}
          scoreSheets={scoreSheets}
          rankingPlayers={rankingPlayers}
          onAddRound={session.handleAddRound}
          onChangePlayerName={session.handleChangePlayerName}
          onChangeRoundName={session.handleChangeRoundName}
          onChangeScore={handleChangeScore}
          onRemovePlayer={session.handleRemovePlayer}
          onRemoveRound={session.handleRemoveRound}
        />

        {!session.isPartyFinished &&
        session.players.length > 0 &&
        !isPlayerLimitReached ? (
          <AddPlayerForm
            description={`Ajoute un autre joueur pour cette ${skyjoGame.sessionLabel} ${skyjoGame.name}.`}
            isDisabled={session.isPartyFinished}
            onAddPlayer={session.handleAddPlayer}
            placeholder="Autre joueur"
          />
        ) : null}

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

        <SkyjoRankingList rankingPlayers={rankingPlayers} />

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
