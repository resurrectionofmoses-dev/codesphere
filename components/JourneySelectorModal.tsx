
import React, { useState, useEffect } from 'react';
import type { JourneyProgram } from '../types';
import { JOURNEY_PROGRAMS } from '../constants';
import { XIcon } from './icons/XIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface JourneySelectorModalProps {
  onClose: () => void;
  onSelectJourney: (journey: JourneyProgram) => void;
}

export const JourneySelectorModal: React.FC<JourneySelectorModalProps> = ({ onClose, onSelectJourney }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`bg-glass w-full max-w-2xl rounded-2xl shadow-2xl p-6 transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Choose Your Journey</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {JOURNEY_PROGRAMS.map((program) => (
            <button
              key={program.id}
              onClick={() => onSelectJourney(program)}
              className="w-full text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-[var(--theme-color-main)] transition-all duration-200 group"
              data-theme="journey"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--theme-color-bg-light)] rounded-lg mt-1">
                    <BookOpenIcon className="w-6 h-6 text-[var(--theme-color-text)]" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-100 text-lg">{program.title}</h3>
                    <p className="text-slate-400 text-sm">{program.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
