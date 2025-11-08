
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGame } from '../services/gameService';
import Button from '../components/Button';
import Input from '../components/Input';

const JoinPage: React.FC = () => {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || !playerName.trim()) {
      setError('Please enter a game code and your name.');
      return;
    }
    setLoading(true);
    setError('');

    const trimmedGameCode = gameCode.trim();
    const trimmedPlayerName = playerName.trim();

    try {
      const success = await joinGame(trimmedGameCode, trimmedPlayerName);

      if (success) {
        // The gameCode is already uppercased via the input's onChange handler.
        localStorage.setItem(`bingo_name_${trimmedGameCode}`, trimmedPlayerName);
        navigate(`/player/${trimmedGameCode}`);
      } else {
        setError('Invalid game code or game has already started.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to join game:", err);
      setError('Could not join the game. Please check your connection and the game code.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center animate-slide-in">
      <h2 className="text-3xl font-bold mb-6">Join a Game</h2>
      <p className="mb-8 text-gray-600 dark:text-gray-300">Enter the 4-character game code from the host and your name to join the fun!</p>
      <form onSubmit={handleJoinGame} className="space-y-6">
        <Input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your Name"
          maxLength={20}
          required
        />
        <Input
          type="text"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          placeholder="GAME CODE"
          maxLength={4}
          className="text-center tracking-[0.5em] font-bold text-2xl"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Joining...' : 'Join Game'}
        </Button>
      </form>
    </div>
  );
};

export default JoinPage;