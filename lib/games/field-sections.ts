import type { ScoreField } from "@/types/score-field";

export type ScoreFieldSection = {
  id: string;
  label: string;
  fields: ScoreField[];
};

function getSectionLabel(sectionId: string) {
  switch (sectionId) {
    case "colors":
      return "Scores par couleur";
    case "bonus":
      return "Bonus";
    case "penalty":
      return "Penalites";
    default:
      return "Autres champs";
  }
}

export function getScoreFieldSections(scoreFields: ScoreField[]): ScoreFieldSection[] {
  const sectionsById = new Map<string, ScoreField[]>();

  for (const field of scoreFields) {
    const sectionId = field.section ?? "misc";
    const currentFields = sectionsById.get(sectionId) ?? [];
    currentFields.push(field);
    sectionsById.set(sectionId, currentFields);
  }

  return [...sectionsById.entries()].map(([id, fields]) => ({
    id,
    label: getSectionLabel(id),
    fields,
  }));
}
