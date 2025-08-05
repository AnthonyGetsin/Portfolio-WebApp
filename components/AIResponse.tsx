
import React, { useEffect, useState } from 'react';

interface AIResponseProps {
  prompt: string;
  response: string;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
  limitToOneParagraph?: boolean; // NEW
}

const AIResponse: React.FC<AIResponseProps> = ({ prompt, response, isLoading, error, onReset, limitToOneParagraph }) => {
  // Typewriter effect state
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(false);

  // Limit response to 1 paragraph, max 4 sentences
  const getLimitedResponse = (text: string) => {
    if (!limitToOneParagraph) return text;
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, 4).join(' ').replace(/\n/g, ' ');
  };

  useEffect(() => {
    const limited = getLimitedResponse(response);
    if (!limited) {
      setDisplayed('');
      setTyping(false);
      return;
    }
    setDisplayed('');
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        if (i >= limited.length) {
          clearInterval(interval);
          setTyping(false);
          return limited;
        }
        i++;
        return limited.slice(0, i);
      });
    }, 18);
    return () => clearInterval(interval);
  }, [response, limitToOneParagraph]);
  
  // A simple markdown-like renderer for newlines and bold text
  const renderResponse = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      const parts = line.split(/(\*\*.*?\*\*)/g); // Split by bold tags
      return (
        <p key={index} className="mb-2 last:mb-0">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if(part.startsWith('* ')) {
                return <span key={i} className="flex"><span className="mr-2">•</span><span>{part.slice(2)}</span></span>
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="glass-card-wide fade-in-wide-delayed">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <p className="font-semibold text-gray-800">{prompt}</p>
      </div>
      <div className="prose prose-blue max-w-none text-gray-700 min-h-[100px]">
        {isLoading && !response && (
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span className="text-gray-500">Thinking...</span>
            </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <div>
          {renderResponse(displayed)}
          {typing && <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1 align-middle" />}
        </div>
        {isLoading && response && !typing && <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1" />}
      </div>
      {!isLoading && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={onReset}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors transform hover:scale-105"
          >
            Ask Another Question
          </button>
        </div>
      )}
    </div>
  );
};

export default AIResponse;
