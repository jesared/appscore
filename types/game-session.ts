export type GameSlug = string;

export type GameSessionSummary = {
  id: string;
  name: string;
  gameSlug: GameSlug;
  isActive: boolean;
  isFinished: boolean;
  createdAt: string;
  finishedAt?: string;
  updatedAt: string;
};

export type GameSessionRecord<TData> = GameSessionSummary & {
  data: TData;
};

export type SaveGameSessionInput<TData> = {
  id?: string;
  name: string;
  gameSlug: GameSlug;
  isFinished?: boolean;
  finishedAt?: string;
  data: TData;
};
