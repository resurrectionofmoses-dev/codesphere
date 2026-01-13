import type { Chat } from '@google/genai';

export type Mode = 'learn' | 'build' | 'refactor' | 'custom' | 'squad' | 'codesphere' | 'logic' | 'debug' | 'focus' | 'journey' | 'judge' | 'security' | 'optimizer' | 'documenter' | 'reinforcement' | 'academy' | 'microcheck' | 'nanolinter' | 'academic' | 'templar' | 'bountytemplar' | 'quantumguardian' | 'omegacoder' | 'hope';

export type SpecialistStatus = 'idle' | 'working' | 'complete' | 'error';
export type SpecialistStatusMap = Partial<Record<Mode, SpecialistStatus>>;

export interface InteractionPrompt {
  prompt: string;
  submittedAnswer?: string;
}

export interface ChatMessage {
  sender: 'user' | 'model';
  content: string;
  timestamp: Date;
  parentTimestamp?: Date;
  attachedFiles?: string[];
  isAutoPrompt?: boolean;
  interactionPrompt?: InteractionPrompt;
}

export interface CustomAIConfig {
  name: string;
  prompt: string;
  logicPrompt: string;
}

export interface AttachedFile {
  name:string;
  content: string; // base64
  type: string;
}

export interface ImplementationFile {
  filename: string;
  code: string;
}

export interface ImplementationResponse {
  files: ImplementationFile[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // The core teaching material or prompt for the AI
}

export interface JourneyProgram {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export type JudgeRating = 'Mild' | 'Hot' | 'Fire' | 'Diablo';

export interface JudgeResultResponse {
  rating: JudgeRating;
  goodPoints: string[];
  improvementPoints: string[];
  verdict: string;
}

export interface ChatSession {
  id: string;
  mode: Mode;
  messages: ChatMessage[];
  chat: Chat;
  name: string;
  isDriving?: boolean;
  initialGoal?: string;
  journey?: {
    program: JourneyProgram;
    currentLessonIndex: number;
  };
}