
import React, { useState } from 'react';
import { LearnIcon } from './icons/LearnIcon';
import { BuildIcon } from './icons/BuildIcon';
import { RefactorIcon } from './icons/RefactorIcon';
import { DebugIcon } from './icons/DebugIcon';
import { LogicIcon } from './icons/LogicIcon';
import { SecurityIcon } from './icons/SecurityIcon';
import { OptimizerIcon } from './icons/OptimizerIcon';
import { DocumenterIcon } from './icons/DocumenterIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface DelegationBlockProps {
  specialist: string;
  children: React.ReactNode;
}

const specialistDetails: Record<string, { name: string; icon: React.FC<{className?: string}>; theme: string }> = {
  architect: { name: 'Architect AI Report', icon: BuildIcon, theme: 'build' },
  instructor: { name: 'Instructor AI Report', icon: LearnIcon, theme: 'learn' },
  refactor: { name: 'Refactor AI Report', icon: RefactorIcon, theme: 'refactor' },
  debugger: { name: 'Debugger AI Report', icon: DebugIcon, theme: 'debug' },
  logic: { name: 'Logic AI Report', icon: LogicIcon, theme: 'logic' },
  security: { name: 'Security AI Report', icon: SecurityIcon, theme: 'refactor' },
  optimizer: { name: 'Optimizer AI Report', icon: OptimizerIcon, theme: 'codesphere' },
  documenter: { name: 'Documenter AI Report', icon: DocumenterIcon, theme: 'learn' },
};

export const DelegationBlock: React.FC<DelegationBlockProps> = ({ specialist, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const details = specialistDetails[specialist];

  if (!details) return <div className="p-4 my-4 bg-slate-800 rounded-lg border border-slate-700">{children}</div>;

  const Icon = details.icon;

  return (
    <div className="my-4 rounded-lg border bg-slate-800" data-theme={details.theme} style={{ borderColor: 'var(--theme-color-main)' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left bg-[var(--theme-color-bg-light)] hover:opacity-90 transition-opacity"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[var(--theme-color-text)]" />
          <span className="font-semibold text-slate-200">{details.name}</span>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="p-4 border-t prose prose-invert prose-sm max-w-none" style={{ borderColor: 'var(--theme-color-main)' }}>
          {children}
        </div>
      )}
    </div>
  );
};
