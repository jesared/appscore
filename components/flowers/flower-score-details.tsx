"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreDetails } from "@/types/flowers";

type FlowerScoreDetailsProps = {
  score: ScoreDetails;
};

export function FlowerScoreDetails({ score }: FlowerScoreDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail du score Flowers</CardTitle>
        <CardDescription>
          Le calcul combine validation des valeurs, groupes de couleur et bonus papillons.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Groupes couleur</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{score.colorGroups.length}</p>
          </div>
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cartes invalides</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{score.invalidCards.length}</p>
          </div>
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Points couleur</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{score.colorPoints}</p>
          </div>
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Points papillons</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{score.butterflyPoints}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Penalite</p>
          <p className="mt-2 text-xl font-semibold text-foreground">-{score.penalty}</p>
        </div>

        <div className="rounded-2xl bg-primary px-4 py-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.24em]">Total final</p>
          <p className="mt-2 text-4xl font-semibold">{score.total}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Cartes penalisees</p>
          {score.invalidCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune carte invalide sur cet exemple.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {score.invalidCards.map((card) => (
                <span
                  key={card.id}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                >
                  {card.id} ({card.color} {card.value})
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
