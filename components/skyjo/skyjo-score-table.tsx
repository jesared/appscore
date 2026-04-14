"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateSkyjoCumulativeTotal,
  calculateSkyjoRoundTotal,
  createEmptySkyjoScoreSheet,
} from "@/lib/skyjo-score";
import { cn } from "@/lib/utils";
import type {
  SkyjoRankingPlayer,
  SkyjoRound,
  SkyjoScoreSheetsByPlayer,
} from "@/types/skyjo-score";
import type { Player } from "@/types/player";

type SkyjoScoreTableProps = {
  isLocked: boolean;
  players: Player[];
  rounds: SkyjoRound[];
  scoreSheets: SkyjoScoreSheetsByPlayer;
  rankingPlayers: SkyjoRankingPlayer[];
  onAddRound: () => void;
  onChangePlayerName: (playerId: string, name: string) => void;
  onChangeRoundName: (roundId: string, name: string) => void;
  onChangeRoundNote: (roundId: string, note: string) => void;
  onChangeScore: (playerId: string, roundId: string, value: number) => void;
  onRemovePlayer: (playerId: string) => void;
  onRemoveRound: (roundId: string) => void;
};

type SkyjoRoundSectionProps = {
  isCollapsed: boolean;
  isLocked: boolean;
  leaderPlayerId?: string;
  onChangeRoundName: (roundId: string, name: string) => void;
  onChangeRoundNote: (roundId: string, note: string) => void;
  onChangeScore: (playerId: string, roundId: string, value: number) => void;
  onRemoveRound: (round: SkyjoRound) => void;
  onToggleCollapsed: (roundId: string) => void;
  players: Player[];
  round: SkyjoRound;
  roundsCount: number;
  scoreSheets: SkyjoScoreSheetsByPlayer;
};

function parseNumericValue(rawValue: string) {
  if (rawValue.trim() === "") {
    return 0;
  }

  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.trunc(numericValue);
}

function getRoundPoints(
  scoreSheets: SkyjoScoreSheetsByPlayer,
  playerId: string,
  roundId: string,
) {
  return calculateSkyjoRoundTotal(
    scoreSheets[playerId]?.[roundId] ?? createEmptySkyjoScoreSheet(),
  );
}

