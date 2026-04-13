import { findGroupsByColor } from "@/lib/flowers/groups";
import { getInvalidCards } from "@/lib/flowers/validation";
import type { ColorScoreResult, FlowerCard } from "@/types/flowers";

export function getColorScore(cards: FlowerCard[]): ColorScoreResult {
  const invalidCardIds = new Set(getInvalidCards(cards).map((card) => card.id));
  const validCards = cards.filter((card) => !invalidCardIds.has(card.id));

  const colorGroups = findGroupsByColor(validCards).filter((group) => group.cards.length >= 5);
  const colorPoints = colorGroups.reduce((total, group) => total + group.cards.length, 0);

  return {
    colorGroups,
    colorPoints,
  };
}
