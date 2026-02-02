#!/usr/bin/env python3
"""
Agent Constructor - Background Task Runner with Flow Tracing
Designed to run as a background service or scheduled task
"""

import logging
import sys
import time
import json
import threading
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class AgentState(Enum):
    """Agent lifecycle states"""
    IDLE = "idle"
    ACTIVE = "active"
    PROCESSING = "processing"
    WAITING = "waiting"
    COMPLETED = "completed"
    ERROR = "error"


class TraceNode:
    """Represents a trace node in the logic flow"""
    
    def __init__(self, name: str, node_id: Optional[str] = None):
        self.name = name
        self.node_id = node_id or f"node_{int(time.time() * 1000)}"
        self.state = AgentState.IDLE
        self.timestamp = datetime.now()
        self.metadata: Dict[str, Any] = {}
        self.children: list = []
        self.parent: Optional['TraceNode'] = None
    
    def activate(self) -> 'TraceNode':
        """Activate this node in the flow"""
        self.state = AgentState.ACTIVE
        self.timestamp = datetime.now()
        logger.info(f"Node activated: {self.name} ({self.node_id})")
        return self
    
    def start_processing(self) -> 'TraceNode':
        """Mark node as processing"""
        self.state = AgentState.PROCESSING
        logger.debug(f"Node processing: {self.name}")
        return self
    
    def complete(self) -> 'TraceNode':
        """Mark node as completed"""
        self.state = AgentState.COMPLETED
        logger.info(f"Node completed: {self.name}")
        return self
    
    def wait(self) -> 'TraceNode':
        """Mark node as waiting"""
        self.state = AgentState.WAITING
        logger.debug(f"Node waiting: {self.name}")
        return self
    
    def add_child(self, child: 'TraceNode') -> 'TraceNode':
        """Add a child node to this node"""
        child.parent = self
        self.children.append(child)
        return self
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to dictionary for serialization"""
        return {
            "node_id": self.node_id,
            "name": self.name,
            "state": self.state.value,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
            "children": [child.to_dict() for child in self.children]
        }
    
    def __repr__(self):
        return f"TraceNode({self.name}, state={self.state.value})"


class AgentFlow:
    """Manages the logic flow and trace for the agent"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.root_node: Optional[TraceNode] = None
        self.current_node: Optional[TraceNode] = None
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
        self._lock = threading.Lock()
    
    def start(self) -> 'AgentFlow':
        """Start the flow with a root node"""
        with self._lock:
            self.start_time = datetime.now()
            self.root_node = TraceNode(f"{self.agent_name}_root").activate()
            self.current_node = self.root_node
            logger.info(f"Agent flow started: {self.agent_name}")
        return self
    
    def add_node(self, name: str) -> TraceNode:
        """Add a new node to the current flow"""
        with self._lock:
            new_node = TraceNode(name)
            if self.current_node:
                self.current_node.add_child(new_node)
                new_node.activate()
            self.current_node = new_node
            logger.info(f"Added node: {name}")
            return new_node
    
    def process_node(self, name: str, wait_time: float = 0) -> 'AgentFlow':
        """Process a node in the flow"""
        with self._lock:
            node = self.add_node(name)
            node.start_processing()
            if wait_time > 0:
                time.sleep(wait_time)
                node.wait()
            else:
                node.complete()
        return self
    
    def wait(self, seconds: float) -> 'AgentFlow':
        """Wait for specified seconds"""
        logger.debug(f"Waiting for {seconds} seconds...")
        time.sleep(seconds)
        if self.current_node:
            self.current_node.wait()
        return self
    
    def end(self) -> 'AgentFlow':
        """End the flow"""
        with self._lock:
            self.end_time = datetime.now()
            if self.current_node:
                self.current_node.complete()
            if self.root_node:
                self.root_node.complete()
            duration = (self.end_time - self.start_time).total_seconds()
            logger.info(f"Agent flow ended: {self.agent_name} (duration: {duration:.2f}s)")
        return self
    
    def get_trace(self) -> Dict[str, Any]:
        """Get the complete trace of the flow"""
        if self.root_node:
            return self.root_node.to_dict()
        return {"error": "Flow not started"}
    
    def export_trace(self, filepath: str = "agent_trace.json"):
        """Export trace to JSON file"""
        trace_data = {
            "agent_name": self.agent_name,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "trace": self.get_trace()
        }
        with open(filepath, 'w') as f:
            json.dump(trace_data, f, indent=2)
        logger.info(f"Trace exported to {filepath}")


class Agent:
    """Main agent class with background execution support"""
    
    def __init__(self, name: str, config: Optional[Dict] = None):
        self.name = name
        self.config = config or {}
        self.flow = AgentFlow(name)
        self._running = False
        self._thread: Optional[threading.Thread] = None
    
    def _run_logic(self):
        """Internal logic to be overridden or extended"""
        logger.info(f"Running logic for agent: {self.name}")
        
        # Example logic flow - customize as needed
        self.flow.start()
        
        # Process nodes in sequence
        self.flow.process_node("Initialize", wait_time=0.1)
        self.flow.process_node("Load Configuration", wait_time=0.1)
        self.flow.process_node("Process Tasks", wait_time=0.2)
        self.flow.process_node("Execute Actions", wait_time=0.1)
        self.flow.process_node("Cleanup", wait_time=0.1)
        
        self.flow.end()
        self.flow.export_trace()
        
        self._running = False
    
    def run(self, blocking: bool = True):
        """Run the agent
        
        Args:
            blocking: If True, blocks until complete. If False, runs in background.
        """
        logger.info(f"Starting agent: {self.name}")
        self._running = True
        
        if blocking:
            self._run_logic()
        else:
            self._thread = threading.Thread(target=self._run_logic, daemon=True)
            self._thread.start()
            logger.info(f"Agent started in background: {self.name}")
    
    def run_background(self):
        """Run agent in background (non-blocking)"""
        self.run(blocking=False)
    
    def stop(self):
        """Stop the running agent"""
        self._running = False
        logger.info(f"Agent stopped: {self.name}")
    
    @property
    def is_running(self) -> bool:
        """Check if agent is currently running"""
        return self._running
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "name": self.name,
            "running": self._running,
            "flow_trace": self.flow.get_trace()
        }


def main():
    """Main entry point - can be run directly or imported"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Agent Constructor - Background Task Runner")
    parser.add_argument("--name", default="AgentConstruct", help="Agent name")
    parser.add_argument("--background", action="store_true", help="Run in background")
    parser.add_argument("--trace", action="store_true", help="Export trace to JSON")
    args = parser.parse_args()
    
    # Create and run agent
    agent = Agent(args.name)
    
    if args.background:
        agent.run_background()
        print(f"Agent '{args.name}' started in background (PID: {threading.current_thread().ident})")
        # Keep main thread alive for daemon thread
        try:
            while agent.is_running:
                time.sleep(1)
        except KeyboardInterrupt:
            agent.stop()
    else:
        agent.run(blocking=True)
        if args.trace:
            agent.flow.export_trace()


if __name__ == "__main__":
    main()

