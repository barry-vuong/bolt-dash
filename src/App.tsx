import React, { useState } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { Sidebar } from './components/Sidebar';
import { BankReconciliation } from './components/BankReconciliation';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('bank-reconciliation');

  return (
    <div className="h-screen bg-l1-background flex flex-col">
      <NavigationBar />
      <div className="flex-1 flex">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
        />

        <div className="flex-1 flex flex-col">
          {selectedTool === 'bank-reconciliation' && <BankReconciliation />}
        </div>
      </div>
    </div>
  );
}

export default App;