import type { FlowersScoreField } from "@/types/flowers-score";

export const flowersScoreFields: FlowersScoreField[] = [
  {
    id: "yellowScore",
    label: "Jaune",
    kind: "color",
    description: "Score obtenu pour la couleur jaune.",
    accentColor: "#FACC15",
    min: 0,
  },
  {
    id: "blueScore",
    label: "Bleu",
    kind: "color",
    description: "Score obtenu pour la couleur bleue.",
    accentColor: "#60A5FA",
    min: 0,
  },
  {
    id: "orangeScore",
    label: "Orange",
    kind: "color",
    description: "Score obtenu pour la couleur orange.",
    accentColor: "#FB923C",
    min: 0,
  },
  {
    id: "purpleScore",
    label: "Violet",
    kind: "color",
    description: "Score obtenu pour la couleur violette.",
    accentColor: "#A78BFA",
    min: 0,
  },
  {
    id: "butterflyScore",
    label: "Papillons",
    kind: "bonus",
    description: "Bonus papillon.",
    min: 0,
  },
  {
    id: "invalidCards",
    label: "Malus",
    kind: "penalty",
    description: "Nombre de cartes non valides a retirer du total.",
    min: 0,
  },
];
