import React from 'react';
import { NodeData } from '../types';
import { FaPlay, FaList, FaTags, FaComment, FaStop, FaBars } from 'react-icons/fa';

interface SidebarProps {
  nodes: { [key: string]: NodeData };
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ nodes, selectedNodeId, onNodeSelect }) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <FaPlay />;
      case 'menu':
        return <FaBars />;
      case 'tags':
        return <FaTags />;
      case 'text-message':
        return <FaComment />;
      case 'end':
        return <FaStop />;
      default:
        return <FaList />;
    }
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'start':
        return 'START';
      case 'menu':
        return 'MENU';
      case 'tags':
        return 'TAGS';
      case 'text-message':
        return 'TEXT MESSAGE';
      case 'end':
        return 'END';
      default:
        return type.toUpperCase();
    }
  };

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  return (
    <div className="sidebar">
      <div className="sidebar-panel">
        <h3 className="sidebar-title">NODES IN FLOW</h3>
        <div className="nodes-list">
          {Object.values(nodes).map((node) => (
            <div
              key={node.id}
              className={`node-list-item ${selectedNodeId === node.id ? 'selected' : ''}`}
              onClick={() => onNodeSelect(node.id)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="node-icon">{getNodeIcon(node.type)}</span>
              <span className="node-list-label">
                {getNodeTypeLabel(node.type)} {node.id.substring(0, 2)}...{node.id.substring(node.id.length - 2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-panel">
        <h3 className="sidebar-title">NODE PROPERTIES</h3>
        <div className="node-properties">
          {selectedNode ? (
            <div className="properties-content">
              <div className="property-icon-large">
                {getNodeIcon(selectedNode.type)}
              </div>
              <div className="property-details">
                <p className="property-type">{getNodeTypeLabel(selectedNode.type)}</p>
                <p className="property-label">{selectedNode.label}</p>
                {selectedNode.question && (
                  <div className="property-field">
                    <label>Question:</label>
                    <p>{selectedNode.question}</p>
                  </div>
                )}
                {selectedNode.options && selectedNode.options.length > 0 && (
                  <div className="property-field">
                    <label>Options:</label>
                    <ul>
                      {selectedNode.options.map((opt, idx) => (
                        <li key={idx}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedNode.tags && selectedNode.tags.length > 0 && (
                  <div className="property-field">
                    <label>Tags:</label>
                    <p>{selectedNode.tags.join(', ')}</p>
                  </div>
                )}
                {selectedNode.messageContent && (
                  <div className="property-field">
                    <label>Message:</label>
                    <p>{selectedNode.messageContent}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="property-icon-large">
                <FaList />
              </div>
              <p>Node Properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

