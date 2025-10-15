import React, { useState } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { useConversations } from './hooks/useConversations';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'agent' | 'wizard' | null>(null);
  
  const { getConversation, addMessage, generateResponse } = useConversations();

  const handleSelect = (id: string, type: 'agent' | 'wizard') => {
    if (selectedId === id && selectedType === type) {
      // Unselect if clicking the same item
      setSelectedId(null);
      setSelectedType(null);
    } else {
      setSelectedId(id);
      setSelectedType(type);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedId || !selectedType) return;
    
    const conversationId = `${selectedType}-${selectedId}`;
    
    // Add user message
    addMessage(conversationId, content, 'user');
    
    // Generate AI response
    generateResponse(conversationId, selectedType, selectedId, content);
  };

  const currentConversation = selectedId && selectedType ? getConversation(`${selectedType}-${selectedId}`) : null;

  return (
    <div className="h-screen bg-l1-background flex flex-col">
      <NavigationBar />
      <div className="flex-1 flex">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelect={handleSelect}
        />
        
        <div className="flex-1 flex flex-col">
          <ChatInterface
            selectedId={selectedId}
            selectedType={selectedType}
            messages={currentConversation?.messages || []}
            showWelcome={!selectedId || !selectedType}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;