
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center h-full animate-slide-in">
      <h1 className="text-5xl md:text-7xl font-bold mb-4">
        Welcome to <span className="text-indigo-600 dark:text-indigo-400">Family Bingo Live</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-12">
        The ultimate real-time multiplayer bingo game. Create a game, share the code, and play with family and friends from anywhere!
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <Button onClick={() => navigate('/host')} className="text-lg animate-pulse-glow">
          Host a Game
        </Button>
        <Button onClick={() => navigate('/join')} variant="secondary" className="text-lg">
          Join a Game
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
