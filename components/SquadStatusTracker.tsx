
import React from 'react';
import type { SpecialistStatusMap, Mode, SpecialistStatus } from '../types';
import { modeDetails } from './ChatHeader';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XIcon } from './icons/XIcon';
import { BuildIcon, LearnIcon, RefactorIcon, DebugIcon, LogicIcon, SecurityIcon, OptimizerIcon, DocumenterIcon } from './icons';


const specialistModes: Mode[] = ['build', 'learn', 'refactor', 'debug', 'logic', 'security', 'optimizer', 'documenter'];

const StatusIndicator: React.FC<{ status: SpecialistStatus }> = ({ status }) => {
  switch (status) {
    case 'working':
      return <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />;
    case 'complete':
      return <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />;
    case 'error':
      return <XIcon className="w-3.5 h-3.5 text-red-500" />;
    case 'idle':
    default:
      return <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />;
  }
};

const statusText: Record<SpecialistStatus, string> = {
    idle: 'Awaiting Task',
    working: 'Executing...',
    complete: 'Task Complete',
    error: 'Error'
};

const statusColors: Record<SpecialistStatus, string> = {
    idle: 'border-slate-400/50',
    working: 'border-blue-500',
    complete: 'border-green-500',
    error: 'border-red-500',
};

export const SquadStatusTracker: React.FC<{ status: SpecialistStatusMap }> = ({ status }) => {
  return (
    <div className="comic-panel-light p-4 my-4 fade-in">
      <h3 className="font-comic-header text-2xl text-slate-900 mb-4 text-center">Squad Task Force</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {specialistModes.map(mode => {
          const details = modeDetails[mode];
          const currentStatus = status[mode] || 'idle';
          const Icon = details.icon;
          return (
            <div 
              key={mode} 
              className={`flex flex-col items-center text-center p-3 bg-white rounded-lg border-4 border-black transition-all duration-300 ${statusColors[currentStatus]}`}
              style={{ boxShadow: currentStatus === 'working' ? '0 0 8px var(--tw-color-blue-500)' : 'none' }}
            >
              <div 
                className="w-10 h-10 mb-2 rounded-full flex items-center justify-center border-2 border-black"
                style={{ backgroundColor: `var(--theme-color-bg-light)` }}
                data-theme={mode}
              >
                  <Icon className="w-6 h-6 text-slate-800" />
              </div>
              <div className="font-bold text-sm text-slate-800 truncate leading-tight">{details.name}</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                  <StatusIndicator status={currentStatus} />
                  <span className="text-xs text-slate-600 font-semibold">{statusText[currentStatus]}</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
