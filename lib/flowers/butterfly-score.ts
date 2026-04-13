import { getAdjacentCards } from "@/lib/flowers/groups";
import type { FlowerCard } from "@/types/flowers";

export function getButterflyScore(cards: FlowerCard[]) {
  return cards.reduce((total, card) => {
    if (!card.hasButterfly) {
      return total;
    }

    const hasMatchingAdjacentCard = getAdjacentCards(card, cards).some((adjacentCard) => {
      return adjacentCard.color === card.color;
    });

    return hasMatchingAdjacentCard ? total + 1 : total;
  }, 0);
}
