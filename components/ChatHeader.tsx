import React from 'react';
import type { Mode, ChatSession } from '../types';
import { LearnIcon } from './icons/LearnIcon';
import { BuildIcon } from './icons/BuildIcon';
import { RefactorIcon } from './icons/RefactorIcon';
import { CustomIcon } from './icons/CustomIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { ImplementIcon } from './icons/ImplementIcon';
import { LogicIcon } from './icons/LogicIcon';
import { DebugIcon } from './icons/DebugIcon';
import { FocusIcon } from './icons/FocusIcon';
import { XIcon } from './icons/XIcon';
import { SteeringWheelIcon } from './icons/SteeringWheelIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { GavelIcon } from './icons/GavelIcon';
import { SquadIcon } from './icons/SquadIcon';
import { ReinforcementIcon } from './icons/ReinforcementIcon';
import { MortarBoardIcon } from './icons/MortarBoardIcon';
import { MicroCheckIcon } from './icons/MicroCheckIcon';
import { NanoLinterIcon } from './icons/NanoLinterIcon';
import { AcademicIcon } from './icons/AcademicIcon';
import { TemplarIcon } from './icons/TemplarIcon';
import { BountyTemplarIcon } from './icons/BountyTemplarIcon';
import { QuantumGuardianIcon } from './icons/QuantumGuardianIcon';
import { OmegaCoderIcon } from './icons/OmegaCoderIcon';
import { SecurityIcon } from './icons/SecurityIcon';
import { OptimizerIcon } from './icons/OptimizerIcon';
import { DocumenterIcon } from './icons/DocumenterIcon';
import { HopeIcon } from './icons/HopeIcon';

interface ChatHeaderProps {
  session: ChatSession;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onCloseSession: (sessionId: string) => void;
  onToggleDrivingMode: () => void;
}

export const modeDetails: Record<Mode, { name: string; description: string; icon: React.FC<{className?: string}> }> = {
  learn: { name: 'Learn', description: 'Understand concepts and see code examples.', icon: LearnIcon },
  build: { name: 'Build', description: 'Get project plans and step-by-step guidance.', icon: BuildIcon },
  refactor: { name: 'Refactor', description: 'Analyze, optimize, and fix your code.', icon: RefactorIcon },
  omegacoder: { name: 'Omega Coder', description: 'Synthesizes multiple code blocks into one ultimate function.', icon: OmegaCoderIcon },
  reinforcement: { name: 'Reinforce', description: 'Strengthen code with best practices and feedback.', icon: ReinforcementIcon },
  debug: { name: 'Debug', description: 'Find and fix bugs in your code.', icon: DebugIcon },
  logic: { name: 'Logic', description: 'Translate pseudocode or ideas into code.', icon: LogicIcon },
  codesphere: { name: 'CodeSphere', description: 'Generate deployable projects from a prompt.', icon: ImplementIcon },
  academy: { name: 'Academy', description: 'Learn how to generate complete projects.', icon: MortarBoardIcon },
  microcheck: { name: 'Micro-Check', description: 'Rapidly inspect code snippets for issues.', icon: MicroCheckIcon },
  nanolinter: { name: 'Nano-Linter', description: 'Get precise, line-by-line code analysis.', icon: NanoLinterIcon },
  academic: { name: 'Academic', description: 'Cite sources and format documents.', icon: AcademicIcon },
  templar: { name: 'Templar', description: 'Purify code with zealous analysis.', icon: TemplarIcon },
  bountytemplar: { name: 'Bounty Templar', description: 'Hunt down specific bugs or features.', icon: BountyTemplarIcon },
  quantumguardian: { name: 'Quantum Guardian', description: 'Protect qubits and ensure coherence.', icon: QuantumGuardianIcon },
  squad: { name: 'Squad', description: 'Orchestrate an 8-agent AI squad for complex projects.', icon: SquadIcon },
  custom: { name: 'Your AI', description: 'Chat with your personalized assistant.', icon: CustomIcon },
  focus: { name: 'Focus', description: 'Deep dive into a specific topic.', icon: FocusIcon },
  journey: { name: 'Journey', description: 'Follow a guided learning path.', icon: BookOpenIcon },
  judge: { name: 'Judge', description: 'Critique code by the Taco Bell Standard.', icon: GavelIcon },
  security: { name: 'Security', description: 'Analyze code for vulnerabilities.', icon: SecurityIcon },
  optimizer: { name: 'Optimizer', description: 'Improve code performance.', icon: OptimizerIcon },
  documenter: { name: 'Documenter', description: 'Write code documentation.', icon: DocumenterIcon },
  hope: { name: 'Hope', description: 'Get encouragement and motivation when you feel stuck.', icon: HopeIcon },
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({ session, isTtsEnabled, onToggleTts, onCloseSession, onToggleDrivingMode }) => {
  const details = modeDetails[session.mode];
  const Icon = details.icon;
  const isDriving = !!session.isDriving;

  return (
    <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-slate-800 rounded-t-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-300 border-2 border-black flex-shrink-0">
             <Icon className="w-8 h-8 text-black" />
          </div>
          <div className="min-w-0">
              <h2 className="font-comic-header text-3xl text-white leading-tight truncate">{session.name}</h2>
              <p className="text-slate-300 text-sm leading-tight truncate -mt-1">{details.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onToggleDrivingMode}
                className={`p-2 rounded-full transition-colors duration-200 flex-shrink-0 comic-button ${
                    isDriving
                    ? 'text-green-900 bg-green-400' 
                    : 'text-slate-800 bg-slate-300 hover:bg-slate-100'
                }`}
                aria-label={isDriving ? 'Disable Driving Mode' : 'Enable Driving Mode'}
            >
                <SteeringWheelIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={onToggleTts}
                className={`p-2 rounded-full transition-colors duration-200 flex-shrink-0 comic-button ${
                    isTtsEnabled 
                    ? 'text-cyan-900 bg-cyan-400' 
                    : 'text-slate-800 bg-slate-300 hover:bg-slate-100'
                }`}
                aria-label={isTtsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
            >
                {isTtsEnabled ? <SpeakerIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
            </button>
            <button
                onClick={() => onCloseSession(session.id)}
                className="p-2 rounded-full text-slate-800 bg-slate-300 hover:bg-red-400 hover:text-white transition-colors duration-200 flex-shrink-0 comic-button"
                aria-label="Close session"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};