"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AddPlayerFormProps = {
  onAddPlayer: (name: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
};

export function AddPlayerForm({
  onAddPlayer,
  isDisabled = false,
  placeholder = "Nom du joueur",
}: AddPlayerFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    onAddPlayer(normalizedName);
    setName("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un joueur</CardTitle>
        <CardDescription>
          Ajoute rapidement des participants avant de commencer la saisie des scores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={placeholder}
            aria-label="Nom du joueur"
            disabled={isDisabled}
          />
          <Button type="submit" disabled={isDisabled || name.trim().length === 0}>
            Ajouter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
