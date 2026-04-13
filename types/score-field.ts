export type ScoreFieldType = "number";

export type ScoreField = {
  id: string;
  label: string;
  type: ScoreFieldType;
  defaultValue: number;
  description?: string;
  placeholder?: string;
  section?: string;
  accentColor?: string;
  min?: number;
  max?: number;
};
