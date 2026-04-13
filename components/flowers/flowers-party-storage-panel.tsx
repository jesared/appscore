"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FlowersPartySummary } from "@/types/flowers-party";

type FlowersPartyStoragePanelProps = {
  activePartyId?: string;
  isLoadingParty?: boolean;
  isSavingParty?: boolean;
  partyName: string;
  savedParties: FlowersPartySummary[];
  statusMessage?: string;
  onChangePartyName: (name: string) => void;
  onCreateParty: () => void;
  onLoadParty: (partyId: string) => void;
  onSaveParty: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function FlowersPartyStoragePanel({
  activePartyId,
  isLoadingParty = false,
  isSavingParty = false,
  partyName,
  savedParties,
  statusMessage,
  onChangePartyName,
  onCreateParty,
  onLoadParty,
  onSaveParty,
}: FlowersPartyStoragePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parties sauvegardees</CardTitle>
        <CardDescription>
          Donne un nom a la partie, sauvegarde-la en base, puis recharge-la plus tard.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={partyName}
            onChange={(event) => onChangePartyName(event.target.value)}
            placeholder="Nom de la partie"
            aria-label="Nom de la partie"
          />
          <Button variant="outline" onClick={onCreateParty}>
            Nouvelle partie
          </Button>
          <Button onClick={onSaveParty} disabled={isSavingParty}>
            {isSavingParty ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>

        {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}

        {savedParties.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune partie en base pour le moment.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedParties.map((party) => {
              const isActive = party.id === activePartyId;

              return (
                <button
                  key={party.id}
                  type="button"
                  className="rounded-2xl border border-border bg-card p-4 text-left text-card-foreground transition-colors hover:bg-muted/60"
                  onClick={() => onLoadParty(party.id)}
                  disabled={isLoadingParty}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{party.name}</p>
                      {isActive ? (
                        <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          Active
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {party.playerCount} joueur{party.playerCount > 1 ? "s" : ""} | {party.roundCount} manche{party.roundCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mise a jour {formatDate(party.updatedAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
