import type { FlowersScoreField } from "@/types/flowers-score";

export const flowersScoreFields: FlowersScoreField[] = [
  {
    id: "invalidCards",
    label: "Malus",
    kind: "penalty",
    description: "Nombre de cartes non valides a retirer du total.",
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
    id: "yellowScore",
    label: "Jaune",
    kind: "color",
    description: "Score obtenu pour la couleur jaune.",
    accentColor: "#FACC15",
    min: 0,
  },
  {
    id: "redScore",
    label: "Rouge",
    kind: "color",
    description: "Score obtenu pour la couleur rouge.",
    accentColor: "#F87171",
    min: 0,
  },
  {
    id: "greenScore",
    label: "Vert",
    kind: "color",
    description: "Score obtenu pour la couleur verte.",
    accentColor: "#4ADE80",
    min: 0,
  },
  {
    id: "butterflyScore",
    label: "Papillons",
    kind: "bonus",
    description: "Bonus papillon.",
    min: 0,
  },
];
