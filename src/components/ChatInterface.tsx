import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, TrendingUp, Clock, Star, Zap } from 'lucide-react';
import { Message } from '../types';
import { agents } from '../data/agents';
import { wizards } from '../data/wizards';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatInterfaceProps {
  selectedId: string | null;
  selectedType: 'agent' | 'wizard' | null;
  messages: Message[];
  showWelcome: boolean;
  onSendMessage: (content: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedId,
  selectedType,
  messages,
  showWelcome,
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedItem = selectedType === 'agent' && selectedId
    ? agents.find(a => a.id === selectedId)
    : selectedType === 'wizard' && selectedId
    ? wizards.find(w => w.id === selectedId)
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !selectedType) {
      return;
    }
    
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getWelcomeMessage = () => {
    if (selectedType === 'agent') {
      return `Hello Bill! I'm your ${selectedItem?.name} assistant. How can I help you with ${selectedItem?.description.toLowerCase()}?`;
    } else {
      return `Welcome Bill! Let's use the ${selectedItem?.name} wizard together. I'll guide you through the process step by step. Ready to get started?`;
    }
  };

  // Show welcome screen when nothing is selected
  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full bg-l1-background">
      {/* Header */}
      {selectedItem && (
        <div className="bg-l1-surface border-b border-l1-border p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {selectedType === 'agent' ? (
                <Bot className="text-l1-accent" size={24} />
              ) : (
                <Sparkles className="text-l1-accent" size={24} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-l1-text-primary">{selectedItem?.name}</h2>
              <p className="text-sm text-l1-text-secondary">{selectedItem?.description}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="bg-l1-surface rounded-lg p-6 shadow-sm border border-l1-border">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-l1-accent/20 rounded-full flex items-center justify-center">
                  {selectedType === 'agent' ? (
                    <Bot className="text-l1-accent" size={24} />
                  ) : (
                    <Sparkles className="text-l1-accent" size={24} />
                  )}
                </div>
                <h3 className="text-lg font-medium text-l1-text-primary mb-2">
                  {selectedType === 'agent' ? 'Agent Ready' : 'Wizard Ready'}
                </h3>
                <p className="text-l1-text-secondary">{getWelcomeMessage()}</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-3xl p-4 rounded-lg
                    ${message.sender === 'user'
                      ? 'bg-l1-accent text-white'
                      : 'bg-l1-surface text-l1-text-primary border border-l1-border shadow-sm'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-l1-text-secondary'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {selectedItem && (
        <div className="bg-l1-surface border-t border-l1-border p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedItem?.name}...`}
                className="w-full p-3 border border-l1-border rounded-lg focus:outline-none focus:ring-2 focus:ring-l1-accent focus:border-transparent resize-none bg-l1-background text-l1-text-primary placeholder-l1-text-muted"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex-shrink-0 p-3 bg-l1-accent text-white rounded-lg hover:bg-l1-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};