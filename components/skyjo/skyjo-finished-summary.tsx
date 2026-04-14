"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkyjoRankingPlayer, SkyjoRound } from "@/types/skyjo-score";

type SkyjoFinishedSummaryProps = {
  finishedAt?: string;
  rankingPlayers: SkyjoRankingPlayer[];
  rounds: SkyjoRound[];
  onReopenParty: () => void;
};

function formatFinishedAt(value?: string) {
  if (!value) {
    return "Terminee a l'instant";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SkyjoFinishedSummary({
  finishedAt,
  rankingPlayers,
  rounds,
  onReopenParty,
}: SkyjoFinishedSummaryProps) {
  const winner = rankingPlayers[0];

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle>Fin de partie</CardTitle>
            <CardDescription>
              Les scores sont verrouilles. Le joueur avec le plus petit total
              cumule remporte la partie.
            </CardDescription>
          </div>

          <Button variant="outline" onClick={onReopenParty}>
            Reouvrir la partie
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary-foreground/80">
            Partie terminee
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {winner ? winner.name || "Sans nom" : "Aucun vainqueur"}
          </p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {winner
              ? `${winner.cumulativeTotal} points cumules`
              : "Ajoute des joueurs pour produire un classement"}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-primary-foreground/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-primary-foreground/70">
                Terminee le
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatFinishedAt(finishedAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-primary-foreground/70">
                Joueurs
              </p>
              <p className="mt-2 text-sm font-medium">{rankingPlayers.length}</p>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-primary-foreground/70">
                Manches
              </p>
              <p className="mt-2 text-sm font-medium">{rounds.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Resume final</p>

          {rankingPlayers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground">
              Aucun joueur n&apos;est encore classe.
            </div>
          ) : (
            rankingPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-card-foreground"
              >
                <div>
                  <p className="font-medium">{player.name || "Sans nom"}</p>
                  <p className="text-xs text-muted-foreground">
                    Rang #{player.rank}
                  </p>
                </div>
                <p className="text-xl font-semibold">{player.cumulativeTotal}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
