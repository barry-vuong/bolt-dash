import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X, MessageCircle, Brain, Bot, MessageSquare } from 'lucide-react';
import { agents } from '../data/agents';
import { wizards } from '../data/wizards';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedId: string | null;
  selectedType: 'agent' | 'wizard' | null;
  onSelect: (id: string, type: 'agent' | 'wizard') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  selectedId,
  selectedType,
  onSelect
}) => {
  const [agentsExpanded, setAgentsExpanded] = useState(true);
  const [wizardsExpanded, setWizardsExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const tools = [
    { id: 'slack', name: 'Slack', icon: 'MessageCircle', description: 'Team communication and collaboration' },
    { id: 'pigment-ai', name: 'Pigment AI', icon: 'Brain', description: 'AI-powered business planning and analytics' },
    { id: 'chatgpt', name: 'ChatGPT', icon: 'Bot', description: 'AI assistant for various tasks and queries' },
    { id: 'meeting-summary', name: 'Meeting Summary', icon: 'MessageSquare', description: 'Upload transcripts/notes and receive structured outputs' }
  ];

  return (
    <div className={`
      bg-l1-surface border-r border-l1-border transition-all duration-300 ease-in-out shadow-sm
      ${isCollapsed ? 'w-16' : 'w-80'}
      flex flex-col
    `}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-l1-border bg-l1-primary/50">
        <div className={`${isCollapsed ? 'flex justify-center' : 'relative'}`}>
          <button
            onClick={onToggleCollapse}
            className={`p-2 hover:bg-l1-primary rounded-lg transition-colors text-l1-text-primary ${
              isCollapsed ? '' : 'absolute top-0 right-0'
            }`}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          
        </div>
        
        {!isCollapsed && (
          <div className="mt-2 pt-2 border-t border-l1-border/50">
            <div className="text-sm text-l1-text-primary font-medium">
              Welcome back, <span className="text-l1-accent">Bill</span>
            </div>
            <div className="text-xs text-l1-text-secondary mt-1">
              Ready to tackle today's challenges?
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="p-4 space-y-6">
            {/* Agents Section */}
            <div>
              <button
                onClick={() => setAgentsExpanded(!agentsExpanded)}
                className="flex items-center justify-between w-full text-left mb-3 hover:bg-l1-primary p-2 rounded-lg transition-colors"
              >
                <span className="font-medium text-l1-text-primary">Agents</span>
                {agentsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {agentsExpanded && (
                <div className="space-y-1 ml-2">
                  {agents.map((agent) => (
                    <SidebarItem
                      key={agent.id}
                      item={agent}
                      isSelected={selectedId === agent.id && selectedType === 'agent'}
                      onClick={() => onSelect(agent.id, 'agent')}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Wizards Section */}
            <div>
              <button
                onClick={() => setWizardsExpanded(!wizardsExpanded)}
                className="flex items-center justify-between w-full text-left mb-3 hover:bg-l1-primary p-2 rounded-lg transition-colors"
              >
                <span className="font-medium text-l1-text-primary">Wizards</span>
                {wizardsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {wizardsExpanded && (
                <div className="space-y-1 ml-2">
                  {wizards.map((wizard) => (
                    <SidebarItem
                      key={wizard.id}
                      item={wizard}
                      isSelected={selectedId === wizard.id && selectedType === 'wizard'}
                      onClick={() => onSelect(wizard.id, 'wizard')}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tools Section */}
            <div>
              <button
                onClick={() => {
                  setToolsExpanded(!toolsExpanded);
                  if (!toolsExpanded) {
                    setAgentsExpanded(false);
                    setWizardsExpanded(false);
                  }
                }}
                className="flex items-center justify-between w-full text-left mb-3 hover:bg-l1-primary p-2 rounded-lg transition-colors"
              >
                <span className="font-medium text-l1-text-primary">Tools</span>
                {toolsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {toolsExpanded && (
                <div className="space-y-1 ml-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-l1-primary text-l1-text-primary flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0">
                        {tool.icon === 'MessageCircle' && <MessageCircle size={20} />}
                        {tool.icon === 'Brain' && <Brain size={20} />}
                        {tool.icon === 'Bot' && <Bot size={20} />}
                        {tool.icon === 'MessageSquare' && <MessageSquare size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-l1-text-secondary mt-1 line-clamp-2">
                          {tool.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="p-2 space-y-2">
            {/* Collapsed view - show only icons */}
            {agents.map((agent) => (
              <SidebarItem
                key={agent.id}
                item={agent}
                isSelected={selectedId === agent.id && selectedType === 'agent'}
                onClick={() => onSelect(agent.id, 'agent')}
                collapsed
              />
            ))}
            <div className="border-t border-l1-border my-2"></div>
            {wizards.map((wizard) => (
              <SidebarItem
                key={wizard.id}
                item={wizard}
                isSelected={selectedId === wizard.id && selectedType === 'wizard'}
                onClick={() => onSelect(wizard.id, 'wizard')}
                collapsed
              />
            ))}
            <div className="border-t border-l1-border my-2"></div>
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="w-full p-3 rounded-lg transition-all duration-200 hover:bg-l1-primary text-l1-text-primary flex justify-center"
                title={tool.name}
              >
                <div className="flex-shrink-0">
                  {tool.icon === 'MessageCircle' && <MessageCircle size={20} />}
                  {tool.icon === 'Brain' && <Brain size={20} />}
                  {tool.icon === 'Bot' && <Bot size={20} />}
                  {tool.icon === 'MessageSquare' && <MessageSquare size={20} />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};