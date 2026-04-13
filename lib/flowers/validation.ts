import { findGroupsByValue } from "@/lib/flowers/groups";
import type { FlowerCard } from "@/types/flowers";

export function getInvalidCards(cards: FlowerCard[]) {
  const groups = findGroupsByValue(cards);

  // In Flowers, a card is valid only if its connected group size matches its face value exactly.
  return groups.flatMap((group) => {
    const expectedSize = group.cards[0]?.value;

    if (typeof expectedSize !== "number") {
      return [];
    }

    return group.cards.length === expectedSize ? [] : group.cards;
  });
}
