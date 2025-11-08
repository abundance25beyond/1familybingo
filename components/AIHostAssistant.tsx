import React, { useState, useEffect, useRef } from 'react';
import type { Game } from '../types';
import { getAIHostCommentary } from '../services/aiService';

const useTypewriter = (text: string, speed = 30) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (!text) return;
        setDisplayText(''); // Reset when text changes
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => clearInterval(typingInterval);
    }, [text, speed]);

    return displayText;
};


const AIHostAssistant: React.FC<{ game: Game }> = ({ game }) => {
  const [commentary, setCommentary] = useState("Let's get this bingo party started! I'll be sharing live updates and fun facts. 🎉");
  const [loading, setLoading] = useState(false);
  const lastProcessedNumber = useRef<number | null>(null);
  
  const displayedCommentary = useTypewriter(commentary);

  useEffect(() => {
    if (game.status === 'playing' && game.currentNumber && game.currentNumber !== lastProcessedNumber.current) {
      lastProcessedNumber.current = game.currentNumber;
      setLoading(true);
      
      // Add a small delay for better UX
      setTimeout(() => {
        getAIHostCommentary(game)
          .then(text => {
              if (text) setCommentary(text);
          })
          .catch(err => {
              console.error("AI Assistant Error:", err);
              setCommentary("Oops, my circuits are buzzing! 🤖");
          })
          .finally(() => setLoading(false));
      }, 500);
    }
  }, [game, game.currentNumber, game.status]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 16.633c.327 0 .651-.091.933-.272.281-.182.51-.437.663-.746l.153-.307.153.307c.153.309.382.564.663.746.282.181.606.272.933.272h.327" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14v1.633c0 .327.135.64.375.864.24.225.558.35.888.351h.474c.33.001.648-.126.888-.35a1.22 1.22 0 00.375-.865V14" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.282 10.282a.062.062 0 010 .088.062.062 0 01-.088 0 .062.062 0 010-.088.062.062 0 01.088 0zM9.718 10.282a.062.062 0 010 .088.062.062 0 01-.088 0 .062.062 0 010-.088.062.062 0 01.088 0z" />
        </svg>
        BingoBot Says...
      </h3>
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg min-h-[80px]">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            <span>Thinking...</span>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-200">{displayedCommentary}</p>
        )}
      </div>
    </div>
  );
};

export default AIHostAssistant;
