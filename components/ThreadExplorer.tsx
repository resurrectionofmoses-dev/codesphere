
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { XIcon } from './icons/XIcon';
import { Message } from './Message';

interface ThreadExplorerProps {
  thread: {
    messages: ChatMessage[];
    activeTimestamp: Date;
  };
  onClose: () => void;
}

export const ThreadExplorer: React.FC<ThreadExplorerProps> = ({ thread, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const activeMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Scroll the active message into view when the component mounts/updates
    activeMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [thread.activeTimestamp]);


  return (
    <div 
      className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-glass shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] flex-shrink-0">
          <h2 className="font-bold text-lg text-slate-100">Conversation Thread</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-2">
            {thread.messages.map((msg, index) => {
                const isActive = msg.timestamp.getTime() === thread.activeTimestamp.getTime();
                return (
                    <div key={index} ref={isActive ? activeMessageRef : null} className="m-2">
                        <Message 
                            message={msg}
                            isReadOnly={true}
                            isThreadActive={isActive}
                        />
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
