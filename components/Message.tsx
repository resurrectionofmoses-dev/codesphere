
import React from 'react';
import * as ReactKatex from 'react-katex';
import type { ChatMessage, ImplementationResponse, JudgeResultResponse } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { CodeBlock } from './CodeBlock';
import { DelegationBlock } from './DelegationBlock';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ImplementationResult } from './ImplementationResult';
import { PlusSquareIcon } from './icons/PlusSquareIcon';
import { CheckSquareIcon } from './icons/CheckSquareIcon';
import { FocusIcon } from './icons/FocusIcon';
import { GitBranchIcon } from './icons/GitBranchIcon';
import { SteeringWheelIcon } from './icons/SteeringWheelIcon';
import { JudgeResult } from './JudgeResult';
import { InteractionPrompt } from './InteractionPrompt';

interface MessageProps {
  message: ChatMessage;
  isCollected?: boolean;
  onToggleSnippet?: (timestamp: Date) => void;
  onStartFocusSession?: (message: ChatMessage) => void;
  onStartThreadExplorer?: (timestamp: Date) => void;
  isThreadActive?: boolean;
  isReadOnly?: boolean;
  onInteractionSubmit?: (messageTimestamp: Date, answer: string) => void;
}

const parseText = (text: string): React.ReactNode[] => {
    const regex = /(```[\w]*\n[\s\S]*?\n```|\$\$[\s\S]*?\$\$|\$.*?\$|\*\*.*?\*\*)/g;
    const parts = text.split(regex);

    return parts.filter(part => part).map((part, index) => {
        const codeBlockMatch = part.match(/^```(\w*)\n([\s\S]*?)\n```$/);
        if (codeBlockMatch) {
            const [, language, code] = codeBlockMatch;
            return <CodeBlock key={index} language={language} code={code.trim()} />;
        }

        const blockMathMatch = part.match(/^\$\$([\s\S]*?)\$\$$/);
        if (blockMathMatch) {
            return <ReactKatex.BlockMath key={index} math={blockMathMatch[1].trim()} />;
        }

        const inlineMathMatch = part.match(/^\$([\s\S]*?)\$$/);
        if (inlineMathMatch) {
            return <ReactKatex.InlineMath key={index} math={inlineMathMatch[1].trim()} />;
        }
        
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        return part;
    });
};

const parseContent = (content: string, isModel: boolean): React.ReactNode => {
  if (isModel) {
      try {
          const cleanedContent = content.replace(/^```json\s*|```\s*$/g, '');
          const judgeParsed = JSON.parse(cleanedContent) as JudgeResultResponse;
          if (judgeParsed && judgeParsed.rating && judgeParsed.verdict) {
              return <JudgeResult response={judgeParsed} />;
          }
      } catch (e) { /* Fallthrough */ }

      try {
          const cleanedContent = content.replace(/^```json\s*|```\s*$/g, '');
          const implParsed = JSON.parse(cleanedContent) as ImplementationResponse;
          if (implParsed && Array.isArray(implParsed.files) && implParsed.files.length > 0) {
              return <ImplementationResult response={implParsed} />;
          }
      } catch (e) { /* Fallthrough to markdown */ }
  }

  const parts = content.split(/(\[DELEGATE_START:(\w+)\][\s\S]*?\[DELEGATE_END:\2\])/g);
  
  return parts.filter(part => part).map((part, index) => {
      const delegateMatch = part.match(/^\[DELEGATE_START:(\w+)\]([\s\S]*?)\[DELEGATE_END:\1\]$/);

      if (delegateMatch) {
          const [, specialist, innerContent] = delegateMatch;
          return (
              <DelegationBlock key={index} specialist={specialist}>
                  {parseContent(innerContent, true)}
              </DelegationBlock>
          );
      }
      
      return <div key={index} className="whitespace-pre-wrap leading-relaxed">{parseText(part)}</div>;
  });
};


const MessageContent: React.FC<{ message: ChatMessage; isModel: boolean, onInteractionSubmit?: (messageTimestamp: Date, answer: string) => void; }> = ({ message, isModel, onInteractionSubmit }) => {
  return (
    <div>
        {message.attachedFiles && message.attachedFiles.length > 0 && (
            <div className="mb-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold mb-2">
                    <PaperclipIcon className="w-4 h-4" />
                    <span>{message.attachedFiles.length} files attached</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {message.attachedFiles.map(name => <li key={name}>{name}</li>)}
                </ul>
            </div>
        )}
        
        {parseContent(message.content, isModel)}
        
        {message.interactionPrompt && !message.interactionPrompt.submittedAnswer && onInteractionSubmit && (
            <InteractionPrompt 
                prompt={message.interactionPrompt.prompt} 
                onSubmit={(answer) => onInteractionSubmit(message.timestamp, answer)}
            />
        )}
        
        {message.interactionPrompt?.submittedAnswer && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-400 font-semibold mb-1">You answered:</p>
                <p className="text-sm text-slate-300 italic">"{message.interactionPrompt.submittedAnswer}"</p>
            </div>
        )}
    </div>
  )
};


export const Message: React.FC<MessageProps> = ({ 
    message, isCollected, onToggleSnippet, onStartFocusSession, 
    onStartThreadExplorer, isThreadActive, isReadOnly, onInteractionSubmit
}) => {
  const isModel = message.sender === 'model';
  const isAutoPrompt = message.isAutoPrompt === true;

  const containerClasses = [
    "group flex items-end gap-3 max-w-3xl",
    isModel ? 'flex-row' : 'flex-row-reverse',
    isThreadActive ? 'p-2 bg-yellow-300/50 rounded-xl' : '',
  ].filter(Boolean).join(' ');

  const bubbleClasses = [
    'message-bubble',
    isModel ? 'message-bubble-model' : 'message-bubble-user',
    isCollected ? 'ring-4 ring-offset-2 ring-yellow-400' : ''
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    if (isModel) return <BotIcon className="w-5 h-5" />;
    if (isAutoPrompt) return <SteeringWheelIcon className="w-5 h-5" />;
    return <UserIcon className="w-5 h-5" />;
  };

  const iconBgClass = [
    "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-black",
    isModel ? 'bg-slate-400 text-black' : (isAutoPrompt ? 'bg-slate-600 text-white' : 'bg-blue-400 text-black')
  ].join(' ');


  return (
    <div className={containerClasses}>
      <div className={iconBgClass}>
        {getIcon()}
      </div>
      <div className={bubbleClasses}>
        <MessageContent message={message} isModel={isModel} onInteractionSubmit={onInteractionSubmit} />
      </div>
       {!isReadOnly && isModel && message.content && (
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={() => onToggleSnippet?.(message.timestamp)} className="p-2 text-slate-600 hover:text-black transition-colors bg-white/70 rounded-full border-2 border-black" aria-label={isCollected ? 'Remove from collection' : 'Add to collection'}>
                {isCollected ? <CheckSquareIcon className="w-5 h-5 text-yellow-500" /> : <PlusSquareIcon className="w-5 h-5" />}
            </button>
             <button onClick={() => onStartFocusSession?.(message)} className="p-2 text-slate-600 hover:text-black transition-colors bg-white/70 rounded-full border-2 border-black" aria-label="Start focus session">
                <FocusIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onStartThreadExplorer?.(message.timestamp)} className="p-2 text-slate-600 hover:text-black transition-colors bg-white/70 rounded-full border-2 border-black" aria-label="Trace thread">
                <GitBranchIcon className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
};
