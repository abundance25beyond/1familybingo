import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { getCurrentUser } from './firebase';
import type { Game, Player, BingoCard } from '../types';
import { INITIAL_COINS, BUY_CARD_COST, MAX_CARDS, ADD_COINS_AMOUNT } from '../constants';
import { generateBingoCard } from '../utils/bingoUtils';

const db = getFirestore();

const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createGame = async (): Promise<string> => {
  const host = await getCurrentUser();
  const gameId = generateGameCode();
  const gameDocRef = doc(db, 'games', gameId);

  const newGame: Game = {
    id: gameId,
    hostId: host.uid,
    status: 'waiting',
    players: [],
    calledNumbers: [],
    currentNumber: null,
    winner: null,
    createdAt: serverTimestamp(),
  };

  await setDoc(gameDocRef, newGame);
  return gameId;
};

export const joinGame = async (gameId: string, playerName: string): Promise<boolean> => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
  
  try {
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error('Game not found.');
      return false;
    }

    const gameData = gameDoc.data() as Game;
    if (gameData.status !== 'waiting') {
      console.error('Game already started or closed.');
      return false;
    }

    const user = await getCurrentUser();
    const initialCard: BingoCard = {
      cardData: generateBingoCard(),
      manuallyMarkedNumbers: [],
    };
    const newPlayer: Player = {
      id: user.uid,
      name: playerName,
      coins: INITIAL_COINS,
      cards: [initialCard],
      bestNumbersToBingo: 5,
    };

    await updateDoc(gameDocRef, {
      players: arrayUnion(newPlayer),
    });

    return true;
  } catch (error) {
    console.error('Failed to join game:', error);
    return false;
  }
};

export const updatePlayerData = async (gameId: string, playerId: string, updates: Partial<Pick<Player, 'coins' | 'cards' | 'bestNumbersToBingo'>>) => {
    const gameDocRef = doc(db, 'games', gameId.toUpperCase());
    try {
        await runTransaction(db, async (transaction) => {
            const gameDoc = await transaction.get(gameDocRef);
            if (!gameDoc.exists()) {
                throw "Game not found!";
            }
            const gameData = gameDoc.data() as Game;
            const playerIndex = gameData.players.findIndex(p => p.id === playerId);
            if (playerIndex === -1) {
                throw "Player not found in this game!";
            }
            
            const updatedPlayers = [...gameData.players];
            const playerToUpdate = { ...updatedPlayers[playerIndex] };

            if(updates.coins !== undefined) playerToUpdate.coins = updates.coins;
            if(updates.cards !== undefined) playerToUpdate.cards = updates.cards;
            if(updates.bestNumbersToBingo !== undefined) playerToUpdate.bestNumbersToBingo = updates.bestNumbersToBingo;

            updatedPlayers[playerIndex] = playerToUpdate;
            
            transaction.update(gameDocRef, { players: updatedPlayers });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
};

export const buyNewCard = async (gameId: string, playerId: string) => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
  try {
    await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameDocRef);
      if (!gameDoc.exists()) throw "Game not found!";
      
      const gameData = gameDoc.data() as Game;
      const playerIndex = gameData.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) throw "Player not found!";
      
      const updatedPlayers = [...gameData.players];
      const player = { ...updatedPlayers[playerIndex] };

      if (player.cards.length >= MAX_CARDS || player.coins < BUY_CARD_COST) {
        // Not throwing error, just silently failing if client-side checks fail
        return; 
      }

      player.coins -= BUY_CARD_COST;
      player.cards.push({
        cardData: generateBingoCard(),
        manuallyMarkedNumbers: [],
      });
      
      updatedPlayers[playerIndex] = player;
      transaction.update(gameDocRef, { players: updatedPlayers });
    });
  } catch (e) {
    console.error("Buy card transaction failed: ", e);
  }
};

export const addCoins = async (gameId: string, playerId: string) => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
  try {
    await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameDocRef);
      if (!gameDoc.exists()) throw "Game not found!";
      
      const gameData = gameDoc.data() as Game;
      const playerIndex = gameData.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) throw "Player not found!";

      const updatedPlayers = [...gameData.players];
      const player = { ...updatedPlayers[playerIndex] };
      player.coins += ADD_COINS_AMOUNT;
      
      updatedPlayers[playerIndex] = player;
      transaction.update(gameDocRef, { players: updatedPlayers });
    });
  } catch (e) {
    console.error("Add coins transaction failed: ", e);
  }
};


export const getGameStream = (gameId: string, callback: (game: Game | null) => void) => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
  return onSnapshot(gameDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Game);
    } else {
      callback(null);
    }
  });
};

export const startGame = async (gameId: string): Promise<void> => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
  await updateDoc(gameDocRef, {
    status: 'playing',
  });
  callNextNumber(gameId);
};

export const callNextNumber = async (gameId: string): Promise<void> => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
  const gameDoc = await getDoc(gameDocRef);
  if (!gameDoc.exists()) return;

  const gameData = gameDoc.data() as Game;
  const { calledNumbers } = gameData;
  
  if (calledNumbers.length >= 75) return;

  let nextNumber;
  do {
    nextNumber = Math.floor(Math.random() * 75) + 1;
  } while (calledNumbers.includes(nextNumber));

  await updateDoc(gameDocRef, {
    calledNumbers: arrayUnion(nextNumber),
    currentNumber: nextNumber,
  });
};

export const declareWinner = async (gameId: string, player: Player): Promise<void> => {
  const gameDocRef = doc(db, 'games', gameId.toUpperCase());
   const gameDoc = await getDoc(gameDocRef);
   if (!gameDoc.exists() || gameDoc.data().winner) return; // Prevent multiple winners

  await updateDoc(gameDocRef, {
    winner: player,
    status: 'ended',
  });
};

export const endGame = async (gameId: string): Promise<void> => {
    const gameDocRef = doc(db, 'games', gameId.toUpperCase());
    await updateDoc(gameDocRef, {
        status: 'ended',
    });
};