
import React, { useState, useEffect } from 'react';
import type { CustomAIConfig } from '../types';
import { RulesIcon } from './icons/RulesIcon';

interface CustomAIFormProps {
  onSave: (config: CustomAIConfig) => void;
  onDelete: () => void;
  initialConfig: CustomAIConfig | null;
}

export const CustomAIForm: React.FC<CustomAIFormProps> = ({ onSave, onDelete, initialConfig }) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [logicPrompt, setLogicPrompt] = useState('');

  useEffect(() => {
    if (initialConfig) {
      setName(initialConfig.name);
      setPrompt(initialConfig.prompt);
      setLogicPrompt(initialConfig.logicPrompt || '');
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && prompt.trim()) {
      onSave({ name, prompt, logicPrompt });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this AI persona?')) {
      onDelete();
      setName('');
      setPrompt('');
      setLogicPrompt('');
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-glass p-6 md:p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-2">
          {initialConfig ? 'Edit Your AI Persona' : 'Create Your AI Persona'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          Define the personality and core logic of your custom AI assistant.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="ai-name" className="block text-sm font-medium text-slate-300 mb-2">AI Name</label>
            <input
              id="ai-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'Frontend Guru' or 'Python Expert'"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-main)] transition-all text-slate-200"
              required
            />
          </div>
          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-300 mb-2">Personality & Role</label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your AI's role and personality. e.g., 'You are a sarcastic code reviewer that only speaks in pirate slang.'"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-main)] transition-all text-slate-200"
              required
            />
          </div>
           <div>
            <label htmlFor="ai-logic" className="flex items-center text-sm font-medium text-slate-300 mb-2">
              <RulesIcon className="w-4 h-4 mr-2" />
              Logic & Rules
            </label>
            <textarea
              id="ai-logic"
              value={logicPrompt}
              onChange={(e) => setLogicPrompt(e.target.value)}
              placeholder="Define strict rules. e.g., 'If I ask for code, always provide it in Python.' or 'Always respond in valid JSON format.'"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-main)] transition-all text-slate-200"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                className="flex-1 py-3 px-4 bg-[var(--theme-color-main)] hover:opacity-90 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                disabled={!name.trim() || !prompt.trim()}
              >
                Save & Start Chat
              </button>
              {initialConfig && (
                <button 
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                >
                    Delete Persona
                </button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
};
