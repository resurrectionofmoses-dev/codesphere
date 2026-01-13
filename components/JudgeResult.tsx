
import React from 'react';
import type { JudgeResultResponse, JudgeRating } from '../types';
import { FireIcon } from './icons/FireIcon';

interface JudgeResultProps {
  response: JudgeResultResponse;
}

const ratingDetails: Record<JudgeRating, { color: string; shadow: string; label: string }> = {
    Mild: { color: 'text-green-400', shadow: 'shadow-green-500/50', label: 'Mild' },
    Hot: { color: 'text-yellow-400', shadow: 'shadow-yellow-500/50', label: 'Hot' },
    Fire: { color: 'text-orange-400', shadow: 'shadow-orange-500/50', label: 'Fire' },
    Diablo: { color: 'text-red-500', shadow: 'shadow-red-500/50', label: 'Diablo!' },
};

export const JudgeResult: React.FC<JudgeResultProps> = ({ response }) => {
  const details = ratingDetails[response.rating] || ratingDetails.Mild;

  return (
    <div className="bg-slate-950 rounded-lg my-4 border border-amber-500/50" data-theme="build">
      <div className="flex flex-col items-center p-6 border-b-2 border-dashed border-amber-600/30 bg-gradient-to-b from-amber-500/10 to-transparent">
        <FireIcon className={`w-12 h-12 ${details.color}`} />
        <h2 className={`text-3xl font-bold mt-2 ${details.color}`}>{details.label}</h2>
        <p className="text-sm text-amber-300/80 font-semibold">Taco Bell Standard Verdict</p>
      </div>

      <div className="p-6 space-y-6">
        {response.goodPoints && response.goodPoints.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">The Good (The "Beefy")</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {response.goodPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
        )}

        {response.improvementPoints && response.improvementPoints.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">The Improvable (The "Cheesy")</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {response.improvementPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
        )}
        
        <div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">The Verdict (The "Crunchwrap")</h3>
            <p className="text-slate-300 italic">"{response.verdict}"</p>
        </div>
      </div>
    </div>
  );
};
