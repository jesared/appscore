import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const scoreSheetLayers = [
  {
    title: "types/",
    description: "Contrats partages entre les donnees, la logique de calcul et les composants.",
  },
  {
    title: "lib/score/",
    description: "Fonctions pures pour initialiser une fiche, parser les valeurs et classer.",
  },
  {
    title: "components/score/",
    description: "Composants presentionnels futurs pour les joueurs, champs et resultats.",
  },
];

export function ScoreSheetPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Zone fiche de score</CardTitle>
        <CardDescription>
          Placeholder volontaire pour reserver la place a la future experience de saisie.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scoreSheetLayers.map((layer) => (
          <div key={layer.title} className="rounded-2xl border border-dashed border-border p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {layer.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{layer.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
