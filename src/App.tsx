import React, { useCallback, useState } from 'react';
import WorkflowCanvas from './components/WorkflowCanvas';
import Sidebar from './components/Sidebar';
import { FaArrowLeft, FaSave, FaThLarge, FaAdjust } from 'react-icons/fa';
import './App.css';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowTitle] = useState('Initial Workflow');
  const [nodes, setNodes] = useState<{ [key: string]: any }>({});

  const handleSave = useCallback(() => {
    // In a real app, you would save the workflow to a server or local storage
    console.log('Saving workflow...');
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <button className="back-btn">
              <FaArrowLeft />
            </button>
            <h1 className="workflow-title">{workflowTitle}</h1>
          </div>
          <div className="header-right">
            <button 
              className="icon-btn" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              <FaAdjust />
            </button>
            <button className="icon-btn" title="Save">
              <FaSave />
            </button>
            <button className="icon-btn" title="Grid view">
              <FaThLarge />
            </button>
            <button onClick={handleSave} className="save-flow-btn">
              Save Flow
            </button>
          </div>
        </header>

        <div className="main-content">
          <div className="canvas-container">
            <WorkflowCanvas 
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              onNodesChange={setNodes}
            />
          </div>
          <Sidebar 
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
