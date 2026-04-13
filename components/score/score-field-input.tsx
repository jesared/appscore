"use client";

import { Input } from "@/components/ui/input";
import { parseScoreValue } from "@/lib/score/calculations";
import type { ScoreField } from "@/types/score-field";

type ScoreFieldInputProps = {
  field: ScoreField;
  value: number;
  onChange: (value: number) => void;
  isDisabled?: boolean;
};

export function ScoreFieldInput({
  field,
  value,
  onChange,
  isDisabled = false,
}: ScoreFieldInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{field.label}</span>
        <span className="text-xs text-muted-foreground">Type: {field.type}</span>
      </div>

      {field.description ? (
        <span className="text-xs leading-5 text-muted-foreground">{field.description}</span>
      ) : null}

      <Input
        type="number"
        inputMode="numeric"
        value={value}
        min={field.min}
        max={field.max}
        onChange={(event) => onChange(parseScoreValue(event.target.value, field))}
        disabled={isDisabled}
      />

      {(typeof field.min === "number" || typeof field.max === "number") && (
        <span className="text-xs text-muted-foreground">
          {typeof field.min === "number" ? `Min ${field.min}` : "Libre"}
          {typeof field.min === "number" && typeof field.max === "number" ? " / " : ""}
          {typeof field.max === "number" ? `Max ${field.max}` : ""}
        </span>
      )}
    </label>
  );
}
