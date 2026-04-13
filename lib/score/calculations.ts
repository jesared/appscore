import type { GameTemplate, ScoreOperation } from "@/types/game-template";
import type { ScoreEntry } from "@/types/score-entry";
import type { ScoreField } from "@/types/score-field";

function normalizeScoreValue(field: ScoreField, value: number | undefined) {
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

function applyOperation(total: number, value: number, operation: ScoreOperation) {
  return operation.operator === "subtract" ? total - value : total + value;
}

export function parseScoreValue(rawValue: string, field: ScoreField) {
  if (rawValue.trim() === "") {
    return field.defaultValue;
  }

  const parsedValue = Number(rawValue);
  return normalizeScoreValue(field, parsedValue);
}

export function calculateScoreTotal(gameTemplate: GameTemplate, scoreEntry: ScoreEntry) {
  if (typeof gameTemplate.calculateTotal === "function") {
    return gameTemplate.calculateTotal({ gameTemplate, scoreEntry });
  }

  switch (gameTemplate.calculation.type) {
    case "field-operations":
      return gameTemplate.calculation.operations.reduce((total, operation) => {
        const field = gameTemplate.scoreFields.find((item) => item.id === operation.fieldId);

        if (!field) {
          return total;
        }

        const value = normalizeScoreValue(field, scoreEntry.values[field.id]);
        return applyOperation(total, value, operation);
      }, 0);
  }
}
