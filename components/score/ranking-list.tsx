"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RankingPlayer } from "@/types/ranking-player";

const podiumByRank: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

type RankingListProps = {
  rankingPlayers: RankingPlayer[];
  title?: string;
  description?: string;
};

export function RankingList({
  rankingPlayers,
  title = "Classement",
  description = "Les totaux sont calcules automatiquement a partir du template actif.",
}: RankingListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rankingPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Le classement apparaitra des que des joueurs seront saisis.
          </p>
        ) : (
          <div className="space-y-3">
            {rankingPlayers.map((player) => {
              const podium = podiumByRank[player.rank];
              const isLeader = player.rank === 1;

              return (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-border/80 px-4 py-3 transition-colors",
                    isLeader && "border-primary bg-primary/5",
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
                      <p className="font-medium text-foreground">{player.name || "Sans nom"}</p>
                      <p className="text-xs text-muted-foreground">
                        Rang #{player.rank}
                        {isLeader ? " | en tete" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                    <p className="text-xl font-semibold text-foreground">{player.total}</p>
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
