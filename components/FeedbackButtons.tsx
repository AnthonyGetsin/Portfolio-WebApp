import React from 'react';

interface FeedbackButtonsProps {
  memoryId: string;
  onFeedback: (memoryId: string, feedback: 'positive' | 'negative' | 'correction', correction?: string) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ memoryId, onFeedback }) => {
  const [showCorrection, setShowCorrection] = React.useState(false);
  const [correctionText, setCorrectionText] = React.useState('');

  const handleCorrection = () => {
    if (correctionText.trim()) {
      onFeedback(memoryId, 'correction', correctionText.trim());
      setCorrectionText('');
      setShowCorrection(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => onFeedback(memoryId, 'positive')}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
        >
          👍 Good response
        </button>
        <button
          onClick={() => onFeedback(memoryId, 'negative')}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
        >
          👎 Not quite right
        </button>
        <button
          onClick={() => setShowCorrection(!showCorrection)}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
        >
          ✏️ Correct this
        </button>
      </div>
      
      {showCorrection && (
        <div className="flex gap-2">
          <input
            type="text"
            value={correctionText}
            onChange={(e) => setCorrectionText(e.target.value)}
            placeholder="How should I have responded instead?"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            onClick={handleCorrection}
            disabled={!correctionText.trim()}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackButtons; 