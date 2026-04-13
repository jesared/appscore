export type { GameCalculationRule, GameTemplate, ScoreCalculationContext, ScoreCalculator, ScoreOperation, ScoreOperator } from "@/types/game-template";
export type { ScoreField, ScoreFieldType } from "@/types/score-field";

export type ScoreFieldValue = number;
export type GameDefinition = import("@/types/game-template").GameTemplate;
export type GameScoreField = import("@/types/score-field").ScoreField;
