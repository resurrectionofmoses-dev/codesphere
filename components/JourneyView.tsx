
import React, { useRef, useEffect } from 'react';
import type { ChatSession, ChatMessage } from '../types';
import { Message } from './Message';
import { InputBar } from './InputBar';
import { ChatHeader } from './ChatHeader';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface JourneyViewProps {
  session: ChatSession;
  onNavigate: (sessionId: string, direction: 'next' | 'prev') => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onInteractionSubmit: (messageTimestamp: Date, answer: string) => void;
  isInteractionActive: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-4">
        <div className="flex space-x-1">
            <div className="w-2 h-2 bg-[var(--theme-color-main)] rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-[var(--theme-color-main)] rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-[var(--theme-color-main)] rounded-full animate-pulse"></div>
        </div>
    </div>
);

const LessonChatView: React.FC<{ messages: ChatMessage[], isLoading: boolean, onInteractionSubmit: (messageTimestamp: Date, answer: string) => void; }> = ({ messages, isLoading, onInteractionSubmit }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const visibleMessages = messages.filter(m => !m.isAutoPrompt);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
            {visibleMessages.map((msg) => (
                <Message key={msg.timestamp.getTime()} message={msg} onInteractionSubmit={onInteractionSubmit} />
            ))}
             {isLoading && (
                <div className="flex items-start gap-4 p-4 md:p-6">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[var(--theme-color-bg-light)] text-[var(--theme-color-text)]" />
                    <div className="flex-1 pt-1"><LoadingIndicator /></div>
                </div>
            )}
            </div>
        </div>
    );
};


export const JourneyView: React.FC<JourneyViewProps> = ({ session, onNavigate, onSendMessage, isLoading, inputText, setInputText, isRecording, onToggleRecording, onInteractionSubmit, isInteractionActive }) => {
  if (!session.journey) return null;

  const { program, currentLessonIndex } = session.journey;
  const currentLesson = program.lessons[currentLessonIndex];
  
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === program.lessons.length - 1;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden md:block w-64 lg:w-72 bg-glass border-r border-[var(--glass-border)] flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-[var(--glass-border)]">
          <h2 className="text-lg font-bold text-slate-100 truncate">{program.title}</h2>
          <p className="text-sm text-slate-400">Lesson {currentLessonIndex + 1} of {program.lessons.length}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {program.lessons.map((lesson, index) => {
            const isCompleted = index < currentLessonIndex;
            const isCurrent = index === currentLessonIndex;
            return (
              <div
                key={lesson.id}
                className={`p-3 rounded-md transition-colors ${
                  isCurrent ? 'bg-[var(--theme-color-bg-light)]' : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                    {isCompleted ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0"/> : <div className={`w-5 h-5 flex-shrink-0 rounded-full border-2 ${isCurrent ? 'border-[var(--theme-color-text)]' : 'border-slate-600'}`} />}
                    <div>
                        <h3 className={`font-semibold ${isCurrent ? 'text-[var(--theme-color-text)]' : 'text-slate-300'}`}>{lesson.title}</h3>
                        <p className={`text-xs ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>{lesson.description}</p>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader session={session} isTtsEnabled={false} onToggleTts={() => {}} onCloseSession={() => {}} onToggleDrivingMode={() => {}} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--glass-border)] bg-slate-800/30">
                <h1 className="text-2xl font-bold text-slate-100">{currentLesson.title}</h1>
            </div>
            <LessonChatView messages={session.messages} isLoading={isLoading} onInteractionSubmit={onInteractionSubmit} />
        </div>

        <div className="p-4 border-t border-[var(--glass-border)]">
             <div className="max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-2">
                    <button onClick={() => onNavigate(session.id, 'prev')} disabled={isFirstLesson || isLoading} className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeftIcon className="w-4 h-4"/> Previous
                    </button>
                    <button onClick={() => onNavigate(session.id, 'next')} disabled={isLastLesson || isLoading} className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Next <ChevronRightIcon className="w-4 h-4"/>
                    </button>
                 </div>
                <InputBar onSendMessage={onSendMessage} isLoading={isLoading} inputText={inputText} setInputText={setInputText} isRecording={isRecording} onToggleRecording={onToggleRecording} attachedFiles={[]} onFilesChange={() => {}} onRemoveFile={() => {}} currentMode={session.mode} isDriving={false} onStopDriving={() => {}} isInteractionActive={isInteractionActive} />
             </div>
        </div>
      </div>
    </div>
  );
};
