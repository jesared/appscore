import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FlowersGamePage } from "@/components/flowers/flowers-game-page";
import { GameComingSoonPage } from "@/components/games/game-coming-soon-page";
import { SkyjoGamePage } from "@/components/skyjo/skyjo-game-page";
import { getRegisteredGame, getRegisteredGames } from "@/lib/games/registry";

type GamePageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};

export function generateStaticParams() {
  return getRegisteredGames().map((game) => ({
    gameSlug: game.slug,
  }));
}

export async function generateMetadata(
  props: GamePageProps,
): Promise<Metadata> {
  const { gameSlug } = await props.params;
  const game = getRegisteredGame(gameSlug);

  if (!game) {
    return {
      title: "Jeu introuvable | AppScore",
    };
  }

  return {
    title: `${game.name} | AppScore`,
    description: game.description,
  };
}

export default async function GamePage(props: GamePageProps) {
  const { gameSlug } = await props.params;
  const game = getRegisteredGame(gameSlug);

  if (!game) {
    notFound();
  }

  if (game.slug === "flowers") {
    return <FlowersGamePage />;
  }

  if (game.slug === "skyjo") {
    return <SkyjoGamePage />;
  }

  return <GameComingSoonPage game={game} />;
}
