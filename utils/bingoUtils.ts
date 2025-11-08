import { BINGO_CARD_SIZE } from '../constants';
import type { BingoCardData, BingoNumber } from '../types';

const generateColumn = (colIndex: number): number[] => {
  const start = colIndex * 15 + 1;
  const end = start + 14;
  const column: number[] = [];
  const source = Array.from({ length: 15 }, (_, i) => start + i);
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    const randomIndex = Math.floor(Math.random() * source.length);
    column.push(source.splice(randomIndex, 1)[0]);
  }
  return column;
};

export const generateBingoCard = (): BingoCardData => {
  const card: BingoCardData = Array(BINGO_CARD_SIZE).fill(null).map(() => Array(BINGO_CARD_SIZE));
  for (let col = 0; col < BINGO_CARD_SIZE; col++) {
    const columnNumbers = generateColumn(col);
    for (let row = 0; row < BINGO_CARD_SIZE; row++) {
      card[row][col] = columnNumbers[row];
    }
  }
  card[2][2] = 'FREE';
  return card;
};

export const checkBingo = (card: BingoCardData, calledNumbers: number[], manuallyMarkedNumbers: number[]): boolean => {
  const allMarkedNumbers = new Set([...calledNumbers, ...manuallyMarkedNumbers]);

  const isMarked = (row: number, col: number) => {
    const cellValue = card[row][col];
    return cellValue === 'FREE' || allMarkedNumbers.has(cellValue as number);
  };

  // Check rows and columns
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    let rowBingo = true;
    let colBingo = true;
    for (let j = 0; j < BINGO_CARD_SIZE; j++) {
      if (!isMarked(i, j)) rowBingo = false;
      if (!isMarked(j, i)) colBingo = false;
    }
    if (rowBingo || colBingo) return true;
  }

  // Check diagonals
  let diag1Bingo = true;
  let diag2Bingo = true;
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    if (!isMarked(i, i)) diag1Bingo = false;
    if (!isMarked(i, BINGO_CARD_SIZE - 1 - i)) diag2Bingo = false;
  }

  return diag1Bingo || diag2Bingo;
};

export const calculateNumbersToBingo = (card: BingoCardData, calledNumbers: number[], manuallyMarkedNumbers: number[]): number => {
  const allMarkedNumbers = new Set([...calledNumbers, ...manuallyMarkedNumbers]);
  let minNumbersNeeded = BINGO_CARD_SIZE;

  const isMarked = (row: number, col: number) => {
    const cellValue = card[row][col];
    return cellValue === 'FREE' || allMarkedNumbers.has(cellValue as number);
  };

  // Check rows and columns
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    let rowNeeded = 0;
    let colNeeded = 0;
    for (let j = 0; j < BINGO_CARD_SIZE; j++) {
      if (!isMarked(i, j)) rowNeeded++;
      if (!isMarked(j, i)) colNeeded++;
    }
    minNumbersNeeded = Math.min(minNumbersNeeded, rowNeeded, colNeeded);
  }

  // Check diagonals
  let diag1Needed = 0;
  let diag2Needed = 0;
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    if (!isMarked(i, i)) diag1Needed++;
    if (!isMarked(i, BINGO_CARD_SIZE - 1 - i)) diag2Needed++;
  }
  minNumbersNeeded = Math.min(minNumbersNeeded, diag1Needed, diag2Needed);

  return minNumbersNeeded;
};