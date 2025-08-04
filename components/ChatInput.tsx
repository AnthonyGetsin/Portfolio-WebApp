
import React from 'react';
import { ArrowRightIcon } from './icons';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-lg mb-6">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="w-full py-4 pl-6 pr-16 text-md bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !value}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center transition-all hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ArrowRightIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
