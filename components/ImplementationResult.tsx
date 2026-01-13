
import React, { useState } from 'react';
import JSZip from 'jszip';
import type { ImplementationResponse } from '../types';
import { ImplementationFileBlock } from './ImplementationFileBlock';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImplementationResultProps {
  response: ImplementationResponse;
}

export const ImplementationResult: React.FC<ImplementationResultProps> = ({ response }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    const zip = new JSZip();
    
    response.files.forEach(file => {
      // JSZip can create folders from the filename path
      zip.file(file.filename, file.code);
    });

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'codesphere-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Failed to generate zip file", error);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 justify-center rounded-md px-4 py-2 text-sm font-semibold text-white bg-[var(--theme-color-main)] hover:opacity-90 disabled:opacity-60 transition-all"
        >
          <DownloadIcon className="w-4 h-4" />
          {isDownloading ? 'Zipping...' : 'Download Project (.zip)'}
        </button>
      </div>
      {response.files.map((file, index) => (
        <ImplementationFileBlock key={index} file={file} />
      ))}
    </div>
  );
};
