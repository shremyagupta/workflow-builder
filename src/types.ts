export type NodeType = 'start' | 'menu' | 'tags' | 'text-message' | 'end';

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
  // Menu node specific
  question?: string;
  options?: string[];
  // Tags node specific
  tags?: string[];
  // Text message node specific
  messageContent?: string;
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
