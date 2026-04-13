"use client";

import { flowersScoreFields } from "@/data/flowers-score-fields";
import { calculateFlowersTotal } from "@/lib/flowers-score";
import { cn } from "@/lib/utils";
import type { FlowersScoreField, FlowersScoreFieldKind, FlowersScoreFieldId, FlowersScoreSheet } from "@/types/flowers-score";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FlowersScoreSheetFormProps = {
  value: FlowersScoreSheet;
  onChange: (value: FlowersScoreSheet) => void;
};

const sectionLabels: Record<FlowersScoreFieldKind, string> = {
  color: "Scores par couleur",
  bonus: "Bonus",
  penalty: "Penalites",
};

function getFieldGroups(fields: FlowersScoreField[]) {
  return fields.reduce<Record<FlowersScoreFieldKind, FlowersScoreField[]>>(
    (groups, field) => {
      groups[field.kind].push(field);
      return groups;
    },
    {
      color: [],
      bonus: [],
      penalty: [],
    },
  );
}

function parseNumericValue(rawValue: string, min = 0) {
  if (rawValue.trim() === "") {
    return min;
  }

  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return numericValue < min ? min : numericValue;
}

export function FlowersScoreSheetForm({
  value,
  onChange,
}: FlowersScoreSheetFormProps) {
  const groupedFields = getFieldGroups(flowersScoreFields);
  const totals = calculateFlowersTotal(value);

  function handleFieldChange(fieldId: FlowersScoreFieldId, rawValue: string, min = 0) {
    onChange({
      ...value,
      [fieldId]: parseNumericValue(rawValue, min),
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-background/80">
        <CardTitle className="font-display text-3xl md:text-4xl">Fiche de score Flowers</CardTitle>
        <CardDescription className="max-w-2xl text-base">
          Une feuille de marque numerique simple pour saisir les couleurs, les papillons et les
          cartes non valides.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {(["color", "bonus", "penalty"] as FlowersScoreFieldKind[]).map((kind) => {
          const fields = groupedFields[kind];

          if (fields.length === 0) {
            return null;
          }

          return (
            <section key={kind} className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  {sectionLabels[kind]}
                </h2>
              </div>

              <div className={cn("grid gap-3", kind === "color" ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
                {fields.map((field) => (
                  <label
                    key={field.id}
                    className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-base font-semibold text-foreground">{field.label}</span>
                        {field.description ? (
                          <p className="text-sm leading-5 text-muted-foreground">{field.description}</p>
                        ) : null}
                      </div>
                    </div>

                    <Input
                      className="mt-4"
                      type="number"
                      inputMode="numeric"
                      min={field.min ?? 0}
                      value={value[field.id]}
                      onChange={(event) =>
                        handleFieldChange(field.id, event.target.value, field.min ?? 0)
                      }
                    />
                  </label>
                ))}
              </div>
            </section>
          );
        })}

        <section className="grid gap-3 rounded-3xl bg-secondary/70 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total couleurs</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totals.colorTotal}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Papillons</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">+{totals.butterflyPoints}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cartes non valides</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">-{totals.invalidPenalty}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.24em]">Total final</p>
          <p className="mt-2 text-5xl font-semibold leading-none">{totals.finalTotal}</p>
        </section>
      </CardContent>
    </Card>
  );
}
