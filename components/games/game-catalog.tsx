import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameDefinition } from "@/types/game";

type GameCatalogProps = {
  games: GameDefinition[];
};

export function GameCatalog({ games }: GameCatalogProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Catalogue de jeux</CardTitle>
        <CardDescription>
          Les jeux vivent dans `data/games/` et restent decouples de l interface et du stockage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="rounded-2xl border border-border/80 bg-background/80 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{game.name}</h3>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {game.scoreFields.length} champs
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {game.scoreFields.map((field) => (
                <span
                  key={field.id}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {field.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
