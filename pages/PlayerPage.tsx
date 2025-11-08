import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameStream, declareWinner, updatePlayerData, buyNewCard, addCoins } from '../services/gameService';
import { checkBingo, calculateNumbersToBingo } from '../utils/bingoUtils';
import { getCurrentUser } from '../services/firebase';
import type { Game, BingoCard as BingoCardType, Player } from '../types';
import Spinner from '../components/Spinner';
import BingoCard from '../components/BingoCard';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { POWER_MOVE_MANUAL_DAUB_COST, COIN_AWARD_MATCH, BUY_CARD_COST, MAX_CARDS } from '../constants';

const PlayerPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{cardIndex: number, number: number} | null>(null);

  const calledNumbersRef = useRef<number[]>([]);

  const fetchUserAndSetPlayer = useCallback(async () => {
    if (!game) return;
    try {
      const user = await getCurrentUser();
      const currentPlayer = game.players.find(p => p.id === user.uid);
      if (currentPlayer) {
        setPlayerData(currentPlayer);
        setError(null);
      } else if (game.status === 'ended') {
        setError("You are not a player in this game, which has ended.");
      }
    } catch (e) {
      console.error("Authentication error:", e);
      setError("Could not authenticate your user account.");
    }
  }, [game]);

  useEffect(() => {
    if (!gameId) {
      navigate('/');
      return;
    }
    
    setLoading(true);
    const unsubscribe = getGameStream(gameId, (gameData) => {
      if (gameData) {
        setGame(gameData);
        setError(null);
      } else {
        setError('Game not found. It may have been deleted by the host.');
        setGame(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId, navigate]);

  useEffect(() => {
    if (game) {
      fetchUserAndSetPlayer();
    }
  }, [game, fetchUserAndSetPlayer]);

  const checkWinCondition = useCallback(async () => {
    if (game && game.status === 'playing' && !game.winner && playerData) {
      for (const card of playerData.cards) {
        const hasBingo = checkBingo(card.cardData, game.calledNumbers, card.manuallyMarkedNumbers);
        if (hasBingo) {
          await declareWinner(game.id, playerData);
          break; 
        }
      }
    }
  }, [game, playerData]);
  
  const updatePlayerStats = useCallback(() => {
    if (game && playerData && game.status === 'playing') {
         const numbersToBingoPerCard = playerData.cards.map(card => 
            calculateNumbersToBingo(card.cardData, game.calledNumbers, card.manuallyMarkedNumbers)
         );
         const bestNumbersToBingo = Math.min(...numbersToBingoPerCard);

         if(bestNumbersToBingo !== playerData.bestNumbersToBingo) {
            updatePlayerData(game.id, playerData.id, { bestNumbersToBingo });
         }
    }
  }, [game, playerData]);


  useEffect(() => {
    checkWinCondition();
    updatePlayerStats();
  }, [game?.calledNumbers, playerData?.cards, checkWinCondition, updatePlayerStats]);

  useEffect(() => {
    if (game && playerData && game.status === 'playing') {
      const newNumbers = game.calledNumbers.filter(n => !calledNumbersRef.current.includes(n));
      if (newNumbers.length > 0) {
        let totalMatches = 0;
        
        playerData.cards.forEach(card => {
            const flatCard = card.cardData.flat();
            newNumbers.forEach(num => {
                if (flatCard.includes(num)) {
                    totalMatches++;
                }
            });
        });
        
        if (totalMatches > 0) {
          const newCoinTotal = playerData.coins + (totalMatches * COIN_AWARD_MATCH);
          updatePlayerData(game.id, playerData.id, { coins: newCoinTotal });
        }
      }
      calledNumbersRef.current = game.calledNumbers;
    }
  }, [game?.calledNumbers, playerData, game?.id]);

  const handleManualMark = async () => {
    if (!gameId || !playerData || showConfirmModal === null || playerData.coins < POWER_MOVE_MANUAL_DAUB_COST) return;
    
    const newCoins = playerData.coins - POWER_MOVE_MANUAL_DAUB_COST;
    
    const updatedCards = [...playerData.cards];
    const cardToUpdate = updatedCards[showConfirmModal.cardIndex];
    cardToUpdate.manuallyMarkedNumbers = [...cardToUpdate.manuallyMarkedNumbers, showConfirmModal.number];

    await updatePlayerData(gameId, playerData.id, { coins: newCoins, cards: updatedCards });
    setShowConfirmModal(null);
  };
  
  const handleBuyCard = () => {
      if(gameId && playerData) {
          buyNewCard(gameId, playerData.id);
      }
  }

  const handleGetCoins = () => {
      if(gameId && playerData) {
          addCoins(gameId, playerData.id);
      }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
            <p className="text-lg mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
    );
  }

  if (!game) {
    return <p className="text-center">Waiting for game data...</p>;
  }

  if (!playerData && game.status !== 'ended') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center animate-slide-in">
              <Spinner />
              <h2 className="text-2xl font-bold mt-6">Joining Game...</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Finalizing your entry. This should only take a moment.
              </p>
          </div>
      );
  }

  const renderWinnerOverlay = () => {
    if (!game.winner && game.status !== 'ended') return null;

    const isWinner = playerData?.id === game.winner?.id;
    const title = game.winner ? (isWinner ? 'BINGO!' : 'GAME OVER') : 'GAME ENDED';
    const message = game.winner ? (isWinner ? 'You won the game!' : `${game.winner.name} got a BINGO!`) : 'The host has ended the game.';
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-in p-4">
        {isWinner && <Confetti />}
        <div className={`relative z-[60] p-8 md:p-12 rounded-lg shadow-2xl text-center border-4 w-full max-w-lg 
          ${isWinner ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-100'}`}>
          <h2 className={`text-5xl md:text-7xl font-bold ${isWinner ? 'animate-winner-text-pop' : ''}`}>{title}</h2>
          <p className="text-2xl md:text-3xl mt-4">{message}</p>
           <Button onClick={() => navigate('/')} className="mt-8">
            Back to Home
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmModal = () => {
    if (showConfirmModal === null || !playerData) return null;
    const canAfford = playerData.coins >= POWER_MOVE_MANUAL_DAUB_COST;
    return (
       <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="p-8 rounded-lg shadow-2xl text-center bg-white dark:bg-gray-800 w-full max-w-sm">
          <h3 className="text-2xl font-bold mb-4">Manual Daub</h3>
          {canAfford ? (
            <>
            <p className="text-lg mb-6">Spend <span className="font-bold text-amber-500">{POWER_MOVE_MANUAL_DAUB_COST} coins</span> to mark the number <span className="font-bold text-indigo-500">{showConfirmModal.number}</span>?</p>
            <div className="flex justify-center gap-4">
                <Button onClick={() => setShowConfirmModal(null)} variant="secondary">Cancel</Button>
                <Button onClick={handleManualMark}>Confirm</Button>
            </div>
            </>
          ) : (
            <>
            <p className="text-lg mb-6">You don't have enough coins. You need <span className="font-bold text-amber-500">{POWER_MOVE_MANUAL_DAUB_COST} coins</span>.</p>
            <Button onClick={() => setShowConfirmModal(null)} variant="secondary">OK</Button>
            </>
          )}
        </div>
       </div>
    );
  }

  if (!playerData && game.status === 'ended') {
      return renderWinnerOverlay();
  }
  
  if (!playerData) {
      return <div className="flex items-center justify-center h-full"><Spinner /><p className="ml-4">Loading player data...</p></div>;
  }

  if (game.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center text-center animate-slide-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-2">Welcome to the Lobby!</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">The game will begin shortly. You have {playerData.cards.length} card(s).</p>
          <div className="flex gap-4 overflow-x-auto pb-4">
          {playerData.cards.map((card, index) => (
            <BingoCard key={index} cardData={card.cardData} calledNumbers={[]} manuallyMarkedNumbers={[]} currentNumber={null} gameStatus="waiting" />
          ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-in">
      {renderWinnerOverlay()}
      {renderConfirmModal()}

      <div className="lg:col-span-2 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-around p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg gap-4">
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">LAST CALLED</span>
              <div key={game.currentNumber} className="w-28 h-28 bg-amber-400 rounded-full flex items-center justify-center text-5xl font-bold text-gray-900 shadow-lg animate-pulse-glow">
                  {game.currentNumber || '-'}
              </div>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">YOUR COINS</span>
              <div className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl font-bold text-amber-500 shadow-inner">
                  {playerData.coins}
              </div>
            </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {playerData.cards.map((card, index) => (
                <BingoCard 
                    key={index}
                    cardData={card.cardData} 
                    calledNumbers={game.calledNumbers} 
                    manuallyMarkedNumbers={card.manuallyMarkedNumbers}
                    currentNumber={game.currentNumber}
                    onManualMark={(num) => setShowConfirmModal({ cardIndex: index, number: num })}
                    gameStatus={game.status}
                />
            ))}
        </div>
      </div>

      <aside className="w-full lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Your Cards ({playerData.cards.length}/{MAX_CARDS})</h3>
            <div className="space-y-3">
                 <Button onClick={handleBuyCard} disabled={playerData.cards.length >= MAX_CARDS || playerData.coins < BUY_CARD_COST} className="w-full">
                    Buy New Card ({BUY_CARD_COST} coins)
                </Button>
                <Button onClick={handleGetCoins} variant="secondary" className="w-full">
                    Get Coins
                </Button>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Game Code</h3>
            <p className="bg-gray-100 dark:bg-gray-700 text-2xl font-bold tracking-widest p-3 rounded text-center">{game.id}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Called Numbers ({game.calledNumbers.length})</h3>
            <div className="flex flex-wrap-reverse gap-2 max-h-48 overflow-y-auto">
                {game.calledNumbers.map(num => (
                    <div key={num} className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full font-semibold flex-shrink-0">
                        {num}
                    </div>
                ))}
            </div>
        </div>
      </aside>
    </div>
  );
};

export default PlayerPage;