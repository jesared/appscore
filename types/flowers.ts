export type FlowerCardValue = 1 | 2 | 3 | 4;

export type FlowerCard = {
  id: string;
  color: string;
  value: FlowerCardValue;
  x: number;
  y: number;
  hasButterfly?: boolean;
};

export type FlowerBoard = {
  cards: FlowerCard[];
};

export type FlowerGroup = {
  id: string;
  cards: FlowerCard[];
};

export type ColorScoreResult = {
  colorGroups: FlowerGroup[];
  colorPoints: number;
};

export type ScoreDetails = {
  colorGroups: FlowerGroup[];
  invalidCards: FlowerCard[];
  colorPoints: number;
  butterflyPoints: number;
  penalty: number;
  total: number;
};
