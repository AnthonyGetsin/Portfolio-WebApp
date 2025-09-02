import React, { useState } from 'react';
import { ConversationMemory } from '../services/conversationMemory';

interface FeedbackPanelProps {
  conversationId: string;
  response: string;
  onFeedback: (feedback: 'good' | 'bad' | 'neutral', correctedResponse?: string, notes?: string) => void;
  onClose: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ conversationId, response, onFeedback, onClose }) => {
  const [feedback, setFeedback] = useState<'good' | 'bad' | 'neutral' | null>(null);
  const [correctedResponse, setCorrectedResponse] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (feedback) {
      onFeedback(feedback, correctedResponse || undefined, notes || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Train Tony's Response</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Tony's Response:</p>
          <div className="bg-gray-100 p-3 rounded-lg text-sm">
            {response}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">How was this response?</p>
          <div className="flex space-x-3">
            <button
              onClick={() => setFeedback('good')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feedback === 'good' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-green-100'
              }`}
            >
              👍 Good
            </button>
            <button
              onClick={() => setFeedback('bad')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feedback === 'bad' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-red-100'
              }`}
            >
              �� Bad
            </button>
            <button
              onClick={() => setFeedback('neutral')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feedback === 'neutral' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
              }`}
            >
              😐 Neutral
            </button>
          </div>
        </div>

        {feedback === 'bad' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How should Tony have responded instead?
            </label>
            <textarea
              value={correctedResponse}
              onChange={(e) => setCorrectedResponse(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              rows={3}
              placeholder="Enter the better response..."
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            rows={2}
            placeholder="e.g., 'Tony wouldn't use formal language', 'Tony loves emojis', 'Tony is more casual'..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback}
            className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel; 