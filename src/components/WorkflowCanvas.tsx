import React, { useState, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Node from './Node';
import { NodeData, NodeType, WorkflowState, Connection } from '../types';
import { FaPlus, FaMinusCircle, FaExpandArrowsAlt } from 'react-icons/fa';

interface WorkflowCanvasProps {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodesChange?: (nodes: { [key: string]: NodeData }) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ selectedNodeId, onNodeSelect, onNodesChange }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [workflow, setWorkflow] = useState<WorkflowState>(() => ({
    nodes: {
      'start-1': {
        id: 'start-1',
        type: 'start',
        label: 'Start',
        children: ['menu-1'],
        position: { x: 100, y: 300 },
      },
      'menu-1': {
        id: 'menu-1',
        type: 'menu',
        label: 'MENU',
        question: 'Please select an option:',
        options: ['1- Marketing', '2- Lead', '3- Support'],
        children: [],
        branchPaths: {
          '1- Marketing': 'tags-1',
          '2- Lead': 'tags-2',
          '3- Support': 'tags-3',
        },
        position: { x: 400, y: 300 },
      },
      'tags-1': {
        id: 'tags-1',
        type: 'tags',
        label: 'TAGS',
        tags: ['Marketing', 'Lead'],
        children: ['text-1'],
        position: { x: 700, y: 150 },
      },
      'tags-2': {
        id: 'tags-2',
        type: 'tags',
        label: 'TAGS',
        tags: ['Lead'],
        children: ['text-2'],
        position: { x: 700, y: 300 },
      },
      'tags-3': {
        id: 'tags-3',
        type: 'tags',
        label: 'TAGS',
        tags: ['Support'],
        children: ['text-3'],
        position: { x: 700, y: 450 },
      },
      'text-1': {
        id: 'text-1',
        type: 'text-message',
        label: 'TEXT MESSAGE',
        messageContent: 'You choose Marketing.',
        children: ['end-1'],
        position: { x: 1000, y: 150 },
      },
      'text-2': {
        id: 'text-2',
        type: 'text-message',
        label: 'TEXT MESSAGE',
        messageContent: 'You choose Lead.',
        children: ['end-1'],
        position: { x: 1000, y: 300 },
      },
      'text-3': {
        id: 'text-3',
        type: 'text-message',
        label: 'TEXT MESSAGE',
        messageContent: 'You choose Support.',
        children: ['end-1'],
        position: { x: 1000, y: 450 },
      },
      'end-1': {
        id: 'end-1',
        type: 'end',
        label: 'End',
        children: [],
        position: { x: 1300, y: 300 },
      },
    },
    rootId: 'start-1',
  }));

  const [draggedNode, setDraggedNode] = useState<{
    id: string;
    offset: { x: number; y: number };
  } | null>(null);

  const connections = useMemo(() => {
    const conns: Connection[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = workflow.nodes[nodeId];
      if (!node) return;

      if (node.type === 'menu' && node.branchPaths) {
        Object.entries(node.branchPaths).forEach(([condition, childId]) => {
          if (childId) {
            conns.push({
              id: `${nodeId}-${childId}-${condition}`,
              source: nodeId,
              target: childId,
              condition,
            });
            traverse(childId);
          }
        });
      } else {
        node.children.forEach((childId) => {
          conns.push({
            id: `${nodeId}-${childId}`,
            source: nodeId,
            target: childId,
          });
          traverse(childId);
        });
      }
    };

    traverse(workflow.rootId);
    return conns;
  }, [workflow]);

  const addNode = useCallback(
    (parentId: string, type: NodeType, condition?: string) => {
      const parentNode = workflow.nodes[parentId];
      if (!parentNode || parentNode.type === 'end') return;

      const newNodeId = uuidv4();
      const newNode: NodeData = {
        id: newNodeId,
        type,
        label:
          type === 'start'
            ? 'Start'
            : type === 'menu'
            ? 'MENU'
            : type === 'tags'
            ? 'TAGS'
            : type === 'text-message'
            ? 'TEXT MESSAGE'
            : type === 'end'
            ? 'End'
            : 'New Step',
        children: [],
        position: {
          x: parentNode.position.x + 300,
          y: parentNode.position.y,
        },
      };

      if (type === 'menu') {
        newNode.question = 'Please select an option:';
        newNode.options = ['Option 1', 'Option 2'];
        newNode.branchPaths = {};
      } else if (type === 'tags') {
        newNode.tags = [];
      } else if (type === 'text-message') {
        newNode.messageContent = 'Message content here';
      }

      setWorkflow((prev) => {
        const newNodes = { ...prev.nodes, [newNodeId]: newNode };
        const parentNode = { ...prev.nodes[parentId] };

        if (parentNode.type === 'menu' && condition) {
          parentNode.branchPaths = {
            ...parentNode.branchPaths,
            [condition]: newNodeId,
          };
        } else {
          parentNode.children = [...parentNode.children, newNodeId];
        }

        return {
          ...prev,
          nodes: {
            ...newNodes,
            [parentId]: parentNode,
          },
        };
      });
    },
    [workflow.nodes]
  );

  React.useEffect(() => {
    if (onNodesChange) {
      onNodesChange(workflow.nodes);
    }
  }, [workflow.nodes, onNodesChange]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      if (nodeId === workflow.rootId) return;

      setWorkflow((prev) => {
        const newNodes = { ...prev.nodes };
        let parentNode: NodeData | null = null;
        let parentKey: string | null = null;

        for (const [id, node] of Object.entries(newNodes)) {
          if (node.children.includes(nodeId)) {
            parentNode = { ...node };
            parentKey = id;
            parentNode.children = parentNode.children.filter(
              (childId) => childId !== nodeId
            );
            break;
          }
          if (node.type === 'menu' && node.branchPaths) {
            for (const [condition, childId] of Object.entries(
              node.branchPaths
            )) {
              if (childId === nodeId) {
                parentNode = { ...node };
                parentKey = id;
                const { [condition]: _, ...remainingPaths } =
                  parentNode.branchPaths || {};
                parentNode.branchPaths = remainingPaths;
                break;
              }
            }
            if (parentNode) break;
          }
        }

        if (parentNode && parentKey) {
          const deletedNode = newNodes[nodeId];
          if (deletedNode) {
            if (deletedNode.children.length > 0) {
              parentNode.children = [
                ...parentNode.children,
                ...deletedNode.children,
              ];
            }
            newNodes[parentKey] = parentNode;
          }
        }

        delete newNodes[nodeId];
        return {
          ...prev,
          nodes: newNodes,
        };
      });
    },
    [workflow.rootId]
  );

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<NodeData>) => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [nodeId]: {
            ...prev.nodes[nodeId],
            ...updates,
          },
        },
      }));
    },
    []
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      onNodeSelect(nodeId);
      const node = workflow.nodes[nodeId];
      if (!node) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const offsetX = (e.clientX - rect.left - pan.x) / zoom - node.position.x;
      const offsetY = (e.clientY - rect.top - pan.y) / zoom - node.position.y;

      setDraggedNode({ id: nodeId, offset: { x: offsetX, y: offsetY } });
    },
    [workflow.nodes, pan, zoom, onNodeSelect]
  );

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onNodeSelect('');
    }
  }, [pan, onNodeSelect]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggedNode) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newX = (e.clientX - rect.left - pan.x) / zoom - draggedNode.offset.x;
        const newY = (e.clientY - rect.top - pan.y) / zoom - draggedNode.offset.y;

        updateNode(draggedNode.id, {
          position: { x: newX, y: newY },
        });
      }
    },
    [isPanning, panStart, draggedNode, pan, zoom, updateNode]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsPanning(false);
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleFitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderConnections = () => {
    return connections.map((conn) => {
      const sourceNode = workflow.nodes[conn.source];
      const targetNode = workflow.nodes[conn.target];

      if (!sourceNode || !targetNode) return null;

      const startX = sourceNode.position.x + 120;
      const startY = sourceNode.position.y + 40;
      const endX = targetNode.position.x + 120;
      const endY = targetNode.position.y;

      const midY = (startY + endY) / 2;
      const controlY1 = startY + 50;
      const controlY2 = endY - 50;

      const path = `M ${startX} ${startY} L ${startX} ${controlY1} L ${endX} ${controlY2} L ${endX} ${endY}`;

      return (
        <g key={conn.id} className="connection">
          <path
            d={path}
            stroke="#999"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {conn.condition && (
            <text
              x={(startX + endX) / 2}
              y={midY - 5}
              textAnchor="middle"
              fill="#666"
              fontSize="11"
              className="connection-label"
            >
              {conn.condition}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className="workflow-canvas-wrapper">
      <div
        ref={canvasRef}
        className="workflow-canvas"
        onMouseDown={handleCanvasMouseDown}
        style={{
          cursor: isPanning ? 'grabbing' : draggedNode ? 'grabbing' : 'default',
        }}
      >
        <div
          className="canvas-content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <div className="grid-background" />
          <svg className="connections-layer">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
              </marker>
            </defs>
            {renderConnections()}
          </svg>
          <div className="nodes-layer">
            {Object.values(workflow.nodes).map((node) => (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                style={{
                  position: 'absolute',
                  left: node.position.x,
                  top: node.position.y,
                  cursor: draggedNode?.id === node.id ? 'grabbing' : 'grab',
                }}
              >
                <Node
                  node={node}
                  onAddNode={addNode}
                  onDeleteNode={deleteNode}
                  onUpdateNode={updateNode}
                  isRoot={node.id === workflow.rootId}
                  isSelected={selectedNodeId === node.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="zoom-controls">
        <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
          <FaPlus />
        </button>
        <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
          <FaMinusCircle />
        </button>
        <button onClick={handleFitToScreen} className="zoom-btn" title="Fit to Screen">
          <FaExpandArrowsAlt />
        </button>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
