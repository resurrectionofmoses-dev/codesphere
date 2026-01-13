
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Chat } from '@google/genai';
import { ChatView } from './components/ChatView';
import { InputBar } from './components/InputBar';
import type { ChatMessage, Mode, CustomAIConfig, AttachedFile, ChatSession, JourneyProgram, SpecialistStatusMap, SpecialistStatus } from './types';
import { SYSTEM_INSTRUCTIONS } from './constants';
import { startChatSession, sendMessage } from './services/geminiService';
import { CustomAIForm } from './components/CustomAIForm';
import { ChatHeader } from './components/ChatHeader';
import { SnippetCollectorBar } from './components/SnippetCollectorBar';
import { FocusSession } from './components/FocusSession';
import { ThreadExplorer } from './components/ThreadExplorer';
import { MultiSessionDock } from './components/MultiSessionDock';
import { AddSessionModal } from './components/AddSessionModal';
import { Launchpad } from './components/Launchpad';
import { JourneySelectorModal } from './components/JourneySelectorModal';
import { JourneyView } from './components/JourneyView';

// Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

const CUSTOM_AI_CONFIG_KEY = 'customAIConfig';
const SESSIONS_KEY = 'chatSessions';
const MAX_SESSIONS = 6;

// --- LocalStorage Helper Functions ---
const loadSessionsFromStorage = (): ChatSession[] => {
  try {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as any[];
    return parsed.map(s => ({
      ...s,
      messages: s.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        parentTimestamp: msg.parentTimestamp ? new Date(msg.parentTimestamp) : undefined
      })),
      chat: startChatSession(getSystemInstruction(s.mode, null), s.mode, s.messages)
    }));
  } catch (error) {
    console.error("Failed to load sessions from localStorage:", error);
    return [];
  }
};

const saveSessionsToStorage = (sessions: ChatSession[]) => {
  try {
    const storableSessions = sessions.map(({ chat, ...rest }) => rest);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(storableSessions));
  } catch (error) {
    console.error("Failed to save sessions to localStorage:", error);
  }
};

// --- Helper Hook ---
const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T>();
    useEffect(() => { ref.current = value; });
    return ref.current;
};

// --- File Reader Utility ---
const getMimeType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (fileName.toLowerCase().endsWith('.tar.gz')) {
        return 'application/gzip';
    }
    const mimeTypes: { [key: string]: string } = {
        // Text & Code
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'xml': 'application/xml',
        'md': 'text/markdown',
        'py': 'text/plain',
        'java': 'text/plain',
        'c': 'text/plain',
        'cpp': 'text/plain',
        'cs': 'text/plain',
        'go': 'text/plain',
        'php': 'text/plain',
        'rb': 'text/plain',
        'rs': 'text/plain',
        'swift': 'text/plain',
        'ts': 'text/plain',
        // Images
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'flac': 'audio/flac',
        // Video
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        // Documents
        'pdf': 'application/pdf',
        // Archives
        'zip': 'application/zip',
        'gz': 'application/gzip',
        'tar': 'application/x-tar',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
    };
    return mimeTypes[extension] || 'application/octet-stream';
};


