import { flowersGameDefinition } from "@/games/flowers";
import { skyjoGameDefinition } from "@/games/skyjo";

const registeredGamesBySlug = {
  flowers: flowersGameDefinition,
  skyjo: skyjoGameDefinition,
} as const;

type RegisteredGamesBySlug = typeof registeredGamesBySlug;
type RegisteredGameSlug = keyof RegisteredGamesBySlug;

export const registeredGames = Object.values(registeredGamesBySlug);

export function getRegisteredGames() {
  return registeredGames;
}

export function getRegisteredGame<TSlug extends RegisteredGameSlug>(
  slug: TSlug,
): RegisteredGamesBySlug[TSlug];
export function getRegisteredGame(
  slug: string,
): RegisteredGamesBySlug[RegisteredGameSlug] | undefined;
export function getRegisteredGame(slug: string) {
  return registeredGamesBySlug[slug as RegisteredGameSlug];
}

export function getRequiredGame<TSlug extends RegisteredGameSlug>(
  slug: TSlug,
): RegisteredGamesBySlug[TSlug];
export function getRequiredGame(
  slug: string,
): RegisteredGamesBySlug[RegisteredGameSlug];
export function getRequiredGame(slug: string) {
  const game = getRegisteredGame(slug);

  if (!game) {
    throw new Error(`Jeu non enregistre: ${slug}`);
  }

  return game;
}
