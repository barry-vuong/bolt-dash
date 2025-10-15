import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X, Calculator } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedTool: string;
  onSelectTool: (tool: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  selectedTool,
  onSelectTool
}) => {
  const [toolsExpanded, setToolsExpanded] = useState(true);

  const tools = [
    { id: 'bank-reconciliation', name: 'Bank Reconciliation', icon: 'Calculator', description: 'Upload bank and accounts files to reconcile transactions' }
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
            {/* Tools Section */}
            <div>
              <button
                onClick={() => setToolsExpanded(!toolsExpanded)}
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
                      onClick={() => onSelectTool(tool.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-start space-x-3 ${
                        selectedTool === tool.id
                          ? 'bg-l1-accent/20 text-l1-text-primary'
                          : 'hover:bg-l1-primary text-l1-text-primary'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Calculator size={20} className={selectedTool === tool.id ? 'text-l1-accent' : ''} />
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
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`w-full p-3 rounded-lg transition-all duration-200 flex justify-center ${
                  selectedTool === tool.id
                    ? 'bg-l1-accent/20 text-l1-accent'
                    : 'hover:bg-l1-primary text-l1-text-primary'
                }`}
                title={tool.name}
              >
                <Calculator size={20} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};