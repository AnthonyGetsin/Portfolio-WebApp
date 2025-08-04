
import React, { useState, useCallback, useEffect } from 'react';
import { getAIResponseStream } from './services/geminiService';
import { SUGGESTION_CHIPS } from './constants';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import SuggestionChips from './components/SuggestionChips';
import AIResponse from './components/AIResponse';
import { GithubIcon } from './components/icons';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiResponseBuffer, setAiResponseBuffer] = useState(''); // NEW
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showChatResponse, setShowChatResponse] = useState(false); // NEW
  const [profileFaded, setProfileFaded] = useState(false); // NEW

  const resetState = () => {
    setAiResponse('');
    setAiResponseBuffer(''); // NEW
    setCurrentPrompt('');
    setInputValue('');
    setError(null);
    setShowChatResponse(false); // NEW
  };

  useEffect(() => {
    if (showChatResponse) {
      const timeout = setTimeout(() => setProfileFaded(true), 300); // 300ms fade
      return () => clearTimeout(timeout);
    } else {
      setProfileFaded(false);
    }
  }, [showChatResponse]);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (isLoading) return;
    resetState();
    setIsLoading(true);
    setCurrentPrompt(prompt);
    setShowChatResponse(true); // NEW: trigger transition
    setInputValue(''); // NEW: clear input after submit
    let buffer = '';
    try {
      const stream = getAIResponseStream(prompt);
      for await (const chunk of stream) {
        buffer += chunk;
        setAiResponseBuffer(buffer); // For possible future use (e.g., streaming loader)
      }
      setAiResponse(buffer); // Only set after fully received
    } catch (err) {
      console.error(err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(''); // NEW: clear input
    handleSubmit(prompt);
  };

  return (
    <div className={`bg-white text-gray-800 font-sans min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden ${showChatResponse ? 'show-chat-response' : ''}`}>
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[10%] w-[80vmin] h-[80vmin] bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 rounded-full opacity-30 blur-3xl animate-orb-1"></div>
        <div className="absolute top-[50%] left-[60%] w-[60vmin] h-[60vmin] bg-gradient-to-tr from-blue-400 via-teal-300 to-green-400 rounded-full opacity-30 blur-3xl animate-orb-2"></div>
        <div className="absolute top-[80%] left-[20%] w-[40vmin] h-[40vmin] bg-gradient-to-tr from-yellow-300 via-orange-400 to-red-400 rounded-full opacity-20 blur-3xl animate-orb-3"></div>
      </div>

      {/* Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[20vw] md:text-[15rem] font-extrabold text-gray-100/80 tracking-widest pointer-events-none z-0 whitespace-nowrap">
        Tony Getsin
      </div>

      <div className="absolute top-5 left-5 z-10">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-700">Looking for a talent?</span>
        </div>
      </div>

      <div className="absolute top-5 right-5 z-10">
        <a href="https://github.com/getsin/ai-portfolio" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105">
          <GithubIcon className="w-5 h-5" />
          <span className="font-semibold text-sm">Star</span>
          <span className="bg-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">180</span>
        </a>
      </div>

      <main className="w-full flex flex-col items-center justify-center text-center z-10 transition-opacity duration-500">
        {!profileFaded && (
          <div className={`profile-container w-full flex flex-col items-center${showChatResponse ? ' fade-out' : ''}`}>
            <Header />
          </div>
        )}
        {profileFaded && showChatResponse && (
          <div className="fade-in-wide-delayed">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-lg text-gray-500">
                <span className="animate-pulse">Thinking...</span>
              </div>
            ) : (
              <AIResponse
                response={aiResponse}
                isLoading={isLoading}
                prompt={currentPrompt}
                onReset={resetState}
                error={error}
                limitToOneParagraph={true}
              />
            )}
          </div>
        )}
        <div className={`input-chips-container w-full flex flex-col items-center transition-transform duration-700 ${showChatResponse ? 'slide-down' : ''}`}>
          <ChatInput 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSubmit={() => handleSubmit(inputValue)}
            isLoading={isLoading}
          />
          <SuggestionChips onChipClick={handleSuggestionClick} />
        </div>
      </main>
    </div>
  );
};

export default App;