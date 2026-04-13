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
import { flowersScoreFields } from "@/data/flowers-score-fields";
import {
  calculateFlowersCumulativeTotal,
  calculateFlowersTotal,
  createEmptyFlowersScoreSheet,
} from "@/lib/flowers-score";
import { cn } from "@/lib/utils";
import type {
  FlowersRankingPlayer,
  FlowersRound,
  FlowersScoreField,
  FlowersScoreFieldId,
  FlowersScoreSheetsByPlayer,
} from "@/types/flowers-score";
import type { Player } from "@/types/player";

type FlowersScoreTableProps = {
  players: Player[];
  rounds: FlowersRound[];
  scoreSheets: FlowersScoreSheetsByPlayer;
  rankingPlayers: FlowersRankingPlayer[];
  onAddRound: () => void;
  onChangePlayerName: (playerId: string, name: string) => void;
  onChangeScore: (
    playerId: string,
    roundId: string,
    fieldId: FlowersScoreFieldId,
    value: number,
  ) => void;
  onRemovePlayer: (playerId: string) => void;
  onRemoveRound: (roundId: string) => void;
};

type RoundSectionProps = {
  players: Player[];
  round: FlowersRound;
  roundsCount: number;
  scoreSheets: FlowersScoreSheetsByPlayer;
  leaderPlayerId?: string;
  isCollapsed: boolean;
  onChangeScore: (
    playerId: string,
    roundId: string,
    fieldId: FlowersScoreFieldId,
    value: number,
  ) => void;
  onToggleCollapsed: (roundId: string) => void;
  onRemoveRound: (round: FlowersRound) => void;
};

function parseNumericValue(rawValue: string, min = 0) {
  if (rawValue.trim() === "") {
    return min;
  }

  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return numericValue < min ? min : numericValue;
}

