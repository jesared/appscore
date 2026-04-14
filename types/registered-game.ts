import type { GameSlug } from "@/types/game-session";

export type RegisteredGameAdapter<
  TSummary = unknown,
  TSnapshot = unknown,
  TSaveInput = unknown,
> = {
  deleteSession(id: string): Promise<boolean>;
  getSessionById(id: string): Promise<TSnapshot | null>;
  listSessions(): Promise<TSummary[]>;
  renameSession(id: string, name: string): Promise<TSummary | null>;
  saveSession(input: TSaveInput): Promise<TSnapshot>;
  setSessionActive(
    id: string,
    isActive: boolean,
  ): Promise<TSummary | null>;
};

export type RegisteredGameDefinition<
  TSummary = unknown,
  TSnapshot = unknown,
  TSaveInput = unknown,
> = {
  adapter: RegisteredGameAdapter<TSummary, TSnapshot, TSaveInput>;
  apiBasePath: string;
  description: string;
  maxPlayers?: number;
  name: string;
  sessionLabel: string;
  sessionLabelPlural: string;
  slug: GameSlug;
};
