import React, { useState, useEffect } from 'react';
import type { Mode } from '../types';
import { modeDetails } from './ChatHeader';
import { XIcon } from './icons/XIcon';

interface AddSessionModalProps {
  onClose: () => void;
  onSelectMode: (mode: Mode) => void;
}

const modesToShow: Mode[] = ['journey', 'hope', 'learn', 'build', 'refactor', 'omegacoder', 'reinforcement', 'judge', 'debug', 'microcheck', 'nanolinter', 'academic', 'templar', 'bountytemplar', 'quantumguardian', 'logic', 'codesphere', 'academy', 'squad', 'custom'];

export const AddSessionModal: React.FC<AddSessionModalProps> = ({ onClose, onSelectMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (mode: Mode) => {
    onSelectMode(mode);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`comic-panel-light w-full max-w-5xl p-6 text-slate-800 transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-comic-header text-4xl text-slate-900">Start a New Session</h2>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-black rounded-full hover:bg-slate-300 transition-colors comic-button bg-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {modesToShow.map((mode) => {
            const details = modeDetails[mode];
            const Icon = details.icon;
            return (
              <button
                key={mode}
                onClick={() => handleSelect(mode)}
                className="flex flex-col items-center justify-center text-center p-4 bg-white hover:bg-slate-50 border-4 border-black transition-all duration-200 group comic-button"
                data-theme={mode}
              >
                <div className="w-12 h-12 mb-3 rounded-full flex items-center justify-center border-2 border-black bg-[var(--theme-color-bg-light)]">
                    <Icon className="w-8 h-8 text-black" />
                </div>
                <span className="font-bold text-slate-800">{details.name}</span>
                <span className="text-xs text-slate-600 mt-1 hidden sm:block">{details.description.split('.')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};