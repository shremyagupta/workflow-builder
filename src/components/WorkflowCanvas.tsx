import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Node from './Node';
import { NodeData, NodeType, WorkflowState, Connection } from '../types';

const WorkflowCanvas: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowState>(() => ({
    nodes: {
      '1': {
        id: '1',
        type: 'action',
        label: 'Start',
        children: [],
        position: { x: 400, y: 50 },
      },
    },
    rootId: '1',
  }));

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
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

      if (node.type === 'branch' && node.branchPaths) {
        Object.entries(node.branchPaths).forEach(([condition, childId]) => {
          conns.push({
            id: `${nodeId}-${childId}-${condition}`,
            source: nodeId,
            target: childId,
            condition,
          });
          traverse(childId);
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
          type === 'branch'
            ? 'Branch'
            : type === 'end'
            ? 'End'
            : 'New Step',
        children: [],
        position: {
          x: parentNode.position.x,
          y: parentNode.position.y + 150,
        },
      };

      if (type === 'branch') {
        newNode.branchPaths = { 'true': '', 'false': '' };
      }

      setWorkflow((prev) => {
        const newNodes = { ...prev.nodes, [newNodeId]: newNode };
        const parentNode = { ...prev.nodes[parentId] };

        if (parentNode.type === 'branch' && condition) {
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

  const deleteNode = useCallback(
    (nodeId: string) => {
      if (nodeId === workflow.rootId) return;

      setWorkflow((prev) => {
        const newNodes = { ...prev.nodes };
        let parentNode: NodeData | null = null;
        let parentKey: string | null = null;

        // Find the parent node and remove the reference
        for (const [id, node] of Object.entries(newNodes)) {
          if (node.children.includes(nodeId)) {
            parentNode = { ...node };
            parentKey = id;
            parentNode.children = parentNode.children.filter(
              (childId) => childId !== nodeId
            );
            break;
          }
          if (node.type === 'branch' && node.branchPaths) {
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

        // If we found a parent, connect its children to its parent
        if (parentNode && parentKey) {
          const deletedNode = newNodes[nodeId];
          if (deletedNode) {
            // If the deleted node has children, connect them to the parent
            if (deletedNode.children.length > 0) {
              if (parentNode.type === 'branch') {
                // For branch nodes, we need to handle connections differently
                // This is simplified and might need more complex logic
                parentNode.children = [
                  ...parentNode.children,
                  ...deletedNode.children,
                ];
              } else {
                parentNode.children = [
                  ...parentNode.children,
                  ...deletedNode.children,
                ];
              }
            }

            // If the deleted node was a branch, we need to handle its branch paths
            if (deletedNode.type === 'branch' && deletedNode.branchPaths) {
              // This is a simplified approach - in a real app, you'd need to handle
              // the connections more carefully, possibly creating new branch paths
              // or converting to a different node type
              parentNode.children = [
                ...parentNode.children,
                ...Object.values(deletedNode.branchPaths).filter(Boolean),
              ];
            }

            // Update the parent node in the nodes object
            newNodes[parentKey] = parentNode;
          }
        }

        // Remove the deleted node
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
      setSelectedNode(nodeId);
      const node = workflow.nodes[nodeId];
      if (!node) return;

      const offsetX = e.clientX - node.position.x;
      const offsetY = e.clientY - node.position.y;

      setDraggedNode({ id: nodeId, offset: { x: offsetX, y: offsetY } });
    },
    [workflow.nodes]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedNode) return;

      const { id, offset } = draggedNode;
      const node = workflow.nodes[id];
      if (!node) return;

      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;

      updateNode(id, {
        position: { x: newX, y: newY },
      });
    },
    [draggedNode, updateNode, workflow.nodes]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  React.useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  const renderConnections = () => {
    return connections.map((conn) => {
      const sourceNode = workflow.nodes[conn.source];
      const targetNode = workflow.nodes[conn.target];

      if (!sourceNode || !targetNode) return null;

      const startX = sourceNode.position.x + 100; // Center of the node
      const startY = sourceNode.position.y + 40; // Bottom of the node
      const endX = targetNode.position.x + 100; // Center of the target node
      const endY = targetNode.position.y; // Top of the target node

      return (
        <g key={conn.id} className="connection">
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#999"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          {conn.condition && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 - 5}
              textAnchor="middle"
              fill="#666"
              fontSize="12"
            >
              {conn.condition}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className="workflow-canvas">
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
