import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200"
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 dark:text-gray-300 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};


const FAQPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-slide-in">
      <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600 dark:text-indigo-400">Frequently Asked Questions</h1>
      
      <div>
        <FAQItem question="How do I host a game?">
          <p>
            Simply click the "Host a Game" button on the homepage. You will be taken to a new screen where you can create a new game room. A unique 4-character game code will be generated for you to share with your friends and family.
          </p>
        </FAQItem>

        <FAQItem question="How do I join a game?">
          <p>
            Click "Join a Game" from the homepage. You'll need the 4-character game code from the host. Enter the code and your name, and you'll be taken to the game lobby to wait for the game to start.
          </p>
        </FAQItem>

        <FAQItem question="What is a 'Manual Daub'?">
          <p>
            A Manual Daub is a special power move. If you are just one number away from getting a BINGO, you can spend 50 coins to mark that number yourself, without waiting for the host to call it. It's a strategic way to win the game!
          </p>
        </FAQItem>
        
        <FAQItem question="How can I get more cards?">
            <p>
                During a game, you can buy additional cards from the sidebar on the player page. Each new card costs 200 coins. You can have a maximum of 5 cards at one time. More cards increase your chances of matching numbers and winning!
            </p>
        </FAQItem>
        
        <FAQItem question="What happens if I run out of coins?">
            <p>
                If you run out of coins, you won't be able to use the Manual Daub power move or buy new cards. You can still play and earn more coins by matching numbers called by the host. You can also use the "Get Coins" button to add 500 coins to your balance.
            </p>
        </FAQItem>

        <FAQItem question="Do I need an account to play?">
          <p>
            No, you don't need to create an account with a password. The game uses an anonymous sign-in system to give you a unique ID for each game session. Just enter your name and you're ready to play!
          </p>
        </FAQItem>

        <FAQItem question="The game seems stuck or isn't loading. What should I do?">
          <p>
            First, check your internet connection. A stable connection is needed for real-time play. If your connection is fine, try refreshing the page. If you're still having issues, you may need to leave and rejoin the game.
          </p>
        </FAQItem>
      </div>
    </div>
  );
};

export default FAQPage;
