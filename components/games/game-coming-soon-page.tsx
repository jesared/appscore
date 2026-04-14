import Link from "next/link";

import { ThemeToggle } from "@/components/app/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RegisteredGameDefinition } from "@/types/registered-game";

type GameComingSoonPageProps = {
  game: RegisteredGameDefinition;
};

export function GameComingSoonPage({ game }: GameComingSoonPageProps) {
  return (
    <main className="container py-8 md:py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                  Feuille de score
                </p>
                <CardTitle className="font-display text-4xl md:text-5xl">
                  {game.name}
                </CardTitle>
                <CardDescription className="max-w-2xl text-base">
                  {game.description}
                </CardDescription>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Structure prete</CardTitle>
            <CardDescription>
              Le jeu est deja branche au registre, a l&apos;API generique et a la
              persistance en base. Il ne manque plus que la feuille de score
              dediee.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Slug : `{game.slug}`</p>
            <p>API : `{game.apiBasePath}`</p>
            <p>
              Tu peux maintenant construire la page metier de ce jeu sans
              retoucher l&apos;architecture commune.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Retour au choix des jeux
              </Link>
              <Link
                href="/games/flowers"
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Ouvrir Flowers
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
