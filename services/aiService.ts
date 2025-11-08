import { GoogleGenAI } from '@google/genai';
import type { Game } from '../types';

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
    if (ai) {
        return ai;
    }
    try {
        // This will throw a ReferenceError in browser environments if `process` is not defined.
        // We catch it to allow the app to run without AI features.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (error) {
        console.warn("Failed to initialize GoogleGenAI, AI features will be disabled.", error);
        return null;
    }
    return ai;
};


export const getAIHostCommentary = async (game: Game): Promise<string> => {
  const aiInstance = getAI();
  if (!aiInstance) {
      return "BingoBot is sleeping... 😴 API key not configured.";
  }

  const sortedPlayers = [...game.players].sort((a, b) => (a.bestNumbersToBingo ?? 5) - (b.bestNumbersToBingo ?? 5));
  const closestPlayer = sortedPlayers[0];

  let prompt = `Here's the current game state for a family bingo game:\n`;
  prompt += `The last number called was: ${game.currentNumber}.\n`;
  prompt += `Total numbers called so far: ${game.calledNumbers.length} out of 75.\n`;
  prompt += `Players' status:\n${sortedPlayers.map(p => `- ${p.name} needs ${p.bestNumbersToBingo ?? 'many'} more numbers to win.`).join('\n')}\n`;

  if (closestPlayer && closestPlayer.bestNumbersToBingo === 1) {
    prompt += `\nYour task: Generate a very exciting, short comment for the host because ${closestPlayer.name} is on the verge of winning (just ONE number away)! Build the tension!`;
  } else if (game.currentNumber) {
    prompt += `\nYour task: Generate a fun, brief comment. You can either share a fun fact about the number ${game.currentNumber}, OR comment on which players are getting close, OR give a general exciting update on the game's progress.`;
  } else {
    prompt += `\nYour task: Generate a welcoming and fun message as the game is about to start.`;
  }

  try {
    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a fun and witty AI assistant for a family bingo game host. Your name is 'BingoBot'. Provide short (1-2 sentences max), engaging commentary suitable for all ages. Use emojis to add personality. Never use markdown. Be cheerful and encouraging.",
            temperature: 0.8,
            topP: 0.9,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "BingoBot is thinking... 🤔 Something went wrong.";
  }
};
