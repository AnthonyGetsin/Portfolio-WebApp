
import React from 'react';
import { SUGGESTION_CHIPS } from '../constants';
import { MeIcon, ProjectsIcon, SkillsIcon, FunIcon, ContactIcon } from './icons';

interface SuggestionChipsProps {
  onChipClick: (prompt: string) => void;
}

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  Me: MeIcon,
  Projects: ProjectsIcon,
  Skills: SkillsIcon,
  Fun: FunIcon,
  Contact: ContactIcon,
};

const iconColorMap: { [key: string]: string } = {
  Me: 'text-green-500',
  Projects: 'text-indigo-500',
  Skills: 'text-purple-500',
  Fun: 'text-pink-500',
  Contact: 'text-yellow-500',
};

const SuggestionChip: React.FC<{ label: string; prompt: string; onClick: (prompt: string) => void }> = ({ label, prompt, onClick }) => {
  const Icon = iconMap[label];
  const colorClass = iconColorMap[label];

  return (
    <button
      onClick={() => onClick(prompt)}
      className="flex flex-col items-center justify-center space-y-2 w-28 h-28 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-md hover:shadow-lg hover:border-gray-300 transition-all transform hover:-translate-y-1"
    >
      <div className={`p-2 bg-white rounded-full shadow-inner`}>
        {Icon && <Icon className={`w-6 h-6 ${colorClass}`} />}
      </div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </button>
  );
};

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onChipClick }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 stagger-fade-up">
      {SUGGESTION_CHIPS.map((chip) => (
        <SuggestionChip
          key={chip.label}
          label={chip.label}
          prompt={chip.prompt}
          onClick={onChipClick}
        />
      ))}
    </div>
  );
};

export default SuggestionChips;
