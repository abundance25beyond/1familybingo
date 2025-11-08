import React from 'react';
import { BINGO_LETTERS, BUY_CARD_COST, COIN_AWARD_MATCH, INITIAL_COINS, MAX_CARDS, POWER_MOVE_MANUAL_DAUB_COST } from '../constants';

const RulesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-slide-in">
      <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600 dark:text-indigo-400">Game Rules</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold border-b-2 border-indigo-500 pb-2 mb-4">The Basics</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Family Bingo Live is a multiplayer bingo game. The goal is to be the first to get a "BINGO" by marking five numbers in a row on your card—horizontally, vertically, or diagonally.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold border-b-2 border-indigo-500 pb-2 mb-4">How to Play</h2>
          <ol className="list-decimal list-inside space-y-3 text-lg text-gray-700 dark:text-gray-300">
            <li><strong>Join a Game:</strong> Get a 4-character game code from the host and enter it along with your name.</li>
            <li><strong>Your Card:</strong> You'll start with one bingo card. The center square, "FREE", is already marked for you.</li>
            <li><strong>Marking Numbers:</strong> As the host calls numbers, they will be automatically marked on your card if they match.</li>
            <li><strong>Winning:</strong> The first player to complete a line of five marked squares and call BINGO wins the game!</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold border-b-2 border-indigo-500 pb-2 mb-4">Coin Economy & Strategy</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            This isn't just a game of chance! Use coins to gain a strategic advantage.
          </p>
          <ul className="space-y-4">
            <li className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-amber-500">Earning Coins</h3>
              <p>You start with <strong>{INITIAL_COINS} coins</strong>. For every number called that matches a square on any of your cards, you earn <strong>{COIN_AWARD_MATCH} coins</strong>.</p>
            </li>
            <li className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-teal-500">Buying More Cards</h3>
              <p>Increase your chances of winning by playing with multiple cards! You can buy a new card for <strong>{BUY_CARD_COST} coins</strong>. You can have up to <strong>{MAX_CARDS} cards</strong> at once.</p>
            </li>
            <li className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-pink-500">Power Move: Manual Daub</h3>
              <p>Are you just one number away from a BINGO? Don't wait for the host! Use a Manual Daub to mark any uncalled number on your card for <strong>{POWER_MOVE_MANUAL_DAUB_COST} coins</strong> and claim your victory.</p>
            </li>
             <li className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-indigo-500">Get More Coins</h3>
              <p>Running low? Use the "Get Coins" button on the player page to instantly add more coins to your balance.</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default RulesPage;
