"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SkyjoRankingPlayer } from "@/types/skyjo-score";

const podiumByRank: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

type SkyjoRankingListProps = {
  rankingPlayers: SkyjoRankingPlayer[];
};

export function SkyjoRankingList({ rankingPlayers }: SkyjoRankingListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Classement final</CardTitle>
        <CardDescription>
          A Skyjo, le meilleur score est le plus faible total cumule.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rankingPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Le classement apparaitra des que des joueurs seront ajoutes.
          </p>
        ) : (
          <div className="space-y-3">
            {rankingPlayers.map((player) => {
              const isLeader = player.rank === 1;
              const podium = podiumByRank[player.rank];

              return (
                <div
                  key={player.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-card-foreground sm:flex-row sm:items-center sm:justify-between",
                    isLeader && "border-primary bg-primary/10",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-lg">
                      {podium ?? (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {player.rank}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{player.name || "Sans nom"}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.roundTotals.length} manche{player.roundTotals.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Cumul</p>
                    <p className="text-xl font-semibold">{player.cumulativeTotal}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
