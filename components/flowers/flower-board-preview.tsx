"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FlowerBoard, FlowerCard, FlowerGroup } from "@/types/flowers";

type FlowerBoardPreviewProps = {
  board: FlowerBoard;
  invalidCards: FlowerCard[];
  colorGroups: FlowerGroup[];
};

function getBoardBounds(cards: FlowerCard[]) {
  if (cards.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  return cards.reduce(
    (bounds, card) => {
      return {
        minX: Math.min(bounds.minX, card.x),
        maxX: Math.max(bounds.maxX, card.x),
        minY: Math.min(bounds.minY, card.y),
        maxY: Math.max(bounds.maxY, card.y),
      };
    },
    {
      minX: cards[0].x,
      maxX: cards[0].x,
      minY: cards[0].y,
      maxY: cards[0].y,
    },
  );
}

export function FlowerBoardPreview({
  board,
  invalidCards,
  colorGroups,
}: FlowerBoardPreviewProps) {
  const invalidCardIds = new Set(invalidCards.map((card) => card.id));
  const validColorCardIds = new Set(
    colorGroups.flatMap((group) => group.cards.map((card) => card.id)),
  );
  const bounds = getBoardBounds(board.cards);
  const columns = bounds.maxX - bounds.minX + 1;
  const rows = bounds.maxY - bounds.minY + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plateau Flowers</CardTitle>
        <CardDescription>
          Apercu du moteur de plateau avec adjacence, groupes valides et cartes penalisees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="rounded-full bg-muted px-3 py-1">Rouge: carte invalide</div>
          <div className="rounded-full bg-muted px-3 py-1">Vert: groupe couleur comptabilise</div>
          <div className="rounded-full bg-muted px-3 py-1">Papillon: bonus potentiel</div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid gap-3 rounded-3xl bg-muted/40 p-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(76px, 1fr))`,
              minWidth: `${columns * 88}px`,
            }}
          >
            {Array.from({ length: rows }).flatMap((_, rowIndex) => {
              return Array.from({ length: columns }).map((__, columnIndex) => {
                const x = bounds.minX + columnIndex;
                const y = bounds.minY + rowIndex;
                const card = board.cards.find((item) => item.x === x && item.y === y);

                if (!card) {
                  return (
                    <div
                      key={`empty-${x}-${y}`}
                      className="aspect-square rounded-2xl border border-dashed border-border/60 bg-background/30"
                    />
                  );
                }

                const isInvalid = invalidCardIds.has(card.id);
                const scoresByColor = validColorCardIds.has(card.id);

                return (
                  <div
                    key={card.id}
                    className={cn(
                      "flex aspect-square flex-col justify-between rounded-2xl border p-3 shadow-sm transition-colors",
                      isInvalid && "border-red-300 bg-red-50",
                      !isInvalid && scoresByColor && "border-emerald-300 bg-emerald-50",
                      !isInvalid && !scoresByColor && "border-border bg-card",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="size-4 rounded-full border border-black/10"
                        style={{ backgroundColor: card.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {card.color}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-3xl font-semibold leading-none text-foreground">
                        {card.value}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        x:{card.x} y:{card.y}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {card.hasButterfly ? "Papillon" : "Carte"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1",
                          isInvalid && "bg-red-100 text-red-700",
                          !isInvalid && scoresByColor && "bg-emerald-100 text-emerald-700",
                          !isInvalid && !scoresByColor && "bg-muted text-muted-foreground",
                        )}
                      >
                        {isInvalid ? "Penalty" : scoresByColor ? "Couleur" : "Neutre"}
                      </span>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
