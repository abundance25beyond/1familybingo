import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createGame, getGameStream, startGame, callNextNumber, endGame } from '../services/gameService';
import type { Game, Player } from '../types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import CalledNumbersDisplay from '../components/CalledNumbersDisplay';
import AIHostAssistant from '../components/AIHostAssistant';

const HostPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = useCallback(async () => {
    setLoading(true);
    try {
      const newGameId = await createGame();
      navigate(`/host/${newGameId}`);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getGameStream(gameId, (gameData) => {
      if (gameData) {
        setGame(gameData);
        setError(null);
      } else {
        setError('Game not found.');
        setGame(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);
  
  const handleStartGame = () => {
    if (gameId) startGame(gameId);
  }

  const handleCallNext = () => {
    if (gameId) callNextNumber(gameId);
  }
  
  const handleEndGame = () => {
    if (gameId) endGame(gameId);
  }
  
  const sortedPlayers = game?.players.sort((a, b) => (a.bestNumbersToBingo ?? 5) - (b.bestNumbersToBingo ?? 5));
  const getTotalManualDaubs = (player: Player) => {
    return player.cards.reduce((total, card) => total + card.manuallyMarkedNumbers.length, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="text-center animate-slide-in">
        <h2 className="text-3xl font-bold mb-6">Host a New Game</h2>
        <p className="mb-8">Create a new game room and invite your friends to play!</p>
        <Button onClick={handleCreateGame} disabled={loading}>
          {loading ? 'Creating...' : 'Create New Game'}
        </Button>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!game) {
    return <p className="text-center">Loading game details...</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-slide-in">
      {/* Main Content */}
      <div className="flex-grow">
        {game.status === 'waiting' && (
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Your Game is Ready!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Share this code with your friends to join:</p>
            <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-5xl font-bold tracking-widest p-4 rounded-lg inline-block mb-8">
              {game.id}
            </div>
            <div>
              <Button onClick={handleStartGame} disabled={game.players.length === 0}>
                {game.players.length === 0 ? "Waiting for Players" : "Start Game"}
              </Button>
            </div>
          </div>
        )}

        {game.status === 'playing' && (
            <CalledNumbersDisplay currentNumber={game.currentNumber} calledNumbers={game.calledNumbers} />
        )}
        
        {(game.status === 'playing' || game.status === 'ended') && game.winner && (
            <div className="mt-8 p-6 bg-green-100 dark:bg-green-900 border-2 border-green-500 text-green-800 dark:text-green-200 rounded-lg text-center">
                <h2 className="text-3xl font-bold">BINGO!</h2>
                <p className="text-xl mt-2">{game.winner.name} has won the game!</p>
            </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
        <AIHostAssistant game={game} />
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Players ({game.players.length})</h3>
            {sortedPlayers && sortedPlayers.length > 0 ? (
            <ul className="space-y-3">
                {sortedPlayers.map((player) => (
                <li key={player.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center text-sm">
                    <div className="font-semibold">{player.name}</div>
                    <div className="flex items-center gap-3">
                        <span title="Power Moves Used" className="flex items-center gap-1 text-pink-500 font-bold">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {getTotalManualDaubs(player)}
                        </span>
                        <span title="Coins" className="font-bold text-amber-500 flex items-center gap-1">
                            {player.coins}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </span>
                        <span title="Numbers to Bingo" className={`w-10 text-center px-2 py-1 rounded-full font-bold text-white text-xs ${
                            player.bestNumbersToBingo === 1 ? 'bg-red-500 animate-pulse' : 
                            player.bestNumbersToBingo === 2 ? 'bg-yellow-500' : 
                            'bg-indigo-500'
                        }`}>
                            {player.bestNumbersToBingo} left
                        </span>
                    </div>
                </li>
                ))}
            </ul>
            ) : (
            <p className="text-gray-500 dark:text-gray-400">No players have joined yet.</p>
            )}
        </div>
        
        {game.status === 'playing' && !game.winner && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Game Controls</h3>
            <div className="flex flex-col space-y-4">
                <Button onClick={handleCallNext} disabled={game.calledNumbers.length >= 75}>
                    Call Next Number
                </Button>
                <Button onClick={handleEndGame} variant="danger">
                    End Game
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostPage;