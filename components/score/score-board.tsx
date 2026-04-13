"use client";

import { PlayerCard } from "@/components/players/player-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createScoreEntry } from "@/lib/score/entries";
import { buildRanking } from "@/lib/score/ranking";
import type { GameTemplate } from "@/types/game-template";
import type { Player } from "@/types/player";
import type { ScoreEntry } from "@/types/score-entry";

type ScoreBoardProps = {
  template: GameTemplate;
  players: Player[];
  scoreEntries: ScoreEntry[];
  onChangePlayerName: (playerId: string, name: string) => void;
  onChangeScore: (playerId: string, fieldId: string, value: number) => void;
  onRemovePlayer: (playerId: string) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
};

export function ScoreBoard({
  template,
  players,
  scoreEntries,
  onChangePlayerName,
  onChangeScore,
  onRemovePlayer,
  emptyStateTitle = "Aucun joueur pour le moment",
  emptyStateDescription = "Ajoute un joueur pour commencer a remplir la fiche de score.",
}: ScoreBoardProps) {
  const ranking = buildRanking(players, scoreEntries, template);

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{emptyStateTitle}</CardTitle>
          <CardDescription>{emptyStateDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Fiche de score</h2>
          <p className="text-sm text-muted-foreground">
            {players.length} joueur{players.length > 1 ? "s" : ""} | {template.scoreFields.length} champ
            {template.scoreFields.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {players.map((player) => {
          const scoreEntry =
            scoreEntries.find((entry) => entry.playerId === player.id && entry.gameId === template.id) ??
            createScoreEntry(template, player.id);

          const rankedPlayer = ranking.find((entry) => entry.id === player.id);

          return (
            <PlayerCard
              key={player.id}
              player={player}
              template={template}
              scoreEntry={scoreEntry}
              onChangeName={onChangePlayerName}
              onChangeScore={onChangeScore}
              onRemovePlayer={onRemovePlayer}
              isLeader={rankedPlayer?.rank === 1}
            />
          );
        })}
      </div>
    </div>
  );
}
