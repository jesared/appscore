import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ShellSection = {
  title: string;
  description: string;
};

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: ShellSection[];
  children: ReactNode;
};

export function AppShell({ eyebrow, title, description, sections, children }: AppShellProps) {
  return (
    <main className="container py-10 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
          <div className="space-y-3">
            <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">{description}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">{children}</section>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Etape actuelle</CardTitle>
            <CardDescription>
              Le socle est pret pour accueillir plusieurs jeux, plusieurs modeles de fiche et une
              future persistance sans lier la logique metier a l interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            La suite naturelle sera d ajouter les routes metier, les composants de formulaire, puis
            un premier flux complet de saisie de scores.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
