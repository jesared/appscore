import { getButterflyScore } from "@/lib/flowers/butterfly-score";
import { getColorScore } from "@/lib/flowers/color-score";
import { getInvalidCards } from "@/lib/flowers/validation";
import type { FlowerBoard, ScoreDetails } from "@/types/flowers";

export function calculateFlowerScore(board: FlowerBoard): ScoreDetails {
  const invalidCards = getInvalidCards(board.cards);
  const penalty = invalidCards.length;
  const { colorGroups, colorPoints } = getColorScore(board.cards);
  const butterflyPoints = getButterflyScore(board.cards);
  const total = colorPoints + butterflyPoints - penalty;

  return {
    colorGroups,
    invalidCards,
    colorPoints,
    butterflyPoints,
    penalty,
    total,
  };
}
