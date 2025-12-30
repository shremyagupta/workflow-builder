export type NodeType = 'action' | 'branch' | 'end';

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  children: string[];
  branchPaths?: {
    [key: string]: string; // condition -> childId
  };
  position: {
    x: number;
    y: number;
  };
}

export interface WorkflowState {
  nodes: {
    [key: string]: NodeData;
  };
  rootId: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}