function ScoreRowLabel({ field }: { field: FlowersScoreField }) {
  return (
    <div className="flex items-center gap-3">
      {field.kind === "color" ? (
        <span
          className="size-3 rounded-full border border-black/10 shadow-sm"
          style={{ backgroundColor: field.accentColor ?? "#CBD5E1" }}
          aria-hidden="true"
        />
      ) : null}
      <div>
        <p className="font-medium text-foreground">{field.label}</p>
        {field.description ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {field.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getRoundTotal(
  scoreSheets: FlowersScoreSheetsByPlayer,
  playerId: string,
  roundId: string,
) {
  const roundSheet =
    scoreSheets[playerId]?.[roundId] ?? createEmptyFlowersScoreSheet();
  return calculateFlowersTotal(roundSheet);
}

export function FlowersScoreTable({
  players,
  rounds,
  scoreSheets,
  rankingPlayers,
  onAddRound,
  onChangePlayerName,
  onChangeScore,
  onRemovePlayer,
  onRemoveRound,
}: FlowersScoreTableProps) {
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
    const playerLabel = player.name.trim() || "ce joueur";
    const shouldRemove = window.confirm(
      `Supprimer ${playerLabel} de la feuille de marque ?`,
    );

    if (!shouldRemove) {
      return;
    }

    onRemovePlayer(player.id);
  };

  const handleRemoveRound = (round: FlowersRound) => {
    if (rounds.length === 1) {
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
            Ajoute au moins un joueur pour afficher la feuille de marque.
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
              Feuille de marque Flowers
            </CardTitle>
            <CardDescription>
              Les joueurs sont en colonnes. Chaque manche garde ses scores, son
              total et alimente le cumul final.
            </CardDescription>
          </div>

          <Button className="w-full md:w-auto" onClick={onAddRound}>
            Ajouter une manche
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6 lg:hidden">
          <MobilePlayersSection
            players={players}
            rankingByPlayerId={rankingByPlayerId}
            leaderPlayerId={leader?.id}
            onChangePlayerName={onChangePlayerName}
            onRemovePlayer={handleRemovePlayer}
          />

          {rounds.map((round) => (
            <MobileRoundSection
              key={round.id}
              players={players}
              round={round}
              roundsCount={rounds.length}
              scoreSheets={scoreSheets}
              leaderPlayerId={leader?.id}
              isCollapsed={isRoundCollapsed(round.id)}
              onChangeScore={onChangeScore}
              onToggleCollapsed={toggleRoundCollapsed}
              onRemoveRound={handleRemoveRound}
            />
          ))}

          <MobileCumulativeSection
            players={players}
            rounds={rounds}
            scoreSheets={scoreSheets}
            leaderPlayerId={leader?.id}
          />
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[860px] w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-56 rounded-l-2xl bg-muted/80 px-4 py-4 text-left text-sm font-semibold text-foreground backdrop-blur">
                  Categories
                </th>
                {players.map((player, index) => {
                  const playerRanking = rankingByPlayerId.get(player.id);
                  const isLeader = leader?.id === player.id;

                  return (
                    <th
                      key={player.id}
                      className={cn(
                        "min-w-52 border-l border-border/60 bg-muted/50 px-4 py-4 align-top",
                        isLeader && "bg-primary/10",
                        index === players.length - 1 && "rounded-r-2xl",
                      )}
                    >
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Input
                            value={player.name}
                            onChange={(event) =>
                              onChangePlayerName(player.id, event.target.value)
                            }
                            placeholder="Nom du joueur"
                            aria-label={`Nom du joueur ${player.id}`}
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Classement #{playerRanking?.rank ?? "-"}
                            </span>
                            <span>
                              Cumul {playerRanking?.cumulativeTotal ?? 0}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => handleRemovePlayer(player)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rounds.map((round) => (
                <DesktopRoundSection
                  key={round.id}
                  players={players}
                  round={round}
                  roundsCount={rounds.length}
                  scoreSheets={scoreSheets}
                  leaderPlayerId={leader?.id}
                  isCollapsed={isRoundCollapsed(round.id)}
                  onChangeScore={onChangeScore}
                  onToggleCollapsed={toggleRoundCollapsed}
                  onRemoveRound={handleRemoveRound}
                />
              ))}

              <tr>
                <td className="sticky left-0 z-10 rounded-bl-2xl border-t border-border/60 bg-primary px-4 py-5 text-primary-foreground">
                  <div>
                    <p className="font-semibold">Total cumule</p>
                    <p className="text-xs text-primary-foreground/80">
                      Somme de toutes les manches
                    </p>
                  </div>
                </td>

                {players.map((player, index) => {
                  const cumulativeTotal = calculateFlowersCumulativeTotal(
                    rounds,
                    scoreSheets[player.id],
                  );
                  const isLeader = leader?.id === player.id;

                  return (
                    <td
                      key={`cumulative-${player.id}`}
                      className={cn(
                        "border-l border-t border-primary/20 bg-primary px-4 py-5 text-center text-primary-foreground",
                        isLeader && "bg-primary",
                        index === players.length - 1 && "rounded-br-2xl",
                      )}
                    >
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-primary-foreground/80">
                          Cumul
                        </p>
                        <p className="text-3xl font-semibold">
                          {cumulativeTotal}
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

type MobilePlayersSectionProps = {
  players: Player[];
  rankingByPlayerId: Map<string, FlowersRankingPlayer>;
  leaderPlayerId?: string;
  onChangePlayerName: (playerId: string, name: string) => void;
  onRemovePlayer: (player: Player) => void;
};

function MobilePlayersSection({
  players,
  rankingByPlayerId,
  leaderPlayerId,
  onChangePlayerName,
  onRemovePlayer,
}: MobilePlayersSectionProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Joueurs</p>
        <p className="text-xs text-muted-foreground">
          Renomme les joueurs et retrouve leur cumul sans scroller
          horizontalement.
        </p>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const ranking = rankingByPlayerId.get(player.id);
          const isLeader = leaderPlayerId === player.id;

          return (
            <div
              key={player.id}
              className={cn(
                "rounded-2xl border border-border bg-card p-4 text-card-foreground",
                isLeader && "border-primary bg-primary/10",
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={player.name}
                      onChange={(event) =>
                        onChangePlayerName(player.id, event.target.value)
                      }
                      placeholder="Nom du joueur"
                      aria-label={`Nom du joueur ${player.id}`}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Classement #{ranking?.rank ?? "-"}</span>
                      <span>Cumul {ranking?.cumulativeTotal ?? 0}</span>
                    </div>
                  </div>

                  {isLeader ? (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                      Leader
                    </span>
                  ) : null}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onRemovePlayer(player)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MobileRoundSection({
  players,
  round,
  roundsCount,
  scoreSheets,
  leaderPlayerId,
  isCollapsed,
  onChangeScore,
  onToggleCollapsed,
  onRemoveRound,
}: RoundSectionProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            {round.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {isCollapsed
              ? "Manche repliee. Les totaux restent visibles."
              : "Saisie rapide de la manche pour chaque joueur."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:w-auto sm:items-end">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onToggleCollapsed(round.id)}
          >
            {isCollapsed ? "Deplier la manche" : "Replier la manche"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onRemoveRound(round)}
            disabled={roundsCount === 1}
          >
            Supprimer la manche
          </Button>
        </div>
      </div>

      {isCollapsed ? (
        <div className="grid gap-2">
          {players.map((player) => {
            const roundTotal = getRoundTotal(scoreSheets, player.id, round.id);
            const isLeader = leaderPlayerId === player.id;

            return (
              <div
                key={`${round.id}-${player.id}-summary`}
                className={cn(
                  "flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3",
                  isLeader && "border-primary bg-primary/5",
                )}
              >
                <p className="font-medium text-foreground">
                  {player.name || "Sans nom"}
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {roundTotal.finalTotal}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player) => {
            const roundSheet =
              scoreSheets[player.id]?.[round.id] ??
              createEmptyFlowersScoreSheet();
            const roundTotal = calculateFlowersTotal(roundSheet);
            const isLeader = leaderPlayerId === player.id;

            return (
              <div
                key={`${round.id}-${player.id}`}
                className={cn(
                  "rounded-2xl border border-border bg-background p-4",
                  isLeader && "border-primary bg-primary/5",
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {player.name || "Sans nom"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {round.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {roundTotal.finalTotal}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {flowersScoreFields.map((field) => (
                    <label
                      key={`${round.id}-${player.id}-${field.id}`}
                      className={cn(
                        "space-y-2 rounded-2xl border border-border bg-card p-3",
                        field.kind === "penalty" && "col-span-2",
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {field.kind === "color" ? (
                          <span
                            className="size-3 rounded-full border border-black/10 shadow-sm"
                            style={{
                              backgroundColor: field.accentColor ?? "#CBD5E1",
                            }}
                            aria-hidden="true"
                          />
                        ) : null}
                        <span>{field.label}</span>
                      </div>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={field.min ?? 0}
                        value={roundSheet[field.id]}
                        onChange={(event) =>
                          onChangeScore(
                            player.id,
                            round.id,
                            field.id,
                            parseNumericValue(
                              event.target.value,
                              field.min ?? 0,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

type MobileCumulativeSectionProps = {
  players: Player[];
  rounds: FlowersRound[];
  scoreSheets: FlowersScoreSheetsByPlayer;
  leaderPlayerId?: string;
};

function MobileCumulativeSection({
  players,
  rounds,
  scoreSheets,
  leaderPlayerId,
}: MobileCumulativeSectionProps) {
  return (
    <section className="space-y-3 rounded-3xl bg-primary p-4 text-primary-foreground">
      <div>
        <p className="font-semibold">Total cumule</p>
        <p className="text-xs text-primary-foreground/80">
          Somme de toutes les manches
        </p>
      </div>

      <div className="space-y-2">
        {players.map((player) => {
          const cumulativeTotal = calculateFlowersCumulativeTotal(
            rounds,
            scoreSheets[player.id],
          );
          const isLeader = leaderPlayerId === player.id;

          return (
            <div
              key={`mobile-cumulative-${player.id}`}
              className={cn(
                "flex items-center justify-between rounded-2xl bg-primary-foreground/10 px-4 py-3",
                isLeader && "bg-primary-foreground/20",
              )}
            >
              <div>
                <p className="font-medium text-primary-foreground">
                  {player.name || "Sans nom"}
                </p>
                <p className="text-xs text-primary-foreground/80">
                  {isLeader ? "Leader actuel" : "Total partie"}
                </p>
              </div>
              <p className="text-2xl font-semibold text-primary-foreground">
                {cumulativeTotal}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DesktopRoundSection({
  players,
  round,
  roundsCount,
  scoreSheets,
  leaderPlayerId,
  isCollapsed,
  onChangeScore,
  onToggleCollapsed,
  onRemoveRound,
}: RoundSectionProps) {
  return (
    <>
      <tr>
        <td
          colSpan={players.length + 1}
          className="border-t border-border/60 bg-muted/35 px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {round.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {isCollapsed
                  ? "Manche repliee. Les totaux restent visibles."
                  : "Saisie de la manche, avec total calcule en direct."}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleCollapsed(round.id)}
              >
                {isCollapsed ? "Deplier la manche" : "Replier la manche"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveRound(round)}
                disabled={roundsCount === 1}
              >
                Supprimer la manche
              </Button>
            </div>
          </div>
        </td>
      </tr>

      {isCollapsed ? (
        <tr>
          <td className="sticky left-0 z-10 border-t border-border/60 bg-secondary px-4 py-4 text-secondary-foreground">
            <div>
              <p className="font-semibold">Total manche</p>
              <p className="text-xs text-secondary-foreground/80">
                Resume de la manche repliee
              </p>
            </div>
          </td>

          {players.map((player) => {
            const roundTotal = getRoundTotal(scoreSheets, player.id, round.id);

            return (
              <td
                key={`${round.id}-collapsed-total-${player.id}`}
                className={cn(
                  "border-l border-t border-border/60 bg-secondary px-4 py-4 text-center text-secondary-foreground",
                  leaderPlayerId === player.id &&
                    "bg-primary/10 text-foreground",
                )}
              >
                <p className="text-2xl font-semibold">
                  {roundTotal.finalTotal}
                </p>
              </td>
            );
          })}
        </tr>
      ) : (
        <>
          {flowersScoreFields.map((field) => (
            <tr key={`${round.id}-${field.id}`}>
              <td className="sticky left-0 z-10 border-t border-border/60 bg-background px-4 py-4 align-middle">
                <ScoreRowLabel field={field} />
              </td>

              {players.map((player) => (
                <td
                  key={`${round.id}-${field.id}-${player.id}`}
                  className={cn(
                    "border-l border-t border-border/60 bg-background px-4 py-4",
                    leaderPlayerId === player.id && "bg-primary/5",
                  )}
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={field.min ?? 0}
                    value={scoreSheets[player.id]?.[round.id]?.[field.id] ?? 0}
                    onChange={(event) =>
                      onChangeScore(
                        player.id,
                        round.id,
                        field.id,
                        parseNumericValue(event.target.value, field.min ?? 0),
                      )
                    }
                  />
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <td className="sticky left-0 z-10 border-t border-border/60 bg-secondary px-4 py-4 text-secondary-foreground">
              <div>
                <p className="font-semibold">Total manche</p>
                <p className="text-xs text-secondary-foreground/80">
                  Couleurs + bonus papillon - malus
                </p>
              </div>
            </td>

            {players.map((player) => {
              const roundTotal = getRoundTotal(
                scoreSheets,
                player.id,
                round.id,
              );

              return (
                <td
                  key={`${round.id}-total-${player.id}`}
                  className={cn(
                    "border-l border-t border-border/60 bg-secondary px-4 py-4 text-center text-secondary-foreground",
                    leaderPlayerId === player.id && "",
                  )}
                >
                  <p className="text-2xl font-semibold">
                    {roundTotal.finalTotal}
                  </p>
                </td>
              );
            })}
          </tr>
        </>
      )}
    </>
  );
}
