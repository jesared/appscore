import Link from "next/link";

import { ThemeToggle } from "@/components/app/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRegisteredGames } from "@/lib/games/registry";

const gameStatusLabels: Record<string, string> = {
  flowers: "Pret a jouer",
  skyjo: "Pret a jouer",
};

export default function HomePage() {
  const games = getRegisteredGames();

  return (
    <main className="container py-8 md:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                  Board Score Studio
                </p>
                <CardTitle className="font-display text-4xl md:text-5xl">
                  Choisir un jeu
                </CardTitle>
                <CardDescription className="max-w-2xl text-base">
                  Selectionne une feuille de score selon le jeu. L&apos;architecture
                  est maintenant prete pour faire cohabiter plusieurs fiches sans
                  casser l&apos;existant.
                </CardDescription>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
        </Card>

        <section className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <Card key={game.slug} className="flex h-full flex-col">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    {gameStatusLabels[game.slug] ?? "Disponible"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Slug : `{game.slug}`</p>
                  <p>
                    Route : <span className="font-mono">{`/games/${game.slug}`}</span>
                  </p>
                </div>
                <Link
                  href={`/games/${game.slug}`}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Ouvrir la feuille
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
