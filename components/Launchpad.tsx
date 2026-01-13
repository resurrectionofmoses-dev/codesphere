
import React from 'react';
import { BotIcon } from './icons/BotIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PlusIcon } from './icons/PlusIcon';

interface LaunchpadProps {
  onStartJourney: () => void;
  onStartFreestyle: () => void;
}

export const Launchpad: React.FC<LaunchpadProps> = ({ onStartJourney, onStartFreestyle }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 fade-in">
      <div className="comic-panel-light p-8 max-w-lg text-slate-800">
        <div className="w-20 h-20 mx-auto bg-slate-800 text-yellow-400 border-4 border-black rounded-full flex items-center justify-center mb-4">
          <BotIcon className="w-12 h-12" />
        </div>
        <h2 className="font-comic-header text-5xl text-slate-900 mb-2">Welcome to CodeSphere</h2>
        <p className="text-slate-600 mb-8 font-bold">Your AI-powered coding partner. <br />How would you like to begin?</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                onClick={onStartJourney}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-6 bg-blue-500 text-white comic-button"
                data-theme="learn"
            >
                <BookOpenIcon className="w-5 h-5" />
                Start a Journey
            </button>
            <button
                onClick={onStartFreestyle}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-6 bg-slate-800 text-white comic-button"
            >
                <PlusIcon className="w-5 h-5" />
                Start a Freestyle Session
            </button>
        </div>
      </div>
    </div>
  );
};
