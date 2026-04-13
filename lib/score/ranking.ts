import { calculateScoreTotal } from "@/lib/score/calculations";
import { createScoreEntry } from "@/lib/score/entries";
import type { GameTemplate } from "@/types/game-template";
import type { Player } from "@/types/player";
import type { RankingPlayer } from "@/types/ranking-player";
import type { ScoreEntry } from "@/types/score-entry";

export function buildRanking(
  players: Player[],
  scoreEntries: ScoreEntry[],
  gameTemplate: GameTemplate,
): RankingPlayer[] {
  const scoreEntriesByPlayerId = new Map(
    scoreEntries
      .filter((entry) => entry.gameId === gameTemplate.id)
      .map((entry) => [entry.playerId, entry] as const),
  );

  const sortedPlayers = [...players]
    .map((player) => {
      const scoreEntry =
        scoreEntriesByPlayerId.get(player.id) ?? createScoreEntry(gameTemplate, player.id);

      return {
        ...player,
        scoreEntry,
        total: calculateScoreTotal(gameTemplate, scoreEntry),
      };
    })
    .sort((left, right) => {
      if (right.total !== left.total) {
        return right.total - left.total;
      }

      return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
    });

  let previousTotal: number | null = null;
  let previousRank = 0;

  return sortedPlayers.map((player, index) => {
    const rank = player.total === previousTotal ? previousRank : index + 1;

    previousTotal = player.total;
    previousRank = rank;

    return {
      id: player.id,
      name: player.name,
      total: player.total,
      scoreEntry: player.scoreEntry,
      rank,
    };
  });
}
