
import React from 'react';
import type { ImplementationFile } from '../types';
import { CodeBlock } from './CodeBlock';
import { FileIcon } from './icons/FileIcon';

interface ImplementationFileBlockProps {
  file: ImplementationFile;
}

export const ImplementationFileBlock: React.FC<ImplementationFileBlockProps> = ({ file }) => {
  const getLanguage = (filename: string): string => {
    const extension = filename.split('.').pop() || '';
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      sh: 'shell',
    };
    return langMap[extension] || '';
  };

  return (
    <div className="bg-slate-900/70 rounded-lg border border-slate-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50">
            <FileIcon className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-sm text-slate-300">{file.filename}</span>
        </div>
      <CodeBlock language={getLanguage(file.filename)} code={file.code} />
    </div>
  );
};
