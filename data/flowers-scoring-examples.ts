import type { FlowerBoard, FlowerCard, FlowerCardValue } from "@/types/flowers";

function createCard(
  id: string,
  color: string,
  value: FlowerCardValue,
  x: number,
  y: number,
  hasButterfly = false,
): FlowerCard {
  return {
    id,
    color,
    value,
    x,
    y,
    hasButterfly,
  };
}

export type FlowerScoringExample = {
  id: string;
  title: string;
  board: FlowerBoard;
};

export const flowerScoringExamples: FlowerScoringExample[] = [
  {
    id: "valid-value-group-2",
    title: 'Groupe valide de 2 cartes "2"',
    board: {
      cards: [
        createCard("a1", "red", 2, 0, 0),
        createCard("a2", "red", 2, 1, 0),
      ],
    },
  },
  {
    id: "invalid-value-group-3-for-2",
    title: 'Groupe invalide de 3 cartes "2"',
    board: {
      cards: [
        createCard("b1", "orange", 2, 0, 0),
        createCard("b2", "orange", 2, 1, 0),
        createCard("b3", "orange", 2, 2, 0),
      ],
    },
  },
  {
    id: "valid-color-group-5",
    title: "Groupe couleur de 5 cartes valide",
    board: {
      cards: [
        createCard("c1", "blue", 2, 0, 0),
        createCard("c2", "blue", 2, 1, 0),
        createCard("c3", "blue", 3, 1, 1),
        createCard("c4", "blue", 3, 2, 1),
        createCard("c5", "blue", 3, 1, 2),
      ],
    },
  },
  {
    id: "color-group-4-not-valid",
    title: "Groupe couleur de 4 cartes non valide",
    board: {
      cards: [
        createCard("d1", "pink", 2, 0, 0),
        createCard("d2", "pink", 2, 1, 0),
        createCard("d3", "pink", 1, 2, 0),
        createCard("d4", "pink", 1, 1, 1),
      ],
    },
  },
  {
    id: "with-butterflies",
    title: "Cas avec papillons",
    board: {
      cards: [
        createCard("e1", "purple", 2, 0, 0, true),
        createCard("e2", "purple", 2, 1, 0),
        createCard("e3", "purple", 3, 1, 1, true),
        createCard("e4", "purple", 3, 2, 1),
        createCard("e5", "purple", 3, 1, 2),
        createCard("e6", "yellow", 1, 4, 4, true),
      ],
    },
  },
  {
    id: "with-penalty",
    title: "Cas avec penalite",
    board: {
      cards: [
        createCard("f1", "green", 2, 0, 0),
        createCard("f2", "green", 2, 1, 0),
        createCard("f3", "green", 2, 2, 0),
        createCard("f4", "green", 1, 1, 1),
      ],
    },
  },
];
