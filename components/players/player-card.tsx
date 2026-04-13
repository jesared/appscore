"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScoreFieldInput } from "@/components/score/score-field-input";
import { calculateScoreTotal } from "@/lib/score/calculations";
import { cn } from "@/lib/utils";
import type { GameTemplate } from "@/types/game-template";
import type { Player } from "@/types/player";
import type { ScoreEntry } from "@/types/score-entry";

type PlayerCardProps = {
  player: Player;
  template: GameTemplate;
  scoreEntry: ScoreEntry;
  onChangeName: (playerId: string, name: string) => void;
  onChangeScore: (playerId: string, fieldId: string, value: number) => void;
  onRemovePlayer: (playerId: string) => void;
  isLeader?: boolean;
};

export function PlayerCard({
  player,
  template,
  scoreEntry,
  onChangeName,
  onChangeScore,
  onRemovePlayer,
  isLeader = false,
}: PlayerCardProps) {
  const total = calculateScoreTotal(template, scoreEntry);
  const handleRemovePlayer = () => {
    const playerLabel = player.name.trim() || "ce joueur";
    const shouldRemove = window.confirm(`Supprimer ${playerLabel} ?`);

    if (!shouldRemove) {
      return;
    }

    onRemovePlayer(player.id);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isLeader && "border-primary bg-primary/5 shadow-floating",
      )}
    >
      <CardHeader className="border-b border-border/70 bg-background/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Joueur</CardTitle>
              {isLeader ? (
                <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                  Leader
                </span>
              ) : null}
            </div>

            <Input
              value={player.name}
              onChange={(event) => onChangeName(player.id, event.target.value)}
              placeholder="Nom du joueur"
              aria-label={`Nom du joueur ${player.name || player.id}`}
            />

            <CardDescription>{template.name}</CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePlayer}
            aria-label={`Supprimer ${player.name || "ce joueur"}`}
          >
            Supprimer
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {template.scoreFields.map((field) => (
            <ScoreFieldInput
              key={field.id}
              field={field}
              value={scoreEntry.values[field.id] ?? field.defaultValue}
              onChange={(value) => onChangeScore(player.id, field.id, value)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3">
          <span className="text-sm font-medium text-secondary-foreground">Total en temps reel</span>
          <span className="text-2xl font-semibold text-foreground">{total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
