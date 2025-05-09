
"use client";
import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
  Position,
} from 'reactflow';
import { useApp } from '@/hooks/useApp';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

export function GraphView() {
  const { activeProjectId, getTasksByProjectId, projects } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    const activeProject = projects.find(p => p.id === activeProjectId && !p.isDeleted);
    if (!activeProject || !activeProjectId) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const projectNode: Node = {
      id: `project-${activeProject.id}`,
      type: 'input', // Using 'input' type for the root/source node
      data: { label: `${activeProject.name} (Project)` },
      position: { x: 100, y: 100 }, 
      style: { 
        backgroundColor: 'hsl(var(--primary))', 
        color: 'hsl(var(--primary-foreground))', 
        borderColor: 'hsl(var(--primary))', 
        width: 200, 
        padding: '10px',
        borderRadius: 'var(--radius)',
        textAlign: 'center',
        fontSize: '1.1rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      ...nodeDefaults,
      sourcePosition: Position.Bottom, // Project node will be a source from the bottom
    };

    const projectTasks = getTasksByProjectId(activeProjectId);
    const taskNodes: Node[] = projectTasks.map((task, index) => ({
      id: task.id,
      type: 'default', // Default node type for tasks
      data: { label: task.title },
      position: { x: 50 + index * 220, y: 250 }, // Spread tasks horizontally below the project
      style: { 
        backgroundColor: 'hsl(var(--card))', 
        color: 'hsl(var(--card-foreground))', 
        borderColor: 'hsl(var(--border))', 
        width: 180,
        padding: '8px',
        borderRadius: 'var(--radius)',
        textAlign: 'center',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
       },
      ...nodeDefaults,
      targetPosition: Position.Top, // Task nodes will be targets from the top
    }));

    const taskEdges: Edge[] = projectTasks.map(task => ({
      id: `edge-project-${task.id}`,
      source: `project-${activeProject.id}`, // Edge from project
      target: task.id,                     // Edge to task
      animated: true,
      style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
    }));

    setNodes([projectNode, ...taskNodes]);
    setEdges(taskEdges);

  }, [activeProjectId, projects, getTasksByProjectId, setNodes, setEdges]);


  const activeProjectDetails = projects.find(p => p.id === activeProjectId && !p.isDeleted);
  if (!activeProjectId || !activeProjectDetails) {
    // This message is already handled by DashboardPage's NoProjectSelectedMessage
    // Keeping it here as a fallback or for direct use if GraphView is used elsewhere.
    return (
      <div className="flex-grow flex items-center justify-center p-6 h-full">
        <p className="text-xl text-muted-foreground">Please select or create a project to view its graph.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full"> 
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }} 
      >
        <MiniMap 
            nodeStrokeWidth={3} 
            pannable 
            zoomable 
            style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
            nodeColor={(node) => {
                if (node.type === 'input') return 'hsl(var(--primary))';
                return 'hsl(var(--card))';
            }}
        />
        <Controls 
            style={{
                // This is a simplified way to target buttons; ShadCN doesn't expose direct style props for controls easily
            }}
        />
        <Background color="hsl(var(--muted))" gap={16} />
      </ReactFlow>
    </div>
  );
}
