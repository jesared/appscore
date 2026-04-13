"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FlowersPartySummary } from "@/types/flowers-party";

type FlowersPartyStoragePanelProps = {
  activePartyId?: string;
  isLoadingParty?: boolean;
  isSavingParty?: boolean;
  isMutatingParty?: boolean;
  partyName: string;
  savedParties: FlowersPartySummary[];
  statusMessage?: string;
  onChangePartyName: (name: string) => void;
  onCreateParty: () => void;
  onDeleteParty: (partyId: string) => void;
  onLoadParty: (partyId: string) => void;
  onRenameParty: (partyId: string, name: string) => void;
  onSaveParty: () => void;
  onTogglePartyActive: (partyId: string, isActive: boolean) => void;
};

type PartyCardProps = {
  activePartyId?: string;
  isBusy: boolean;
  party: FlowersPartySummary;
  onDeleteParty: (partyId: string) => void;
  onLoadParty: (partyId: string) => void;
  onRenameParty: (partyId: string, name: string) => void;
  onTogglePartyActive: (partyId: string, isActive: boolean) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function PartyBadge({
  children,
  tone = "muted",
}: {
  children: string;
  tone?: "muted" | "primary";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tone === "primary"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      {children}
    </span>
  );
}

function PartiesSection({
  activePartyId,
  isBusy,
  title,
  description,
  parties,
  emptyMessage,
  onDeleteParty,
  onLoadParty,
  onRenameParty,
  onTogglePartyActive,
}: {
  activePartyId?: string;
  isBusy: boolean;
  title: string;
  description: string;
  parties: FlowersPartySummary[];
  emptyMessage: string;
  onDeleteParty: (partyId: string) => void;
  onLoadParty: (partyId: string) => void;
  onRenameParty: (partyId: string, name: string) => void;
  onTogglePartyActive: (partyId: string, isActive: boolean) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <PartyBadge>{String(parties.length)}</PartyBadge>
      </div>

      {parties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              activePartyId={activePartyId}
              isBusy={isBusy}
              party={party}
              onDeleteParty={onDeleteParty}
              onLoadParty={onLoadParty}
              onRenameParty={onRenameParty}
              onTogglePartyActive={onTogglePartyActive}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PartyCard({
  activePartyId,
  isBusy,
  party,
  onDeleteParty,
  onLoadParty,
  onRenameParty,
  onTogglePartyActive,
}: PartyCardProps) {
  const [draftName, setDraftName] = useState(party.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isCurrentParty = party.id === activePartyId;
  const isRenameDisabled = isBusy || draftName.trim().length === 0;

  useEffect(() => {
    setDraftName(party.name);
    setIsEditingName(false);
  }, [party.name]);

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-4 text-card-foreground",
        isCurrentParty && "border-primary/40 bg-primary/5",
        !party.isActive && "bg-muted/30",
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {isEditingName ? (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (draftName.trim().length === 0) {
                    return;
                  }

                  onRenameParty(party.id, draftName);
                }}
              >
                <Input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  aria-label={`Nom de la partie ${party.name}`}
                  disabled={isBusy}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={isRenameDisabled}
                  >
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isBusy}
                    onClick={() => {
                      setDraftName(party.name);
                      setIsEditingName(false);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="truncate text-base font-semibold text-foreground">
                  {party.name}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {isCurrentParty ? <PartyBadge tone="primary">Ouverte</PartyBadge> : null}
                  {!party.isActive ? <PartyBadge>Desactivee</PartyBadge> : null}
                </div>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => onLoadParty(party.id)}
            disabled={isBusy || isCurrentParty}
          >
            {isCurrentParty ? "Ouverte" : "Charger"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-background p-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Joueurs
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {party.playerCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Manches
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {party.roundCount}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Derniere mise a jour
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(party.updatedAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setIsConfirmingDelete(false);
              setIsEditingName(true);
            }}
            disabled={isBusy}
          >
            Renommer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onTogglePartyActive(party.id, !party.isActive)}
            disabled={isBusy}
          >
            {party.isActive ? "Desactiver" : "Reactiver"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => {
              setIsEditingName(false);
              setIsConfirmingDelete(true);
            }}
            disabled={isBusy}
          >
            Supprimer
          </Button>
        </div>

        {isConfirmingDelete ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-foreground">
              Supprimer definitivement cette partie ?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              "{party.name}" sera retiree de la base et ne pourra pas etre restauree.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={isBusy}
                onClick={() => onDeleteParty(party.id)}
              >
                Confirmer la suppression
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isBusy}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FlowersPartyStoragePanel({
  activePartyId,
  isLoadingParty = false,
  isSavingParty = false,
  isMutatingParty = false,
  partyName,
  savedParties,
  statusMessage,
  onChangePartyName,
  onCreateParty,
  onDeleteParty,
  onLoadParty,
  onRenameParty,
  onSaveParty,
  onTogglePartyActive,
}: FlowersPartyStoragePanelProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const isBusy = isLoadingParty || isSavingParty || isMutatingParty;
  const activeParties = savedParties.filter((party) => party.isActive);
  const inactiveParties = savedParties.filter((party) => !party.isActive);
  const currentParty = savedParties.find((party) => party.id === activePartyId);

  useEffect(() => {
    setIsLibraryOpen(!currentParty);
  }, [currentParty?.id]);

  return (
    <Card>
      <CardHeader className="space-y-4 border-b border-border/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <CardTitle>Gestion des parties</CardTitle>
            <CardDescription>
              Nomme la partie en cours, sauvegarde-la, puis retrouve facilement
              les parties actives et archivees.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <PartyBadge tone="primary">{`${activeParties.length} actives`}</PartyBadge>
            <PartyBadge>{`${inactiveParties.length} archivees`}</PartyBadge>
            {currentParty && isLibraryOpen ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLibraryOpen(false)}
                disabled={isBusy}
              >
                Masquer
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <section className="space-y-4 rounded-3xl border border-border bg-background p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {currentParty ? <PartyBadge tone="primary">Partie ouverte</PartyBadge> : null}
                  {currentParty && !currentParty.isActive ? <PartyBadge>Desactivee</PartyBadge> : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Partie en cours</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {currentParty
                      ? "La partie est ouverte. Tu peux sauvegarder vite et n'ouvrir la bibliotheque qu'au besoin."
                      : "Donne un nom a la partie puis enregistre-la pour la retrouver plus tard."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <Input
                  value={partyName}
                  onChange={(event) => onChangePartyName(event.target.value)}
                  placeholder="Nom de la partie"
                  aria-label="Nom de la partie"
                />
                <Button onClick={onSaveParty} disabled={isBusy}>
                  {isSavingParty ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsLibraryOpen((current) => !current)}
                  disabled={isBusy}
                >
                  {isLibraryOpen ? "Masquer la bibliotheque" : "Afficher la bibliotheque"}
                </Button>
              </div>

              {currentParty ? (
                <div className="grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Partie
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{currentParty.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Joueurs / manches
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {currentParty.playerCount} / {currentParty.roundCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mise a jour
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(currentParty.updatedAt)}
                    </p>
                  </div>
                </div>
              ) : null}

              {statusMessage ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                  {statusMessage}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:w-52 xl:grid-cols-1">
              <Button variant="outline" onClick={onCreateParty} disabled={isBusy}>
                Nouvelle partie
              </Button>
            </div>
          </div>
        </section>

        {isLibraryOpen ? (
          <div className="space-y-6">
            <PartiesSection
              activePartyId={activePartyId}
              isBusy={isBusy}
              title="Parties actives"
              description="Les parties que tu peux rouvrir et continuer normalement."
              parties={activeParties}
              emptyMessage="Aucune partie active pour le moment."
              onDeleteParty={onDeleteParty}
              onLoadParty={onLoadParty}
              onRenameParty={onRenameParty}
              onTogglePartyActive={onTogglePartyActive}
            />

            <PartiesSection
              activePartyId={activePartyId}
              isBusy={isBusy}
              title="Parties archivees"
              description="Les parties mises de cote, conservees en base mais sorties du flux principal."
              parties={inactiveParties}
              emptyMessage="Aucune partie archivee pour le moment."
              onDeleteParty={onDeleteParty}
              onLoadParty={onLoadParty}
              onRenameParty={onRenameParty}
              onTogglePartyActive={onTogglePartyActive}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
