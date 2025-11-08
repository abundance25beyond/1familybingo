import React from 'react';

interface CalledNumbersDisplayProps {
  currentNumber: number | null;
  calledNumbers: number[];
}

const numberGradients = [
  'from-pink-500 to-orange-400',
  'from-green-400 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-yellow-400 to-red-500',
  'from-teal-400 to-cyan-500',
];

const getGradientForNumber = (num: number) => {
    return numberGradients[num % numberGradients.length];
}

const CalledNumbersDisplay: React.FC<CalledNumbersDisplayProps> = ({ currentNumber, calledNumbers }) => {
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">CURRENT NUMBER</h3>
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-indigo-600" style={{ clipPath: 'polygon(50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)' }}></div>
          <span key={currentNumber} className={`relative text-7xl md:text-8xl font-bold text-white transition-opacity duration-300 ${currentNumber ? 'animate-number-pop' : ''}`}>
            {currentNumber || '-'}
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-500 dark:text-gray-400">CALLED NUMBERS</h3>
        <div className="grid grid-cols-10 md:grid-cols-15 gap-1 max-w-lg mx-auto">
          {allNumbers.map(num => {
            const isCalled = calledNumbers.includes(num);
            return (
              <div
                key={num}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
                ${isCalled ? `bg-gradient-to-br ${getGradientForNumber(num)} text-white` : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                {num}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default CalledNumbersDisplay;