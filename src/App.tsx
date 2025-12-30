import React, { useCallback } from 'react';
import WorkflowCanvas from './components/WorkflowCanvas';
import { NodeType } from './types';
import './App.css';

const App: React.FC = () => {
  const handleSave = useCallback(() => {
    // In a real app, you would save the workflow to a server or local storage
    console.log('Saving workflow...');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Workflow Builder</h1>
        <div className="toolbar">
          <button onClick={handleSave} className="save-btn">
            Save Workflow
          </button>
        </div>
      </header>
      <main className="app-content">
        <WorkflowCanvas />
      </main>
      <div className="instructions">
        <h3>How to use:</h3>
        <ul>
          <li>Click on a node to select it</li>
          <li>Drag nodes to reposition them</li>
          <li>Click on a node's label to edit it</li>
          <li>Use the + button to add new nodes</li>
          <li>Use the trash icon to delete nodes (except the Start node)</li>
          <li>For branch nodes, add conditions to create different paths</li>
        </ul>
      </div>
    </div>
  );
};

export default App;
