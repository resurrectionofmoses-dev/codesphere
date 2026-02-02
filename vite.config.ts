import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory agent storage
const agents = new Map<string, any>();

function agentApiPlugin(): Plugin {
  return {
    name: 'agent-api',
    configureServer(server: any) {
      // Start agent endpoint
      server.middlewares.use('/api/agent/start', (req: any, res: any, next: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { name, background } = JSON.parse(body);
              
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
                    children: [
                      {
                        node_id: `${name}_init`,
                        name: 'Initialize',
                        state: 'completed',
                        timestamp: new Date().toISOString(),
                        metadata: {},
                        children: []
                      },
                      {
                        node_id: `${name}_config`,
                        name: 'Load Configuration',
                        state: 'processing',
                        timestamp: new Date().toISOString(),
                        metadata: {},
                        children: []
                      },
                      {
                        node_id: `${name}_process`,
                        name: 'Process Tasks',
                        state: 'waiting',
                        timestamp: new Date().toISOString(),
                        metadata: {},
                        children: []
                      },
                      {
                        node_id: `${name}_execute`,
                        name: 'Execute Actions',
                        state: 'idle',
                        timestamp: new Date().toISOString(),
                        metadata: {},
                        children: []
                      }
                    ]
                  }
                });
              } else {
                const agent = agents.get(name);
                agent.running = true;
                agent.startTime = new Date().toISOString();
                if (agent.flow_trace) {
                  agent.flow_trace.state = 'active';
                }
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
      server.middlewares.use('/api/agent/stop', (req: any, res: any) => {
        if (req.method === 'POST') {
          agents.forEach((agent: any) => {
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
      server.middlewares.use('/api/agent/reset', (req: any, res: any) => {
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
      server.middlewares.use('/api/agent/status', (req: any, res: any) => {
        if (req.method === 'GET') {
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
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), agentApiPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
