import type { Player } from "@/types/player";
import type {
  FlowersRankingPlayer,
  FlowersRound,
  FlowersRoundScoreSheets,
  FlowersRoundTotal,
  FlowersScoreCalculation,
  FlowersScoreSheet,
  FlowersScoreSheetsByPlayer,
} from "@/types/flowers-score";

export const FLOWERS_MAX_PLAYERS = 4;

export function createEmptyFlowersScoreSheet(): FlowersScoreSheet {
  return {
    blueScore: 0,
    yellowScore: 0,
    redScore: 0,
    greenScore: 0,
    butterflyScore: 0,
    invalidCards: 0,
  };
}

export function calculateFlowersTotal(scoreSheet: FlowersScoreSheet): FlowersScoreCalculation {
  const colorTotal =
    scoreSheet.blueScore +
    scoreSheet.yellowScore +
    scoreSheet.redScore +
    scoreSheet.greenScore;

  const butterflyPoints = scoreSheet.butterflyScore;
  const invalidPenalty = scoreSheet.invalidCards;
  const finalTotal = colorTotal + butterflyPoints - invalidPenalty;

  return {
    colorTotal,
    butterflyPoints,
    invalidPenalty,
    finalTotal,
  };
}

export function calculateFlowersRoundTotals(
  rounds: FlowersRound[],
  roundScoreSheets: FlowersRoundScoreSheets = {},
): FlowersRoundTotal[] {
  return rounds.map((round) => ({
    roundId: round.id,
    roundName: round.name,
    ...calculateFlowersTotal(roundScoreSheets[round.id] ?? createEmptyFlowersScoreSheet()),
  }));
}

export function calculateFlowersCumulativeTotal(
  rounds: FlowersRound[],
  roundScoreSheets: FlowersRoundScoreSheets = {},
): number {
  return calculateFlowersRoundTotals(rounds, roundScoreSheets).reduce(
    (total, round) => total + round.finalTotal,
    0,
  );
}

export function buildFlowersRanking(
  players: Player[],
  rounds: FlowersRound[],
  scoreSheetsByPlayer: FlowersScoreSheetsByPlayer,
): FlowersRankingPlayer[] {
  const ranking = players
    .map((player) => {
      const roundTotals = calculateFlowersRoundTotals(rounds, scoreSheetsByPlayer[player.id]);

      return {
        ...player,
        roundTotals,
        cumulativeTotal: roundTotals.reduce((total, round) => total + round.finalTotal, 0),
      };
    })
    .sort((left, right) => right.cumulativeTotal - left.cumulativeTotal);

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
