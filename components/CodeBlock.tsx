
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-950 rounded-lg my-4 overflow-hidden border-4 border-black">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 text-xs text-slate-400 border-b-4 border-black">
        <span className="font-mono font-bold">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-2 hover:text-white transition-colors bg-slate-700 px-2 py-1 rounded-md border-2 border-black">
          <ClipboardIcon className="w-4 h-4" />
          {copied ? 'COPIED!' : 'COPY'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-white bg-slate-900">
        <code>{code}</code>
      </pre>
    </div>
  );
};
