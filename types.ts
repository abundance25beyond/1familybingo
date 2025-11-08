export type BingoNumber = number | 'FREE';
export type BingoCardData = BingoNumber[][];

export interface BingoCard {
  cardData: BingoCardData;
  manuallyMarkedNumbers: number[];
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  cards: BingoCard[];
  bestNumbersToBingo: number | null;
}

export interface Game {
  id:string;
  hostId: string;
  status: 'waiting' | 'playing' | 'ended';
  players: Player[];
  calledNumbers: number[];
  currentNumber: number | null;
  winner: Player | null;
  createdAt: any; // Firebase Timestamp
}