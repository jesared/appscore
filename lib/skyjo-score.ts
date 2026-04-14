import type { Player } from "@/types/player";
import type {
  SkyjoRankingPlayer,
  SkyjoRound,
  SkyjoRoundScoreSheets,
  SkyjoRoundTotal,
  SkyjoScoreSheet,
  SkyjoScoreSheetsByPlayer,
} from "@/types/skyjo-score";

export const SKYJO_MAX_PLAYERS = 8;

export function createEmptySkyjoScoreSheet(): SkyjoScoreSheet {
  return {
    points: 0,
  };
}

export function calculateSkyjoRoundTotal(scoreSheet: SkyjoScoreSheet): number {
  return scoreSheet.points;
}

export function calculateSkyjoRoundTotals(
  rounds: SkyjoRound[],
  roundScoreSheets: SkyjoRoundScoreSheets = {},
): SkyjoRoundTotal[] {
  return rounds.map((round) => ({
    roundId: round.id,
    roundName: round.name,
    points: calculateSkyjoRoundTotal(
      roundScoreSheets[round.id] ?? createEmptySkyjoScoreSheet(),
    ),
  }));
}

export function calculateSkyjoCumulativeTotal(
  rounds: SkyjoRound[],
  roundScoreSheets: SkyjoRoundScoreSheets = {},
) {
  return calculateSkyjoRoundTotals(rounds, roundScoreSheets).reduce(
    (total, round) => total + round.points,
    0,
  );
}

export function buildSkyjoRanking(
  players: Player[],
  rounds: SkyjoRound[],
  scoreSheetsByPlayer: SkyjoScoreSheetsByPlayer,
): SkyjoRankingPlayer[] {
  const ranking = players
    .map((player) => {
      const roundTotals = calculateSkyjoRoundTotals(
        rounds,
        scoreSheetsByPlayer[player.id],
      );

      return {
        ...player,
        roundTotals,
        cumulativeTotal: roundTotals.reduce(
          (total, round) => total + round.points,
          0,
        ),
      };
    })
    .sort((left, right) => left.cumulativeTotal - right.cumulativeTotal);

  let previousTotal: number | null = null;
  let previousRank = 0;

  return ranking.map((player, index) => {
    const rank =
      previousTotal !== null && player.cumulativeTotal === previousTotal
        ? previousRank
        : index + 1;

    previousTotal = player.cumulativeTotal;
    previousRank = rank;

    return {
      ...player,
      rank,
    };
  });
}