const readFileAsBase64 = (file: File): Promise<AttachedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      const mimeType = file.type || getMimeType(file.name);
      resolve({ name: file.name, content: base64String, type: mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const getSystemInstruction = (mode: Mode, config: CustomAIConfig | null): string => {
    if (mode === 'custom' && config) {
        const { prompt, logicPrompt } = config;
        return logicPrompt ? `${prompt}\n\nIMPORTANT: You must strictly follow these rules at all times:\n${logicPrompt}` : prompt;
    }
    return SYSTEM_INSTRUCTIONS[mode];
};


// --- App Component ---
interface FocusSessionState { chat: Chat; messages: ChatMessage[]; isLoading: boolean; }
interface ThreadExplorerState { messages: ChatMessage[]; activeTimestamp: Date; }

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomAIConfig | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [collectedSnippets, setCollectedSnippets] = useState<Date[]>([]);
  const [focusSession, setFocusSession] = useState<FocusSessionState | null>(null);
  const [threadExplorer, setThreadExplorer] = useState<ThreadExplorerState | null>(null);
  const [isAddSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [isJourneyModalOpen, setJourneyModalOpen] = useState(false);
  const [isEditingCustomAI, setIsEditingCustomAI] = useState(false);
  const [specialistStatus, setSpecialistStatus] = useState<SpecialistStatusMap>({});
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const currentMode = activeSession?.mode;

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(CUSTOM_AI_CONFIG_KEY);
      if (savedConfig) setCustomConfig(JSON.parse(savedConfig));
    } catch (error) {
      console.error("Failed to load custom AI config:", error);
    }
    const savedSessions = loadSessionsFromStorage();
    setSessions(savedSessions);
    if (savedSessions.length > 0) {
      setActiveSessionId(savedSessions[0].id);
    }
  }, []);

  useEffect(() => {
    saveSessionsToStorage(sessions);
  }, [sessions]);
  
  const prevIsLoading = usePrevious(isLoading);

  useEffect(() => {
    if (prevIsLoading && !isLoading && isTtsEnabled && activeSession && activeSession.messages.length > 0) {
        const lastMessage = activeSession.messages[activeSession.messages.length - 1];
        if (lastMessage.sender === 'model' && lastMessage.content) {
            const sanitizedText = lastMessage.content.replace(/\[DELEGATE_START:.*?\][\s\S]*?\[DELEGATE_END:.*?\]/g, 'Delegated task completed.')
                                                .replace(/```[\s\S]*?```/g, ' A code block is shown. ')
                                                .replace(/\*\*|__|`|\[.*?\]\(.*?\)|#+\s/g, '')
                                                .replace(/^\s*[-*+]\s/gm, '. ').trim();
            if (sanitizedText) {
                const utterance = new SpeechSynthesisUtterance(sanitizedText);
                window.speechSynthesis.speak(utterance);
            }
        }
    }
  }, [isLoading, prevIsLoading, isTtsEnabled, activeSession]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      setInputText(finalTranscript);
      speechTimeoutRef.current = window.setTimeout(() => {
        handleSendMessage(finalTranscript);
        handleToggleRecording(); 
      }, 1500);
    };
    recognition.onend = () => { setIsRecording(false); if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current); };
    recognition.onerror = (event) => { console.error('Speech recognition error', event.error); setIsRecording(false); }
    recognitionRef.current = recognition;
    return () => { recognitionRef.current?.stop(); if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current); };
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      setInputText('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const updateSessionMessages = (sessionId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: updater(s.messages) } : s));
  };

  const handleSpecialistStatusChange = useCallback((specialist: Mode, status: SpecialistStatus) => {
    setSpecialistStatus(prev => ({ ...prev, [specialist]: status }));
  }, []);
  
  const handleSendMessage = useCallback(async (text: string, isAuto: boolean = false) => {
    if ((!text.trim() && attachedFiles.length === 0 && !isAuto) || isLoading || !activeSession) return;
    
    if (activeSession.mode === 'squad') {
      setSpecialistStatus({});
    }
    if (!isAuto) {
      setInputText('');
    }
    window.speechSynthesis.cancel();
    setIsLoading(true);
    
    const lastMessage = activeSession.messages.length > 0 ? activeSession.messages[activeSession.messages.length - 1] : null;
    const userMessage: ChatMessage = { sender: 'user', content: text, timestamp: new Date(), parentTimestamp: lastMessage?.timestamp, attachedFiles: isAuto ? [] : attachedFiles.map(f => f.name), isAutoPrompt: isAuto };
    const modelPlaceholder: ChatMessage = { sender: 'model', content: '', timestamp: new Date(userMessage.timestamp.getTime() + 1), parentTimestamp: userMessage.timestamp };
    
    updateSessionMessages(activeSession.id, (msgs) => [...msgs, userMessage, modelPlaceholder]);

    try {
      let fullResponse = '';
      const stream = sendMessage(activeSession.chat, text, isAuto ? [] : attachedFiles, handleSpecialistStatusChange, activeSession.mode);
      
      for await (const update of stream) {
        if (update.textChunk) {
            fullResponse += update.textChunk;
            updateSessionMessages(activeSession.id, (msgs) => {
                const newMsgs = [...msgs];
                newMsgs[newMsgs.length - 1].content = fullResponse;
                return newMsgs;
            });
        }
        if (update.interaction) {
            const interaction = update.interaction;
            updateSessionMessages(activeSession.id, (msgs) => {
                const newMsgs = [...msgs];
                newMsgs[newMsgs.length - 1].interactionPrompt = { prompt: interaction.prompt };
                return newMsgs;
            });
            setIsInteractionActive(true);
            break; 
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateSessionMessages(activeSession.id, (msgs) => {
        const newMsgs = [...msgs];
        newMsgs[newMsgs.length - 1].content = "Sorry, I encountered an error. Please try again.";
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      if (!isAuto) {
        setAttachedFiles([]);
      }
    }
  }, [isLoading, attachedFiles, activeSession, handleSpecialistStatusChange]);
  
  const handleInteractionSubmit = (messageTimestamp: Date, answer: string) => {
      if (!activeSession) return;
      
      updateSessionMessages(activeSession.id, (msgs) => {
          return msgs.map(msg => {
              if (msg.timestamp.getTime() === messageTimestamp.getTime() && msg.interactionPrompt) {
                  return {
                      ...msg,
                      interactionPrompt: {
                          ...msg.interactionPrompt,
                          submittedAnswer: answer,
                      }
                  };
              }
              return msg;
          });
      });

      setIsInteractionActive(false);
      handleSendMessage(answer, true);
  };

  const handleAddSession = (mode: Mode) => {
    setAddSessionModalOpen(false);
    if (sessions.length >= MAX_SESSIONS) return;
    
    if (mode === 'custom' && !customConfig) {
      setIsEditingCustomAI(true);
      return;
    }
    if (mode === 'journey') {
      setJourneyModalOpen(true);
      return;
    }

    const nameMap: Record<Mode, string> = { learn: "Learn", build: "Build", refactor: "Refactor", reinforcement: "Reinforce", debug: "Debug", logic: "Logic", codesphere: "CodeSphere", academy: "Academy", microcheck: "Micro-Check", nanolinter: "Nano-Linter", academic: "Academic", templar: "Templar", bountytemplar: "Bounty Templar", quantumguardian: "Quantum Guardian", omegacoder: "Omega Coder", squad: "Squad", custom: customConfig?.name || "Custom AI", focus: "Focus", journey: "Journey", judge: "Judge", security: "Security", optimizer: "Optimizer", documenter: "Documenter", hope: "Hope" };
    const instruction = getSystemInstruction(mode, customConfig);
    const welcomeMessage: ChatMessage = { sender: 'model', content: `Welcome to your new **${nameMap[mode]}** session! How can I help?`, timestamp: new Date() };
    
    const newSession: ChatSession = {
      id: uuidv4(),
      mode,
      messages: [welcomeMessage],
      chat: startChatSession(instruction, mode, []),
      name: nameMap[mode],
      isDriving: false,
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };
  
  const handleStartJourney = (program: JourneyProgram) => {
    if (sessions.length >= MAX_SESSIONS) return;
    setJourneyModalOpen(false);

    const newSession: ChatSession = {
        id: uuidv4(),
        mode: 'journey',
        messages: [],
        chat: startChatSession(SYSTEM_INSTRUCTIONS.journey, 'journey', []),
        name: program.title,
        isDriving: false,
        journey: {
            program,
            currentLessonIndex: 0,
        },
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);

    const firstLessonPrompt = `Let's begin the journey "${program.title}". Please teach me the first lesson: "${program.lessons[0].title}". Here is the content guideline: "${program.lessons[0].content}"`;
    handleSendMessageInSession(newSession, firstLessonPrompt);
  };

  const handleNavigateLesson = (sessionId: string, direction: 'next' | 'prev') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.journey) return;
    
    const { program, currentLessonIndex } = session.journey;
    let newIndex = direction === 'next' ? currentLessonIndex + 1 : currentLessonIndex - 1;

    if (newIndex >= 0 && newIndex < program.lessons.length) {
        const updatedSession = { ...session, journey: { ...session.journey, currentLessonIndex: newIndex }};
        setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
        
        const nextLesson = program.lessons[newIndex];
        const lessonPrompt = `Great, let's move to the next lesson: "${nextLesson.title}". Here is the content guideline: "${nextLesson.content}"`;
        handleSendMessageInSession(updatedSession, lessonPrompt);
    }
  };

  const handleSendMessageInSession = useCallback(async (session: ChatSession, text: string) => {
    setIsLoading(true);
    
    const userMessage: ChatMessage = { sender: 'user', content: text, timestamp: new Date(), isAutoPrompt: true };
    const modelPlaceholder: ChatMessage = { sender: 'model', content: '', timestamp: new Date(userMessage.timestamp.getTime() + 1), parentTimestamp: userMessage.timestamp };
    
    updateSessionMessages(session.id, msgs => [...msgs, userMessage, modelPlaceholder]);

    try {
      let fullResponse = '';
      const stream = sendMessage(session.chat, text, []);
      for await (const update of stream) {
        if(update.textChunk) {
            fullResponse += update.textChunk;
            updateSessionMessages(session.id, msgs => {
                const newMsgs = [...msgs];
                newMsgs[newMsgs.length - 1].content = fullResponse;
                return newMsgs;
            });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateSessionMessages(session.id, msgs => {
          const newMsgs = [...msgs];
          newMsgs[newMsgs.length - 1].content = "Sorry, I encountered an error. Please try again.";
          return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleCloseSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const handleSaveCustomConfig = (config: CustomAIConfig) => {
    localStorage.setItem(CUSTOM_AI_CONFIG_KEY, JSON.stringify(config));
    setCustomConfig(config);
    setIsEditingCustomAI(false);
    if (sessions.length < MAX_SESSIONS) {
        handleAddSession('custom');
    }
  };
  
  const handleToggleDrivingMode = () => {
    if (!activeSession) return;
    const isCurrentlyDriving = !!activeSession.isDriving;

    if (!isCurrentlyDriving && !inputText.trim()) {
        alert("Please provide an initial goal in the input box before starting Driving Mode.");
        return;
    }

    const goal = isCurrentlyDriving ? activeSession.initialGoal : inputText;
    
    setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
            ? { ...s, isDriving: !isCurrentlyDriving, initialGoal: goal }
            : s
    ));

    if (!isCurrentlyDriving) {
        handleSendMessage(inputText);
        setInputText('');
    }
  };

  const driveAI = useCallback(async () => {
    if (!activeSession || !activeSession.isDriving || isLoading) return;

    const goal = activeSession.initialGoal;
    const lastModelResponse = activeSession.messages.filter(m => m.sender === 'model').pop()?.content || '';

    const metaPrompt = `You are in 'Driving Mode'. Your overall goal is: "${goal}". The last step you completed was to generate the following output: "${lastModelResponse.substring(0, 300)}...". Based on this, what is the single next logical step to continue development? Formulate this step as a short, clear prompt that you will execute next. Respond with ONLY the prompt text, nothing else.`;
    
    const metaChat = startChatSession("You are a meta-controller for an AI developer. Your job is to determine the next step.", 'custom', []);
    const result = await metaChat.sendMessage({ message: metaPrompt });
    // FIX: The `text` property of the `GenerateContentResponse` object is a getter, not a method.
    const nextPrompt = result.text;

    if (nextPrompt) {
        handleSendMessage(nextPrompt, true);
    } else {
        console.log("AI decided to stop driving.");
        handleToggleDrivingMode();
    }
  }, [activeSession, isLoading, handleSendMessage]);

  useEffect(() => {
    if (activeSession?.isDriving && !isLoading && activeSession.messages.length > 0 && activeSession.messages[activeSession.messages.length - 1].sender === 'model') {
        const driveTimeout = setTimeout(() => {
            driveAI();
        }, 2000);
        return () => clearTimeout(driveTimeout);
    }
  }, [activeSession?.messages, activeSession?.isDriving, isLoading, driveAI]);


  const handleFilesChange = async (files: FileList | null) => { if (files) setAttachedFiles(await Promise.all(Array.from(files).map(readFileAsBase64))); };
  const handleRemoveFile = (fileName: string) => { setAttachedFiles(prev => prev.filter(f => f.name !== fileName)); };
  const handleToggleSnippet = (timestamp: Date) => { setCollectedSnippets(prev => prev.some(t => t.getTime() === timestamp.getTime()) ? prev.filter(t => t.getTime() !== timestamp.getTime()) : [...prev, timestamp]); };
  const handleClearSnippets = () => setCollectedSnippets([]);
  const handleCopyAllSnippets = () => { if (activeSession) navigator.clipboard.writeText(activeSession.messages.filter(msg => collectedSnippets.some(ts => ts.getTime() === msg.timestamp.getTime())).map(msg => msg.content).join('\n\n---\n\n')); };
  const handleStartFocusSession = (message: ChatMessage) => { /* ... implementation ... */ };
  const handleCloseFocusSession = () => setFocusSession(null);
  const handleSendMessageInFocus = useCallback(async (text: string) => { /* ... implementation ... */ }, [focusSession]);
  
  const handleStartThreadExplorer = (timestamp: Date) => {
    if (!activeSession) return;

    const messageMap: Map<number, ChatMessage> = new Map(activeSession.messages.map(m => [m.timestamp.getTime(), m]));
    const thread: ChatMessage[] = [];
    let currentMessage = messageMap.get(timestamp.getTime());

    while (currentMessage) {
        thread.unshift(currentMessage);
        if (currentMessage.parentTimestamp) {
            currentMessage = messageMap.get(currentMessage.parentTimestamp.getTime());
        } else {
            currentMessage = undefined;
        }
    }
    
    if (thread.length > 0) {
        setThreadExplorer({ messages: thread, activeTimestamp: timestamp });
    }
  };
  const handleCloseThreadExplorer = () => setThreadExplorer(null);


  const renderMainView = () => {
    if (isEditingCustomAI) {
      return <CustomAIForm onSave={handleSaveCustomConfig} onDelete={() => {}} initialConfig={customConfig} />;
    }
    if (!activeSession) {
      return <Launchpad onStartJourney={() => setJourneyModalOpen(true)} onStartFreestyle={() => setAddSessionModalOpen(true)} />;
    }
    if (activeSession.mode === 'journey' && activeSession.journey) {
        return <JourneyView session={activeSession} onNavigate={handleNavigateLesson} onSendMessage={handleSendMessage} isLoading={isLoading} inputText={inputText} setInputText={setInputText} isRecording={isRecording} onToggleRecording={handleToggleRecording} onInteractionSubmit={handleInteractionSubmit} isInteractionActive={isInteractionActive} />;
    }
    return (
      <>
        <ChatHeader session={activeSession} isTtsEnabled={isTtsEnabled} onToggleTts={() => setIsTtsEnabled(p => !p)} onCloseSession={handleCloseSession} onToggleDrivingMode={handleToggleDrivingMode} />
        <ChatView 
          key={activeSession.id}
          messages={activeSession.messages} 
          isLoading={isLoading} 
          collectedSnippets={collectedSnippets} 
          onToggleSnippet={handleToggleSnippet} 
          onStartFocusSession={handleStartFocusSession}
          onStartThreadExplorer={handleStartThreadExplorer}
          currentMode={activeSession.mode}
          specialistStatus={specialistStatus}
          onInteractionSubmit={handleInteractionSubmit}
          isInteractionActive={isInteractionActive}
        />
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} inputText={inputText} setInputText={setInputText} isRecording={isRecording} onToggleRecording={handleToggleRecording} attachedFiles={attachedFiles} onFilesChange={handleFilesChange} onRemoveFile={handleRemoveFile} currentMode={activeSession.mode} isDriving={!!activeSession.isDriving} onStopDriving={handleToggleDrivingMode} isInteractionActive={isInteractionActive} />
      </>
    );
  };

  return (
    <div className="h-screen w-full font-sans text-gray-200" data-theme={currentMode || 'custom'}>
      <div className="flex h-full p-4 gap-4">
        <MultiSessionDock sessions={sessions} activeSessionId={activeSessionId} onSwitchSession={setActiveSessionId} onAddSession={() => setAddSessionModalOpen(true)} onCloseSession={handleCloseSession} />
        <main className="flex flex-col flex-1 h-full overflow-hidden relative comic-panel bg-slate-800">
          {renderMainView()}
          {collectedSnippets.length > 0 && <SnippetCollectorBar count={collectedSnippets.length} onCopyAll={handleCopyAllSnippets} onClear={handleClearSnippets} />}
          {focusSession && <FocusSession session={focusSession} onClose={handleCloseFocusSession} onSendMessage={handleSendMessageInFocus} />}
          {threadExplorer && <ThreadExplorer thread={threadExplorer} onClose={handleCloseThreadExplorer} />}
        </main>
      </div>
      {isAddSessionModalOpen && <AddSessionModal onClose={() => setAddSessionModalOpen(false)} onSelectMode={handleAddSession} />}
      {isJourneyModalOpen && <JourneySelectorModal onClose={() => setJourneyModalOpen(false)} onSelectJourney={handleStartJourney} />}
    </div>
  );
};

export default App;