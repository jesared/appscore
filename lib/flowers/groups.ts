import type { FlowerCard, FlowerGroup } from "@/types/flowers";

function areCardsAdjacent(left: FlowerCard, right: FlowerCard) {
  const distanceX = Math.abs(left.x - right.x);
  const distanceY = Math.abs(left.y - right.y);

  return distanceX + distanceY === 1;
}

function buildGroupId(cards: FlowerCard[], prefix: string) {
  const sortedCardIds = [...cards].map((card) => card.id).sort();
  return `${prefix}-${sortedCardIds.join("-")}`;
}

function findGroups(
  cards: FlowerCard[],
  belongsToSameGroup: (left: FlowerCard, right: FlowerCard) => boolean,
  groupPrefix: string,
) {
  const visitedCardIds = new Set<string>();
  const groups: FlowerGroup[] = [];

  for (const card of cards) {
    if (visitedCardIds.has(card.id)) {
      continue;
    }

    // BFS lets us walk one connected component at a time without duplicating cards.
    const queue: FlowerCard[] = [card];
    const groupCards: FlowerCard[] = [];
    visitedCardIds.add(card.id);

    while (queue.length > 0) {
      const currentCard = queue.shift();

      if (!currentCard) {
        continue;
      }

      groupCards.push(currentCard);

      for (const candidate of cards) {
        if (visitedCardIds.has(candidate.id)) {
          continue;
        }

        if (!areCardsAdjacent(currentCard, candidate)) {
          continue;
        }

        if (!belongsToSameGroup(currentCard, candidate)) {
          continue;
        }

        visitedCardIds.add(candidate.id);
        queue.push(candidate);
      }
    }

    groups.push({
      id: buildGroupId(groupCards, groupPrefix),
      cards: groupCards,
    });
  }

  return groups;
}

export function getAdjacentCards(card: FlowerCard, allCards: FlowerCard[]) {
  return allCards.filter((candidate) => {
    if (candidate.id === card.id) {
      return false;
    }

    return areCardsAdjacent(card, candidate);
  });
}

export function findGroupsByValue(cards: FlowerCard[]) {
  return findGroups(cards, (left, right) => left.value === right.value, "value");
}

export function findGroupsByColor(cards: FlowerCard[]) {
  return findGroups(cards, (left, right) => left.color === right.color, "color");
}
