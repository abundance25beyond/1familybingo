import React from 'react';
import { BINGO_LETTERS } from '../constants';
import type { BingoCardData, BingoNumber } from '../types';

interface BingoCardProps {
  cardData: BingoCardData;
  calledNumbers: number[];
  manuallyMarkedNumbers: number[];
  currentNumber: number | null;
  onManualMark?: (number: number) => void;
  gameStatus: 'playing' | 'waiting' | 'ended';
}

const BingoCard: React.FC<BingoCardProps> = ({ cardData, calledNumbers, manuallyMarkedNumbers, currentNumber, onManualMark, gameStatus }) => {
  const isCalled = (number: BingoNumber) => {
    if (number === 'FREE') return true;
    return calledNumbers.includes(number as number);
  };

  const isManuallyMarked = (number: BingoNumber) => {
      return manuallyMarkedNumbers.includes(number as number);
  }

  const handleCellClick = (number: BingoNumber) => {
    if (typeof number === 'number' && onManualMark && gameStatus === 'playing' && !isCalled(number) && !isManuallyMarked(number)) {
      onManualMark(number);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg animate-slide-in w-full max-w-md mx-auto flex-shrink-0">
      <div className="grid grid-cols-5 gap-2 text-center">
        {BINGO_LETTERS.map((letter) => (
          <div key={letter} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
            {letter}
          </div>
        ))}
        {cardData.flat().map((number, index) => {
          const called = isCalled(number);
          const manuallyMarked = isManuallyMarked(number);
          const marked = called || manuallyMarked;
          const justCalled = number === currentNumber;
          const isClickable = onManualMark && gameStatus === 'playing' && !marked && typeof number === 'number';

          return (
            <div
              key={index}
              onClick={() => handleCellClick(number)}
              className={`aspect-square flex items-center justify-center text-xl md:text-2xl font-bold rounded-full transition-all duration-300 relative
              ${marked ? 'text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
              ${isClickable ? 'cursor-pointer hover:ring-2 ring-amber-400' : ''}`}
            >
              {marked && (
                <div className={`absolute inset-0 rounded-full scale-105 transition-transform transform-gpu ${called ? 'bg-indigo-500' : 'bg-pink-600'}`}></div>
              )}
              {justCalled && marked && (
                <div className="absolute inset-0 rounded-full animate-ping-glow"></div>
              )}
              <span className="relative z-10">{number}</span>
              {manuallyMarked && !called && (
                <span className="absolute z-20 bottom-0 right-0 text-amber-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BingoCard;