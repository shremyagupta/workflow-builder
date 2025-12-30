import React, { useState } from 'react';
import { NodeData, NodeType } from '../types';
import { FaPlus, FaTrash, FaCodeBranch, FaCheck, FaTimes } from 'react-icons/fa';

interface NodeProps {
  node: NodeData;
  onAddNode: (parentId: string, type: NodeType, condition?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  isRoot?: boolean;
}

const Node: React.FC<NodeProps> = ({
  node,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
  isRoot = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [branchCondition, setBranchCondition] = useState('');

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

  const handleAddBranch = () => {
    if (branchCondition.trim()) {
      onAddNode(node.id, 'action', branchCondition);
      setBranchCondition('');
      setShowAddMenu(false);
    }
  };

  const nodeClasses = `node ${node.type} ${isRoot ? 'root' : ''}`;

  return (
    <div
      className={nodeClasses}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
      }}
    >
      <div className="node-header">
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
        {!isRoot && (
          <button className="delete-btn" onClick={() => onDeleteNode(node.id)}>
            <FaTrash size={12} />
          </button>
        )}
      </div>

      <div className="node-actions">
        {node.type === 'branch' ? (
          <div className="branch-actions">
            {Object.entries(node.branchPaths || {}).map(([condition, childId]) => (
              <div key={condition} className="branch-path">
                <span>{condition}:</span>
                <button
                  className="add-btn"
                  onClick={() => onAddNode(node.id, 'action', condition)}
                >
                  <FaPlus />
                </button>
              </div>
            ))}
            {showAddMenu ? (
              <div className="add-branch-menu">
                <input
                  type="text"
                  value={branchCondition}
                  onChange={(e) => setBranchCondition(e.target.value)}
                  placeholder="Condition"
                  className="branch-input"
                />
                <button onClick={handleAddBranch} className="confirm-btn">
                  <FaCheck />
                </button>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="cancel-btn"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                className="add-branch-btn"
                onClick={() => setShowAddMenu(true)}
              >
                <FaCodeBranch /> Add Branch
              </button>
            )}
          </div>
        ) : node.type !== 'end' ? (
          <button
            className="add-btn"
            onClick={() => onAddNode(node.id, 'action')}
          >
            <FaPlus /> Add Step
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Node;