function RoundMetaEditor({
  isLocked,
  round,
  onChangeRoundName,
  onChangeRoundNote,
}: {
  isLocked: boolean;
  round: SkyjoRound;
  onChangeRoundName: (roundId: string, name: string) => void;
  onChangeRoundNote: (roundId: string, note: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
      <label className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Nom de manche
        </span>
        <Input
          value={round.name}
          onChange={(event) => onChangeRoundName(round.id, event.target.value)}
          disabled={isLocked}
          placeholder="Nom de la manche"
          aria-label={`Nom de ${round.name}`}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Note de manche
        </span>
        <Textarea
          value={round.note ?? ""}
          onChange={(event) => onChangeRoundNote(round.id, event.target.value)}
          disabled={isLocked}
          placeholder="Remarque, evenement ou rappel pour cette manche"
          aria-label={`Note de ${round.name}`}
          rows={2}
          className="min-h-[84px] resize-none"
        />
      </label>
    </div>
  );
}

function SkyjoRoundSection({
  isCollapsed,
  isLocked,
  leaderPlayerId,
  onChangeRoundName,
  onChangeRoundNote,
  onChangeScore,
  onRemoveRound,
  onToggleCollapsed,
  players,
  round,
  roundsCount,
  scoreSheets,
}: SkyjoRoundSectionProps) {
  const roundTotals = players.map((player) => ({
    playerId: player.id,
    total: getRoundPoints(scoreSheets, player.id, round.id),
  }));
  const bestRoundTotal = roundTotals.length
    ? Math.min(...roundTotals.map((entry) => entry.total))
    : undefined;

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
              {round.name}
            </span>
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
              {players.length} joueur{players.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Une seule saisie par joueur: moins le total est eleve, mieux c&apos;est.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleCollapsed(round.id)}
          >
            {isCollapsed ? "Deplier la manche" : "Replier la manche"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLocked || roundsCount === 1}
            onClick={() => onRemoveRound(round)}
          >
            Supprimer la manche
          </Button>
        </div>
      </div>

      <RoundMetaEditor
        isLocked={isLocked}
        round={round}
        onChangeRoundName={onChangeRoundName}
        onChangeRoundNote={onChangeRoundNote}
      />

      {isCollapsed ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => {
            const roundPoints = getRoundPoints(scoreSheets, player.id, round.id);
            const isBest =
              bestRoundTotal !== undefined && roundPoints === bestRoundTotal;

            return (
              <div
                key={player.id}
                className={cn(
                  "rounded-2xl border border-border bg-card px-4 py-3",
                  isBest && "border-primary bg-primary/10",
                )}
              >
                <p className="font-medium text-foreground">
                  {player.name || "Sans nom"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manche: {roundPoints} point{roundPoints > 1 ? "s" : ""}
                </p>
                {leaderPlayerId === player.id ? (
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-primary">
                    Meilleur cumul actuel
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 rounded-l-2xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Ligne
                  </th>
                  {players.map((player) => (
                    <th
                      key={player.id}
                      className="min-w-[180px] border-y border-r border-border bg-card px-4 py-3 text-left align-top"
                    >
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">
                          {player.name || "Sans nom"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leaderPlayerId === player.id
                            ? "Meilleur cumul actuel"
                            : "Score de manche"}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sticky left-0 z-10 border-x border-b border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
                    Points
                  </td>
                  {players.map((player) => {
                    const roundPoints = getRoundPoints(scoreSheets, player.id, round.id);

                    return (
                      <td
                        key={player.id}
                        className={cn(
                          "border-r border-b border-border bg-background px-4 py-3",
                          bestRoundTotal !== undefined &&
                            roundPoints === bestRoundTotal &&
                            "bg-primary/5",
                        )}
                      >
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={String(roundPoints)}
                          disabled={isLocked}
                          onChange={(event) =>
                            onChangeScore(
                              player.id,
                              round.id,
                              parseNumericValue(event.target.value),
                            )
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left-0 z-10 rounded-bl-2xl border-x border-b border-border bg-card px-4 py-3 text-sm font-semibold text-foreground">
                    Total manche
                  </td>
                  {players.map((player, index) => {
                    const roundPoints = getRoundPoints(scoreSheets, player.id, round.id);

                    return (
                      <td
                        key={player.id}
                        className={cn(
                          "border-r border-b border-border bg-card px-4 py-3 text-right text-sm font-semibold text-foreground",
                          index === players.length - 1 && "rounded-br-2xl",
                          bestRoundTotal !== undefined &&
                            roundPoints === bestRoundTotal &&
                            "bg-primary/10",
                        )}
                      >
                        {roundPoints}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {players.map((player) => {
              const roundPoints = getRoundPoints(scoreSheets, player.id, round.id);
              const isBest =
                bestRoundTotal !== undefined && roundPoints === bestRoundTotal;

              return (
                <div
                  key={player.id}
                  className={cn(
                    "rounded-2xl border border-border bg-card p-4",
                    isBest && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {player.name || "Sans nom"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {leaderPlayerId === player.id
                          ? "Meilleur cumul actuel"
                          : "Saisie de la manche"}
                      </p>
                    </div>
                    {isBest ? (
                      <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                        Meilleur score
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Points
                      </span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={String(roundPoints)}
                        disabled={isLocked}
                        onChange={(event) =>
                          onChangeScore(
                            player.id,
                            round.id,
                            parseNumericValue(event.target.value),
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function SkyjoScoreTable({
  isLocked,
  players,
  rounds,
  scoreSheets,
  rankingPlayers,
  onAddRound,
  onChangePlayerName,
  onChangeRoundName,
  onChangeRoundNote,
  onChangeScore,
  onRemovePlayer,
  onRemoveRound,
}: SkyjoScoreTableProps) {
  const [collapsedRoundIds, setCollapsedRoundIds] = useState<string[]>([]);
  const rankingByPlayerId = new Map(
    rankingPlayers.map((player) => [player.id, player]),
  );
  const leader = rankingPlayers[0];

  const isRoundCollapsed = (roundId: string) =>
    collapsedRoundIds.includes(roundId);

  const toggleRoundCollapsed = (roundId: string) => {
    setCollapsedRoundIds((currentIds) =>
      currentIds.includes(roundId)
        ? currentIds.filter((currentId) => currentId !== roundId)
        : [...currentIds, roundId],
    );
  };

  const handleRemovePlayer = (player: Player) => {
    if (isLocked) {
      return;
    }

    const playerLabel = player.name.trim() || "ce joueur";
    const shouldRemove = window.confirm(
      `Supprimer ${playerLabel} de la feuille de score ?`,
    );

    if (!shouldRemove) {
      return;
    }

    onRemovePlayer(player.id);
  };

  const handleRemoveRound = (round: SkyjoRound) => {
    if (isLocked || rounds.length === 1) {
      return;
    }

    const shouldRemove = window.confirm(`Supprimer ${round.name} ?`);

    if (!shouldRemove) {
      return;
    }

    onRemoveRound(round.id);
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Table de score</CardTitle>
          <CardDescription>
            Ajoute au moins un joueur pour afficher la feuille de score.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 border-b border-border/70 bg-background/80">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-3xl md:text-4xl">
              Feuille de score Skyjo
            </CardTitle>
            <CardDescription>
              Une saisie simple par manche: chaque joueur note ses points, et
              le classement garde le plus petit total en tete.
            </CardDescription>
            {isLocked ? (
              <p className="text-sm font-medium text-primary">
                Partie terminee: la feuille est verrouillee en lecture seule.
              </p>
            ) : null}
          </div>

          <Button className="w-full md:w-auto" onClick={onAddRound} disabled={isLocked}>
            Ajouter une manche
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => {
            const rankingPlayer = rankingByPlayerId.get(player.id);
            const isLeader = leader?.id === player.id;

            return (
              <div
                key={player.id}
                className={cn(
                  "rounded-2xl border border-border bg-card p-4 text-card-foreground",
                  isLeader && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={player.name}
                      onChange={(event) =>
                        onChangePlayerName(player.id, event.target.value)
                      }
                      disabled={isLocked}
                      aria-label={`Nom du joueur ${player.name || player.id}`}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Rang #{rankingPlayer?.rank ?? "-"}</span>
                      {isLeader ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground">
                          En tete
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLocked}
                    onClick={() => handleRemovePlayer(player)}
                  >
                    Retirer
                  </Button>
                </div>

                <div className="mt-4 rounded-2xl bg-background px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total cumule
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {calculateSkyjoCumulativeTotal(rounds, scoreSheets[player.id])}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {rounds.map((round) => (
          <SkyjoRoundSection
            key={round.id}
            isCollapsed={isRoundCollapsed(round.id)}
            isLocked={isLocked}
            leaderPlayerId={leader?.id}
            onChangeRoundName={onChangeRoundName}
            onChangeRoundNote={onChangeRoundNote}
            onChangeScore={onChangeScore}
            onRemoveRound={handleRemoveRound}
            onToggleCollapsed={toggleRoundCollapsed}
            players={players}
            round={round}
            roundsCount={rounds.length}
            scoreSheets={scoreSheets}
          />
        ))}
      </CardContent>
    </Card>
  );
}
