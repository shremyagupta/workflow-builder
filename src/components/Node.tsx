import React, { useState } from 'react';
import { NodeData, NodeType } from '../types';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface NodeProps {
  node: NodeData;
  onAddNode: (parentId: string, type: NodeType, condition?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  isRoot?: boolean;
  isSelected?: boolean;
}

const Node: React.FC<NodeProps> = ({
  node,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
  isRoot = false,
  isSelected = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    if (label.trim()) {
      onUpdateNode(node.id, { label });
    } else {
      setLabel(node.label);
    }
    setIsEditing(false);
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNode(node.id, { question: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(node.options || [])];
    options[index] = value;
    onUpdateNode(node.id, { options });
  };

  const handleAddOption = () => {
    const options = [...(node.options || []), 'New Option'];
    const branchPaths = { ...(node.branchPaths || {}) };
    branchPaths['New Option'] = '';
    onUpdateNode(node.id, { options, branchPaths });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    onUpdateNode(node.id, { tags });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNode(node.id, { messageContent: e.target.value });
  };

  const nodeClasses = `node ${node.type} ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`;

  // Render oval nodes (START and END)
  if (node.type === 'start' || node.type === 'end') {
    return (
      <div className={nodeClasses}>
        <div className="connection-point top" />
        <div className="connection-point bottom" />
        <div className="node-content-oval">
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyPress={(e) => e.key === 'Enter' && handleLabelBlur()}
              autoFocus
              className="node-label-input"
            />
          ) : (
            <div className="node-label" onClick={() => setIsEditing(true)}>
              {node.label}
            </div>
          )}
        </div>
        {node.type === 'start' && (
          <button
            className="add-btn-oval"
            onClick={() => onAddNode(node.id, 'menu')}
            title="Add node"
          >
            <FaPlus />
          </button>
        )}
      </div>
    );
  }

  // Render rectangular nodes (MENU, TAGS, TEXT MESSAGE)
  return (
    <div className={nodeClasses}>
      <div className="connection-point top" />
      <div className="connection-point bottom" />
      <div className="node-header">
        <span className="node-type-label">{node.label}</span>
        {!isRoot && (
          <button className="delete-btn" onClick={() => onDeleteNode(node.id)}>
            <FaTrash size={12} />
          </button>
        )}
      </div>

      <div className="node-body">
        {node.type === 'menu' && (
          <div className="menu-content">
            <div className="menu-question">
              <label>Question:</label>
              <input
                type="text"
                value={node.question || ''}
                onChange={handleQuestionChange}
                placeholder="Please select an option:"
                className="menu-input"
              />
            </div>
            <div className="menu-options">
              {node.options?.map((option, idx) => (
                <div key={idx} className="menu-option">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="option-input"
                  />
                  <button
                    className="add-btn-small"
                    onClick={() => onAddNode(node.id, 'tags', option)}
                    title="Add node"
                  >
                    <FaPlus />
                  </button>
                </div>
              ))}
              <button className="add-option-btn" onClick={handleAddOption}>
                <FaPlus /> Add Option
              </button>
            </div>
          </div>
        )}

        {node.type === 'tags' && (
          <div className="tags-content">
            <div className="tags-display">
              {node.tags && node.tags.length > 0 ? (
                <span>Tags added: {node.tags.join(', ')}</span>
              ) : (
                <span>No tags added</span>
              )}
            </div>
            <input
              type="text"
              value={node.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="Add tags (comma separated)"
              className="tags-input"
            />
            <button
              className="add-btn-small"
              onClick={() => onAddNode(node.id, 'text-message')}
              title="Add node"
            >
              <FaPlus />
            </button>
          </div>
        )}

        {node.type === 'text-message' && (
          <div className="message-content">
            <label>Message Content:</label>
            <textarea
              value={node.messageContent || ''}
              onChange={handleMessageChange}
              placeholder="Enter message content"
              className="message-input"
              rows={3}
            />
            <button
              className="add-btn-small"
              onClick={() => onAddNode(node.id, 'end')}
              title="Add node"
            >
              <FaPlus />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Node;
