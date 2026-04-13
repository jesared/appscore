import type { GameTemplate } from "@/types/game-template";
import type { ScoreEntry, ScoreValues } from "@/types/score-entry";
import type { ScoreField } from "@/types/score-field";

function getDefaultValue(field: ScoreField, value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return field.defaultValue;
  }

  if (typeof field.min === "number" && value < field.min) {
    return field.min;
  }

  if (typeof field.max === "number" && value > field.max) {
    return field.max;
  }

  return value;
}

export function createDefaultScoreValues(gameTemplate: GameTemplate) {
  return gameTemplate.scoreFields.reduce<ScoreValues>((values, field) => {
    values[field.id] = field.defaultValue;
    return values;
  }, {});
}

export function createScoreEntry(
  gameTemplate: GameTemplate,
  playerId: string,
  values: Partial<ScoreValues> = {},
): ScoreEntry {
  // Values are stored in a dynamic map keyed by ScoreField ids to keep templates generic.
  const normalizedValues = gameTemplate.scoreFields.reduce<ScoreValues>((result, field) => {
    result[field.id] = getDefaultValue(field, values[field.id]);
    return result;
  }, {});

  return {
    gameId: gameTemplate.id,
    playerId,
    values: normalizedValues,
  };
}
