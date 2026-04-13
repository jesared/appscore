import type { GameTemplate } from "@/types/game-template";
import type { ScoreField } from "@/types/score-field";

const flowersColorFields: ScoreField[] = [
  {
    id: "blueScore",
    label: "Bleu",
    type: "number",
    defaultValue: 0,
    min: 0,
    section: "colors",
    description: "Points gagnes par les fleurs bleues.",
    accentColor: "#60A5FA",
  },
  {
    id: "yellowScore",
    label: "Jaune",
    type: "number",
    defaultValue: 0,
    min: 0,
    section: "colors",
    description: "Points gagnes par les fleurs jaunes.",
    accentColor: "#FACC15",
  },
  {
    id: "redScore",
    label: "Rouge",
    type: "number",
    defaultValue: 0,
    min: 0,
    section: "colors",
    description: "Points gagnes par les fleurs rouges.",
    accentColor: "#F87171",
  },
  {
    id: "greenScore",
    label: "Vert",
    type: "number",
    defaultValue: 0,
    min: 0,
    section: "colors",
    description: "Points gagnes par les fleurs vertes.",
    accentColor: "#4ADE80",
  },
];

const flowersBonusAndPenaltyFields: ScoreField[] = [
  {
    id: "butterflies",
    label: "Papillons",
    type: "number",
    defaultValue: 0,
    min: 0,
    section: "bonus",
    description: "Nombre de bonus papillon a ajouter au total.",
  },
  {
    id: "invalidCards",
    label: "Cartes non valides",
    type: "number",
    defaultValue: 0,
    min: 0,
    section: "penalty",
    description: "Nombre de cartes non valides a retirer du total final.",
  },
];

export const flowersGame: GameTemplate = {
  id: "flowers",
  name: "Flowers",
  description:
    "Fiche de score numerique simple pour saisir les points de couleur, les papillons et les cartes non valides.",
  totalLabel: "Total final",
  scoreFields: [...flowersColorFields, ...flowersBonusAndPenaltyFields],
  calculation: {
    type: "field-operations",
    operations: [
      ...flowersColorFields.map((field) => ({ fieldId: field.id, operator: "add" as const })),
      { fieldId: "butterflies", operator: "add" },
      { fieldId: "invalidCards", operator: "subtract" },
    ],
  },
};
