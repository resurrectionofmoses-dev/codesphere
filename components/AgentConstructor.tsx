import React, { useState, useEffect } from 'react';

// Simple SVG Icon Components
const PlayIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const RefreshIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const DownloadIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ActivityIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// Agent Types
interface TraceNode {
  node_id: string;
  name: string;
  state: 'idle' | 'active' | 'processing' | 'waiting' | 'completed' | 'error';
  timestamp: string;
  metadata: Record<string, unknown>;
  children: TraceNode[];
}

interface AgentStatus {
  name: string;
  running: boolean;
  flow_trace: TraceNode;
}

interface AgentConstructorProps {
  agentName?: string;
  onStatusChange?: (status: AgentStatus) => void;
}

// Utility to get state color
const getStateColor = (state: string): string => {
  const colors: Record<string, string> = {
    idle: '#6b7280',
    active: '#3b82f6',
    processing: '#f59e0b',
    waiting: '#8b5cf6',
    completed: '#10b981',
    error: '#ef4444',
  };
  return colors[state] || '#6b7280';
};

// Recursive Node Renderer
const TraceNodeComponent: React.FC<{ node: TraceNode; depth?: number }> = ({ 
  node, 
  depth = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const stateColor = getStateColor(node.state);

  return (
    <div 
      className="trace-node"
      style={{ 
        marginLeft: `${depth * 20}px`,
        padding: '8px',
        borderLeft: `3px solid ${stateColor}`,
        marginBottom: '4px',
        backgroundColor: node.state === 'active' || node.state === 'processing' 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'transparent',
        borderRadius: '0 4px 4px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span style={{ width: '12px' }} />}
        
        <span style={{ fontWeight: 500, color: '#f9fafb' }}>{node.name}</span>
        
        <span 
          style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: `${stateColor}20`,
            color: stateColor,
          }}
        >
          {node.state.toUpperCase()}
        </span>
        
        <span style={{ fontSize: '11px', color: '#6b7280' }}>
          {new Date(node.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      {hasChildren && isExpanded && (
        <div style={{ marginTop: '8px' }}>
          {node.children.map((child) => (
            <TraceNodeComponent key={child.node_id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
export const AgentConstructor: React.FC<AgentConstructorProps> = ({
  agentName = 'AgentConstruct',
  onStatusChange,
}) => {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // Poll for status updates when agent is running
  useEffect(() => {
    if (status?.running) {
      const interval = setInterval(fetchStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [status?.running]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/agent/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        onStatusChange?.(data);
      }
    } catch (error) {
      // Silently fail - agent may not be running
      console.log('Agent status check:', error);
    }
  };

  const startAgent = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/agent/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentName, background: true }),
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to start agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAgent = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/agent/stop', { method: 'POST' });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to stop agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAgent = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/agent/reset', { method: 'POST' });
      setStatus(null);
    } catch (error) {
      console.error('Failed to reset agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportTrace = () => {
    if (status?.flow_trace) {
      const blob = new Blob([JSON.stringify(status.flow_trace, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent_trace_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      color: '#f9fafb',
      maxWidth: '600px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #374151',
      }}>
        <ActivityIcon size={24} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Agent Constructor
        </h2>
        <span style={{ 
          marginLeft: 'auto',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 500,
          backgroundColor: status?.running ? '#10b98120' : '#6b728020',
          color: status?.running ? '#10b981' : '#6b7280',
        }}>
          {status?.running ? '● Running' : '○ Idle'}
        </span>
      </div>

      {/* Agent Info */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          Agent Name: <span style={{ color: '#f9fafb' }}>{agentName}</span>
        </div>
        {status?.flow_trace && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Root Node: {status.flow_trace.name} ({status.flow_trace.state})
          </div>
        )}
      </div>

      {/* Flow Trace Visualization */}
      {status?.flow_trace && (
        <div style={{ 
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#111827',
          borderRadius: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#f9fafb' }}>Flow Trace</span>
            <button
              onClick={() => setShowTrace(!showTrace)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {showTrace ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showTrace && (
            <TraceNodeComponent node={status.flow_trace} />
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {!status?.running ? (
          <button
            onClick={startAgent}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <PlayIcon size={16} />
            Start Agent
          </button>
        ) : (
          <button
            onClick={stopAgent}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <PauseIcon size={16} />
            Stop Agent
          </button>
        )}

        <button
          onClick={resetAgent}
          disabled={isLoading || status?.running}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (isLoading || status?.running) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || status?.running) ? 0.6 : 1,
          }}
        >
          <RefreshIcon size={16} />
          Reset
        </button>

        <button
          onClick={exportTrace}
          disabled={!status?.flow_trace}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !status?.flow_trace ? 'not-allowed' : 'pointer',
            opacity: !status?.flow_trace ? 0.6 : 1,
          }}
        >
          <DownloadIcon size={16} />
          Export Trace
        </button>
      </div>

      {/* Status Message */}
      {isLoading && (
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '14px',
        }}>
          Processing...
        </div>
      )}
    </div>
  );
};

export default AgentConstructor;

