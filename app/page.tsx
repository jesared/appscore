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
    <main className="container py-3 sm:py-5 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase text-primary">
                  AppScore
                </p>
                <CardTitle className="font-display text-2xl sm:text-3xl">
                  Choisir un jeu
                </CardTitle>
                <CardDescription className="max-w-2xl">
                  Ouvre une feuille, ajoute les joueurs et saisis les scores.
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
                    <CardDescription className="line-clamp-2">
                      {game.description}
                    </CardDescription>
                  </div>
                  <span className="shrink-0 rounded-xl bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    {gameStatusLabels[game.slug] ?? "Disponible"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link
                  href={`/games/${game.slug}`}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-primary bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Jouer
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
