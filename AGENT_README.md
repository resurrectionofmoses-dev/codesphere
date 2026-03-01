# Agent Constructor

This project includes a Python agent with flow tracing capabilities and a React component for monitoring and controlling the agent.

## Files Created

### Python Agent (`agent.py`)
A background task runner with flow tracing designed to run as a Windows service, scheduled task, or in a separate terminal.

**Features:**
- Threaded background execution
- State management (idle, active, processing, waiting, completed, error)
- Recursive trace node system for tracking logic flow
- JSON export of execution traces
- Command-line interface

**Usage:**
```bash
# Run in foreground (blocking)
python agent.py --name "MyAgent"

# Run in background (non-blocking)
python agent.py --name "MyAgent" --background

# Export trace to JSON
python agent.py --name "MyAgent" --trace
```

**As a Windows Service (using NSSM):**
```bash
# Install as service
nssm install AgentConstruct "python" "C:\path\to\agent.py"
nssm set AgentConstruct AppDirectory "C:\path\to\project"
nssm set AgentConstruct Start SERVICE_AUTO_START

# Start/stop service
net start AgentConstruct
net stop AgentConstruct
```

### React Component (`AgentConstructor.tsx`)
A UI component for monitoring and controlling the agent.

**Features:**
- Start/Stop/Reset agent controls
- Real-time flow trace visualization
- State-colored node rendering
- Expandable trace tree
- Export trace to JSON

**API Endpoints:**
- `POST /api/agent/start` - Start the agent
- `POST /api/agent/stop` - Stop the agent
- `POST /api/agent/reset` - Reset the agent
- `GET /api/agent/status` - Get current status and trace

## Running the Project

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The AgentConstructor component will be available at `http://localhost:3000`

## Flow States

| State | Description | Color |
|-------|-------------|-------|
| idle | Not yet started | Gray |
| active | Currently executing | Blue |
| processing | Working on a task | Orange |
| waiting | Paused/waiting | Purple |
| completed | Finished successfully | Green |
| error | Failed with error | Red |

## Architecture

```
Agent Constructor
├── Python Backend (agent.py)
│   ├── Agent class - Main agent with background execution
│   ├── AgentFlow class - Manages trace flow
│   └── TraceNode class - Individual trace points
│
└── React Frontend (AgentConstructor.tsx)
    ├── Start/Stop/Reset controls
    ├── TraceNodeComponent - Recursive tree renderer
    └── API integration for real-time status
```

