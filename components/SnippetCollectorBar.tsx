
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { XIcon } from './icons/XIcon';

interface SnippetCollectorBarProps {
  count: number;
  onCopyAll: () => void;
  onClear: () => void;
}

export const SnippetCollectorBar: React.FC<SnippetCollectorBarProps> = ({ count, onCopyAll, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyAll();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
      <div className="flex items-center justify-between gap-4 bg-glass rounded-lg shadow-2xl p-3 mx-4 border border-[var(--theme-color-main)]/50">
        <div className="font-semibold text-slate-200">
          <span className="text-[var(--theme-color-text)]">{count}</span> Snippet{count > 1 ? 's' : ''} Collected
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 py-2 px-3 rounded-md bg-[var(--theme-color-main)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ClipboardIcon className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded-md bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Clear collection"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
