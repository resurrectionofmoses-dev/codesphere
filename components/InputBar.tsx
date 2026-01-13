
import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';
import type { AttachedFile, Mode } from '../types';
import { SteeringWheelIcon } from './icons/SteeringWheelIcon';


interface InputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  attachedFiles: AttachedFile[];
  onFilesChange: (files: FileList | null) => void;
  onRemoveFile: (fileName: string) => void;
  currentMode: Mode;
  isDriving: boolean;
  onStopDriving: () => void;
  isInteractionActive?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ 
    onSendMessage, isLoading, inputText, setInputText, 
    isRecording, onToggleRecording, attachedFiles, onFilesChange, onRemoveFile,
    currentMode, isDriving, onStopDriving, isInteractionActive
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || attachedFiles.length > 0) {
      onSendMessage(inputText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [inputText]);
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const placeholderMap: Record<string, string> = {
    learn: "Ask about a concept, e.g., 'what are promises in JS?'",
    build: "Describe a project to plan, e.g., 'a to-do list app'",
    refactor: "Describe the code to refactor, or attach files...",
    debug: "Paste your buggy code and describe the problem...",
    codesphere: "Describe a project, e.g., 'A deployable Next.js app with a Dockerfile'",
    logic: "Describe some logic, e.g., 'a function to find the largest number in a list'",
    complex: "Describe a complex project for the AI squad...",
    judge: "Submit your code for judgment...",
    custom: "Chat with your custom AI...",
  };

  const placeholder = placeholderMap[currentMode] || "Ask me anything, or click the mic to talk...";


  return (
    <div className="p-4 pt-2 bg-slate-800 rounded-b-lg border-t-4 border-black">
      <div className="max-w-4xl mx-auto relative">
        {(isDriving || isInteractionActive) && (
            <div className="absolute inset-0 bg-slate-700/95 z-10 rounded-xl flex flex-col items-center justify-center p-4">
                {isDriving && (
                    <>
                        <div className="flex items-center gap-2 text-slate-300 mb-4">
                            <SteeringWheelIcon className="w-5 h-5 animate-pulse text-[var(--theme-color-text)]" />
                            <span className="font-semibold font-comic-header text-2xl text-white">AI is driving...</span>
                        </div>
                        <button onClick={onStopDriving} className="bg-red-500 hover:bg-red-600 text-white comic-button py-2 px-4">
                            Stop Driving
                        </button>
                    </>
                )}
                {isInteractionActive && (
                     <span className="font-semibold font-comic-header text-2xl text-white text-center">Please respond to the prompt above to continue.</span>
                )}
            </div>
        )}
        <div className="flex flex-col p-2 rounded-xl comic-panel bg-slate-600">
            {attachedFiles.length > 0 && (
                <div className="p-2 border-b-2 border-black">
                    <div className="flex flex-wrap gap-2">
                        {attachedFiles.map(file => (
                            <div key={file.name} className="flex items-center gap-2 bg-slate-700 rounded-full py-1 px-3 text-xs text-white border-2 border-black">
                                <span>{file.name}</span>
                                <button onClick={() => onRemoveFile(file.name)} className="text-slate-400 hover:text-white">
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end gap-2 p-1">
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={(e) => onFilesChange(e.target.files)}
                className="hidden"
            />
            <button
                type="button"
                onClick={handleAttachClick}
                className="w-10 h-10 rounded-full text-slate-800 bg-slate-300 hover:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-colors comic-button"
                aria-label="Attach files"
            >
                <PaperclipIcon className="w-5 h-5" />
            </button>
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "Listening..." : placeholder}
                className="flex-1 bg-slate-200 resize-none focus:outline-none p-2 max-h-48 text-slate-800 placeholder-slate-500 rounded-lg border-2 border-black"
                rows={1}
                disabled={isLoading}
            />
            <button
                type="button"
                onClick={onToggleRecording}
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 relative comic-button ${
                    isRecording 
                    ? 'bg-red-500' 
                    : 'bg-slate-700 hover:bg-slate-900'
                }`}
                aria-label={isRecording ? 'Stop listening' : 'Start listening'}
            >
                {isRecording && <div className="absolute inset-0 rounded-full bg-red-500/50 animate-pulse"></div>}
                <MicrophoneIcon className="w-5 h-5 z-10" />
            </button>
            <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && attachedFiles.length === 0)}
                className="w-10 h-10 rounded-full bg-[var(--theme-color-main)] text-black flex items-center justify-center flex-shrink-0 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors comic-button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};
