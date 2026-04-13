import type { ScoreEntry } from "@/types/score-entry";
import type { ScoreField } from "@/types/score-field";

export type ScoreOperator = "add" | "subtract";

export type ScoreOperation = {
  fieldId: ScoreField["id"];
  operator: ScoreOperator;
};

export type FieldOperationsCalculation = {
  type: "field-operations";
  operations: ScoreOperation[];
};

export type GameCalculationRule = FieldOperationsCalculation;

export type ScoreCalculationContext = {
  gameTemplate: GameTemplate;
  scoreEntry: ScoreEntry;
};

export type ScoreCalculator = (context: ScoreCalculationContext) => number;

export type GameTemplate = {
  id: string;
  name: string;
  description: string;
  totalLabel?: string;
  scoreFields: ScoreField[];
  calculation: GameCalculationRule;
  calculateTotal?: ScoreCalculator;
};
