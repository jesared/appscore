"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  onChangeScore: (playerId: string, roundId: string, value: number) => void;
  onRemovePlayer: (playerId: string) => void;
  onRemoveRound: (roundId: string) => void;
};

type SkyjoRoundSectionProps = {
  isLocked: boolean;
  leaderPlayerId?: string;
  onChangeRoundName: (roundId: string, name: string) => void;
  onChangeScore: (playerId: string, roundId: string, value: number) => void;
  onRemoveRound: (round: SkyjoRound) => void;
  players: Player[];
  round: SkyjoRound;
  rounds: SkyjoRound[];
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

function SkyjoRoundSection({
  isLocked,
  leaderPlayerId,
  onChangeRoundName,
  onChangeScore,
  onRemoveRound,
  players,
  round,
  rounds,
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
    <section className="space-y-3 rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={round.name}
          onChange={(event) => onChangeRoundName(round.id, event.target.value)}
          disabled={isLocked}
          placeholder="Nom de la manche"
          aria-label={`Nom de ${round.name}`}
          className="max-w-48 border-transparent bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        />

        <Button
          variant="ghost"
          size="sm"
          disabled={isLocked || roundsCount === 1}
          onClick={() => onRemoveRound(round)}
        >
          Supprimer
        </Button>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {players.map((player) => {
          const roundPoints = getRoundPoints(scoreSheets, player.id, round.id);
          const isBest =
            bestRoundTotal !== undefined && roundPoints === bestRoundTotal;

          return (
            <div
              key={player.id}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_8.25rem] items-center gap-3 p-3",
                isBest && "bg-primary/5",
              )}
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {player.name || "Sans nom"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total partie {calculateSkyjoCumulativeTotal(rounds, scoreSheets[player.id])}
                  {leaderPlayerId === player.id ? " - en tete" : ""}
                </p>
              </div>

              <label className="space-y-1">
                <span className="sr-only">Points de {player.name || "Sans nom"}</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={String(roundPoints)}
                  disabled={isLocked}
                  aria-label={`Points de ${player.name || "Sans nom"} pour ${round.name}`}
                  className="h-12 text-right text-lg font-semibold"
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
          );
        })}
      </div>
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
  onChangeScore,
  onRemovePlayer,
  onRemoveRound,
}: SkyjoScoreTableProps) {
  const rankingByPlayerId = new Map(
    rankingPlayers.map((player) => [player.id, player]),
  );
  const leader = rankingPlayers[0];

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
      <CardHeader className="gap-3 border-b border-border/70 bg-background/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-xl sm:text-2xl">
              Scores
            </CardTitle>
            <CardDescription>
              Saisis les points. Le plus petit total gagne.
            </CardDescription>
            {isLocked ? (
              <p className="text-sm font-medium text-primary">
                Partie terminee: la feuille est verrouillee en lecture seule.
              </p>
            ) : null}
          </div>

          <Button className="w-full sm:w-auto" onClick={onAddRound} disabled={isLocked}>
            + Manche
          </Button>
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => {
            const rankingPlayer = rankingByPlayerId.get(player.id);
            const isLeader = leader?.id === player.id;

            return (
              <div
                key={player.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-3 text-card-foreground",
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
                        <span className="rounded-xl bg-primary px-2 py-0.5 font-medium text-primary-foreground">
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

                <div className="mt-3 rounded-xl bg-background px-3 py-2.5">
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

      <CardContent className="space-y-4 pt-4 sm:pt-5">
        {rounds.map((round) => (
          <SkyjoRoundSection
            key={round.id}
            isLocked={isLocked}
            leaderPlayerId={leader?.id}
            onChangeRoundName={onChangeRoundName}
            onChangeScore={onChangeScore}
            onRemoveRound={handleRemoveRound}
            players={players}
            round={round}
            rounds={rounds}
            roundsCount={rounds.length}
            scoreSheets={scoreSheets}
          />
        ))}
      </CardContent>
    </Card>
  );
}
