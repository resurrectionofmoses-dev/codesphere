
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import { XIcon } from './icons/XIcon';
import { Message } from './Message';

interface FocusSessionProps {
  session: {
    chat: Chat;
    messages: ChatMessage[];
    isLoading: boolean;
  };
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-4">
        <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
        </div>
    </div>
);

export const FocusSession: React.FC<FocusSessionProps> = ({ session, onClose, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay visibility for transition
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-glass shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] flex-shrink-0">
          <h2 className="font-bold text-lg text-slate-100">Focus Session</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {session.messages.map((msg, index) => (
                <div key={index} className="border-b border-slate-800/50">
                    <Message 
                        message={msg}
                        isReadOnly={true}
                    />
                </div>
            ))}
            {session.isLoading && <LoadingIndicator />}
        </div>
        
        <div className="p-4 border-t border-[var(--glass-border)]">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 bg-transparent focus:outline-none px-2 text-slate-200 placeholder-slate-500"
                    disabled={session.isLoading}
                />
                <button
                    type="submit"
                    disabled={session.isLoading || !inputText.trim()}
                    className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center flex-shrink-0 disabled:bg-slate-700 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
