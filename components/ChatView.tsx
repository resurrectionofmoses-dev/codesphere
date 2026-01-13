
import React, { useEffect, useRef } from 'react';
import type { ChatMessage, SpecialistStatusMap, Mode } from '../types';
import { Message } from './Message';
import { SquadStatusTracker } from './SquadStatusTracker';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  collectedSnippets: Date[];
  onToggleSnippet: (timestamp: Date) => void;
  onStartFocusSession: (message: ChatMessage) => void;
  onStartThreadExplorer: (timestamp: Date) => void;
  currentMode: Mode;
  specialistStatus: SpecialistStatusMap;
  onInteractionSubmit: (messageTimestamp: Date, answer: string) => void;
  isInteractionActive: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-4">
        <div className="flex space-x-1.5">
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce"></div>
        </div>
    </div>
);

export const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading, collectedSnippets, onToggleSnippet, onStartFocusSession, onStartThreadExplorer, currentMode, specialistStatus, onInteractionSubmit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-300 rounded-t-lg">
      <div className="max-w-4xl mx-auto w-full p-4 space-y-4">
        {isLoading && currentMode === 'squad' && Object.keys(specialistStatus).length > 0 && (
          <SquadStatusTracker status={specialistStatus} />
        )}
        {messages.map((msg) => {
            const isModel = msg.sender === 'model';
            return (
                 <div key={msg.timestamp.getTime()} className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'}`}>
                    <Message 
                        message={msg} 
                        isCollected={collectedSnippets.some(ts => ts.getTime() === msg.timestamp.getTime())}
                        onToggleSnippet={onToggleSnippet}
                        onStartFocusSession={onStartFocusSession}
                        onStartThreadExplorer={onStartThreadExplorer}
                        onInteractionSubmit={onInteractionSubmit}
                    />
                </div>
            )
        })}
        {isLoading && messages[messages.length - 1]?.sender === 'model' && !messages[messages.length - 1]?.content &&(
             <div className="flex items-start gap-4 p-4 md:p-6 w-full justify-start">
                <div className="flex items-end gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-slate-400" />
                    <div className="message-bubble message-bubble-model">
                        <LoadingIndicator />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
