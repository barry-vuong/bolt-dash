import React from 'react';
import { Bell, Search, Settings, HelpCircle, User, ChevronDown } from 'lucide-react';

export const NavigationBar: React.FC = () => {
  return (
    <nav className="bg-l1-surface border-b border-l1-border px-6 py-3 flex items-center justify-between">
      {/* Left Section - Logo/Brand */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img 
            src="/image.png" 
            alt="Legends Hub" 
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold text-l1-text-primary">Legends Hub</span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-l1-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search agents, wizards, or ask a question..."
            className="w-full pl-10 pr-4 py-2 bg-l1-background border border-l1-border rounded-lg focus:outline-none focus:ring-2 focus:ring-l1-accent focus:border-transparent text-l1-text-primary placeholder-l1-text-muted"
          />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-l1-primary rounded-lg transition-colors">
          <Bell className="text-l1-text-secondary hover:text-l1-text-primary" size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <button className="p-2 hover:bg-l1-primary rounded-lg transition-colors">
          <HelpCircle className="text-l1-text-secondary hover:text-l1-text-primary" size={20} />
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-l1-primary rounded-lg transition-colors">
          <Settings className="text-l1-text-secondary hover:text-l1-text-primary" size={20} />
        </button>

        {/* Profile Dropdown */}
        <div className="flex items-center space-x-2 hover:bg-l1-primary rounded-lg p-2 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-l1-accent/20 rounded-full flex items-center justify-center border border-l1-accent/30">
            <User className="text-l1-accent" size={16} />
          </div>
          <div className="text-sm">
            <div className="text-l1-text-primary font-medium">Bill Johnson</div>
          </div>
          <ChevronDown className="text-l1-text-secondary" size={16} />
        </div>
      </div>
    </nav>
  );
};