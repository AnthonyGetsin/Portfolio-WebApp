
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getAIResponseStream } from './services/geminiService';
import { SUGGESTION_CHIPS } from './constants';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import SuggestionChips from './components/SuggestionChips';
import AIResponse from './components/AIResponse';
import { GithubIcon } from './components/icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiResponseBuffer, setAiResponseBuffer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showChatResponse, setShowChatResponse] = useState(false);
  const [profileFaded, setProfileFaded] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const chipsRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setAiResponse('');
    setAiResponseBuffer('');
    setCurrentPrompt('');
    setInputValue('');
    setError(null);
    setShowChatResponse(false);
    setConversation([]);
  };

  useEffect(() => {
    if (showChatResponse) {
      const timeout = setTimeout(() => setProfileFaded(true), 300);
      return () => clearTimeout(timeout);
    } else {
      setProfileFaded(false);
    }
  }, [showChatResponse]);

  useEffect(() => {
    const handleScroll = () => {
      if (!chipsRef.current) return;
      const rect = chipsRef.current.getBoundingClientRect();
      setIsStuck(rect.top <= 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (isLoading) return;
    
    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentPrompt(prompt);
    setShowChatResponse(true);
    setInputValue('');
    setAiResponse('');
    setAiResponseBuffer('');
    
    let buffer = '';
    try {
      const stream = getAIResponseStream(prompt, conversation);
      for await (const chunk of stream) {
        buffer += chunk;
        setAiResponseBuffer(buffer);
      }
      setAiResponse(buffer);
      
      // Add AI response to conversation
      const aiMessage: Message = {
        role: 'assistant',
        content: buffer,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversation]);

  const handleSuggestionClick = (prompt: string) => {
    setInputValue('');
    handleSubmit(prompt);
  };

  return (
    <div className={`bg-white text-gray-800 font-sans min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden ${showChatResponse ? 'show-chat-response' : ''}`}>
      
      {/* Background Orbs */}
      <div className="orb-container">
        <div className="orb animate-orb-1 top-[10%] left-[15%] w-[65vmin] h-[65vmin] bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 opacity-25"></div>
        <div className="orb animate-orb-2 top-[20%] left-[70%] w-[50vmin] h-[50vmin] bg-gradient-to-tr from-blue-400 via-teal-300 to-green-400 opacity-25"></div>
        <div className="orb animate-orb-3 top-[75%] left-[10%] w-[40vmin] h-[40vmin] bg-gradient-to-tr from-yellow-300 via-orange-400 to-red-400 opacity-20"></div>
      </div>

      {/* Background Text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[16vw] md:text-[12rem] font-extrabold tracking-tight pointer-events-none z-0 whitespace-nowrap background-name">
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
        <a href="https://github.com/AnthonyGetsin" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 hover:bg-gray-800">
          <GithubIcon className="w-5 h-5" />
          <span className="font-semibold text-sm">GitHub</span>
          <span className="bg-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">@AnthonyGetsin</span>
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
                limitToOneParagraph={false}
              />
            )}
          </div>
        )}
        <div
          className={`input-chips-container w-full flex flex-col items-center transition-transform duration-700${showChatResponse ? ' fade-out' : ''}`}
        >
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