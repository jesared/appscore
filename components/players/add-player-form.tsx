"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AddPlayerFormProps = {
  onAddPlayer: (name: string) => void;
  description?: string;
  isDisabled?: boolean;
  placeholder?: string;
};

export function AddPlayerForm({
  onAddPlayer,
  description = "Ajoute rapidement des participants avant de commencer la saisie des scores.",
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
      <CardHeader className="pb-3">
        <CardTitle>Ajouter un joueur</CardTitle>
        <CardDescription className="hidden sm:block">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={placeholder}
            aria-label="Nom du joueur"
            disabled={isDisabled}
          />
          <Button
            type="submit"
            className="sm:w-auto"
            disabled={isDisabled || name.trim().length === 0}
          >
            Ajouter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
