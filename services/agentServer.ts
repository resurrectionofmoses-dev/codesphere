import { ViteDevServer } from 'vite';

// In-memory agent storage (in production, use a proper database)
const agents = new Map();

export function setupAgentRoutes(server: ViteDevServer) {
  // Start agent endpoint
  server.middlewares.use('/api/agent/start', async (req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { name, background } = JSON.parse(body);
          
          // Create or get agent
          if (!agents.has(name)) {
            agents.set(name, {
              name,
              running: true,
              startTime: new Date().toISOString(),
              flow_trace: {
                node_id: `${name}_root`,
                name: `${name}_root`,
                state: 'active',
                timestamp: new Date().toISOString(),
                metadata: {},
                children: []
              }
            });
          } else {
            const agent = agents.get(name);
            agent.running = true;
            agent.startTime = new Date().toISOString();
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Agent started' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request' }));
        }
      });
    } else {
      res.writeHead(405);
      res.end();
    }
  });

  // Stop agent endpoint
  server.middlewares.use('/api/agent/stop', async (req, res) => {
    if (req.method === 'POST') {
      agents.forEach((agent, name) => {
        agent.running = false;
        if (agent.flow_trace) {
          agent.flow_trace.state = 'completed';
        }
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Agent stopped' }));
    } else {
      res.writeHead(405);
      res.end();
    }
  });

  // Reset agent endpoint
  server.middlewares.use('/api/agent/reset', async (req, res) => {
    if (req.method === 'POST') {
      agents.clear();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Agent reset' }));
    } else {
      res.writeHead(405);
      res.end();
    }
  });

  // Get agent status endpoint
  server.middlewares.use('/api/agent/status', async (req, res) => {
    if (req.method === 'GET') {
      // Return the first running agent or a default status
      let status = {
        name: 'AgentConstruct',
        running: false,
        flow_trace: null
      };
      
      for (const [name, agent] of agents) {
        if (agent.running) {
          status = agent;
          break;
        }
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
    } else {
      res.writeHead(405);
      res.end();
    }
  });
}

