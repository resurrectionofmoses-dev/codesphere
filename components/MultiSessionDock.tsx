
import React from 'react';
import type { ChatSession, Mode } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { modeDetails } from './ChatHeader';

interface MultiSessionDockProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSwitchSession: (sessionId: string) => void;
  onAddSession: () => void;
  onCloseSession: (sessionId: string) => void;
}

const MAX_PLUGS_PER_SIDE = 3;

const SessionPlug: React.FC<{ session: ChatSession; isActive: boolean; onSwitch: () => void; }> = ({ session, isActive, onSwitch }) => {
    const details = modeDetails[session.mode];
    const Icon = details.icon;

    return (
        <div className="relative group">
            <button
                onClick={onSwitch}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative bg-glass border-2 ${
                    isActive ? 'border-[var(--theme-color-main)] shadow-lg' : 'border-transparent hover:border-slate-600'
                }`}
                style={isActive ? {boxShadow: `0 0 10px var(--theme-color-main)`} : {}}
                data-theme={session.mode}
                aria-label={`Switch to ${session.name} session`}
            >
                <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[var(--theme-color-text)]' : 'text-slate-400 group-hover:text-slate-200'}`} />
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 w-max bg-slate-900 text-white text-sm rounded-md px-3 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity delay-300 z-50">
                {session.name}
            </div>
        </div>
    );
};

const AddPlug: React.FC<{ onAdd: () => void; disabled: boolean }> = ({ onAdd, disabled }) => {
    return (
        <button
            onClick={onAdd}
            disabled={disabled}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-glass border-2 border-dashed border-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label="Add new session"
        >
            <PlusIcon className="w-6 h-6 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </button>
    );
};

export const MultiSessionDock: React.FC<MultiSessionDockProps> = ({ sessions, activeSessionId, onSwitchSession, onAddSession, onCloseSession }) => {
  const leftSessions = sessions.slice(0, MAX_PLUGS_PER_SIDE);
  const rightSessions = sessions.slice(MAX_PLUGS_PER_SIDE);

  return (
    <>
        {/* Left Dock */}
        <div className="hidden md:flex flex-col items-center justify-center gap-4 p-2">
            {Array.from({ length: MAX_PLUGS_PER_SIDE }).map((_, index) => {
                const session = leftSessions[index];
                return session ? (
                    <SessionPlug key={session.id} session={session} isActive={session.id === activeSessionId} onSwitch={() => onSwitchSession(session.id)} />
                ) : (
                    <AddPlug key={`add-${index}`} onAdd={onAddSession} disabled={sessions.length >= 6} />
                );
            })}
        </div>

        {/* Right Dock */}
         <div className="hidden md:flex flex-col items-center justify-center gap-4 p-2">
            {Array.from({ length: MAX_PLUGS_PER_SIDE }).map((_, index) => {
                const session = rightSessions[index];
                return session ? (
                    <SessionPlug key={session.id} session={session} isActive={session.id === activeSessionId} onSwitch={() => onSwitchSession(session.id)} />
                ) : (
                     <AddPlug key={`add-${index + MAX_PLUGS_PER_SIDE}`} onAdd={onAddSession} disabled={sessions.length >= 6} />
                );
            })}
        </div>
    </>
  );
};
