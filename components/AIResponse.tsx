import React, { useEffect, useState } from 'react';
import { conversationMemory, ConversationMemory } from '../services/conversationMemory';
import FeedbackPanel from './FeedbackPanel';
import { GITHUB_PROJECTS } from '../constants';

interface AIResponseProps {
  prompt: string;
  response: string;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
  limitToOneParagraph?: boolean;
}

const AIResponse: React.FC<AIResponseProps> = ({ prompt, response, isLoading, error, onReset, limitToOneParagraph }) => {
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Only limit if explicitly requested (for main page responses)
  const getLimitedResponse = (text: string) => {
    if (!limitToOneParagraph) return text;
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

  // Save conversation when response is complete
  useEffect(() => {
    if (response && !isLoading && !typing && !conversationId) {
      const id = conversationMemory.saveConversation(prompt, response);
      setConversationId(id);
    }
  }, [response, isLoading, typing, prompt, conversationId]);
  
  // Detect intent to show resume
  const wantsResume = /resume|cv|show\s+resume|view\s+resume/i.test(prompt + ' ' + response);
  const isFirstResumeRequest = /resume|cv|show\s+resume|view\s+resume/i.test(prompt) && !/follow|more|detail|in-depth|tell me more/i.test(prompt);

  // Add a function to format project descriptions
  const formatProjectDescription = (project) => {
    return (
      <div className="project-description">
        <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Overview</h3>
          <p>{project.description}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Implementation</h3>
          <p>Details about the implementation process, tools used, and methodologies.</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Results</h3>
          <p>Summary of the results, metrics, and outcomes.</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Tools and Technologies</h3>
          <p>List of tools and technologies used in the project.</p>
        </div>
      </div>
    );
  };

  // Modify the renderResponse function to include project descriptions
  const renderResponse = (text: string) => {
    const projectMatch = GITHUB_PROJECTS.find(project => text.includes(project.name));
    if (projectMatch) {
      return formatProjectDescription(projectMatch);
    }
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;

      // Image markdown ![alt](src)
      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        const alt = imageMatch[1];
        const src = imageMatch[2];
        return (
          <div key={index} className="my-4 flex flex-col items-center">
            <img src={src} alt={alt || 'Image'} className="max-w-full rounded-xl shadow-md" />
            {alt && <span className="text-xs text-gray-500 mt-1">{alt}</span>}
          </div>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*)/g); // bold
      return (
        <p key={index} className="mb-2 last:mb-0">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('* ')) {
              return <span key={i} className="flex"><span className="mr-2">•</span><span>{part.slice(2)}</span></span>;
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const handleFeedback = (feedback: 'good' | 'bad' | 'neutral', correctedResponse?: string, notes?: string) => {
    if (conversationId) {
      conversationMemory.addFeedback(conversationId, feedback, correctedResponse, notes);
    }
  };

  return (
    <>
      <div className="glass-card-wide fade-in-wide-delayed">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <p className="font-semibold text-gray-800">{prompt}</p>
        </div>
        <div className="prose prose-blue max-w-none text-gray-700 min-h-[100px] card-scrollable-content">
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
            {/* If the prompt/response asks for resume, show the image and CTAs */}
            {wantsResume && (
              <div className="my-4 flex flex-col items-center">
                <img
                  src={"https://raw.githubusercontent.com/AnthonyGetsin/Portfolio-WebApp/e8d7e688098030ed40b93d77e92bceb75b3db095/Resume.png"}
                  alt="Resume"
                  className="w-full max-w-3xl rounded-2xl shadow-lg border border-gray-200"
                />
                <div className="mt-3 flex gap-3">
                  <a href="https://raw.githubusercontent.com/AnthonyGetsin/Portfolio-WebApp/e8d7e688098030ed40b93d77e92bceb75b3db095/Resume.png" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-800">Open</a>
                  <a href="https://raw.githubusercontent.com/AnthonyGetsin/Portfolio-WebApp/e8d7e688098030ed40b93d77e92bceb75b3db095/Resume.png" download className="px-4 py-2 rounded-full bg-white text-gray-800 border font-semibold hover:bg-gray-50">Download</a>
                </div>
              </div>
            )}
            {/* Only show text response if it's not a first resume request */}
            {!isFirstResumeRequest && renderResponse(displayed)}
            {typing && <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1 align-middle" />}
          </div>
          {isLoading && response && !typing && <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1" />}
        </div>
        
        {/* Training buttons */}
        {!isLoading && response && !wantsResume && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setShowFeedback(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              🎯 Train this response
            </button>
            <button
              onClick={onReset}
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors transform hover:scale-105"
            >
              Ask Another Question
            </button>
          </div>
        )}
        
        {!isLoading && wantsResume && (
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

      {showFeedback && (
        <FeedbackPanel
          conversationId={conversationId || ''}
          response={response}
          onFeedback={handleFeedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};

export default AIResponse;
