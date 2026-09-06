export function findGameInDataFile(bggId: string): {
  title?: string;
  subtitle?: string;
  publishedYear?: number;
  players?: string;
  playTime?: number | string;
  weight?: number;
  imageUrl?: string;
  bggUrl?: string;
} | null;

export function findGameInExtraInfo(bggId: string): {
  title?: string;
  subtitle?: string;
  publishedYear?: number;
  players?: string;
  playTime?: number | string;
  weight?: number;
  imageUrl?: string;
  bggUrl?: string;
} | null;

export function lookupBggServerInfo(bggId: string): Promise<{
  title?: string;
  subtitle?: string;
  publishedYear?: number;
  players?: string;
  playTime?: number | string;
  weight?: number;
  imageUrl?: string;
  bggUrl?: string;
} | null>;