import http, { IncomingMessage, ServerResponse } from 'http';
import { ServerConfig } from './types';

interface AgentRecord {
  status: 'idle' | 'running' | 'completed' | 'failed';
  tasks: Array<{ taskId: string; payload: unknown }>;
  results: Array<{ taskId: string; result: unknown }>;
}

const agentStore: Map<string, AgentRecord> = new Map();

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function jsonResponse(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function extractAgentId(req: IncomingMessage): string | null {
  const url = req.url ?? '';
  const match = url.match(/^\/api\/agents\/([^/]+)/);
  return match ? match[1] : null;
}

export class AgentServer {
  private server: http.Server | null = null;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));

      this.server.listen(this.config.port, this.config.host ?? '127.0.0.1', () => {
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getAgents(): ReadonlyMap<string, AgentRecord> {
    return agentStore;
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const url = req.url ?? '';
      const method = req.method ?? 'GET';

      if (method === 'POST' && url === '/api/agents/register') {
        await this.handleRegister(req, res);
      } else if (method === 'POST' && url.match(/^\/api\/agents\/[^/]+\/task$/)) {
        const agentId = extractAgentId(req);
        if (agentId) {
          await this.handleTask(req, res, agentId);
        } else {
          jsonResponse(res, 400, { error: 'Missing agentId' });
        }
      } else if (method === 'POST' && url.match(/^\/api\/agents\/[^/]+\/result$/)) {
        const agentId = extractAgentId(req);
        if (agentId) {
          await this.handleResult(req, res, agentId);
        } else {
          jsonResponse(res, 400, { error: 'Missing agentId' });
        }
      } else if (method === 'GET' && url.match(/^\/api\/agents\/[^/]+\/status$/)) {
        const agentId = extractAgentId(req);
        if (agentId) {
          await this.handleStatus(res, agentId);
        } else {
          jsonResponse(res, 400, { error: 'Missing agentId' });
        }
      } else {
        jsonResponse(res, 404, { error: 'Not found' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      jsonResponse(res, 500, { error: message });
    }
  }

  private async handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await parseBody(req);
    const agentId = crypto.randomUUID();
    agentStore.set(agentId, {
      status: 'idle',
      tasks: [],
      results: [],
    });
    jsonResponse(res, 200, { status: 'registered', agentId });
  }

  private async handleTask(req: IncomingMessage, res: ServerResponse, agentId: string): Promise<void> {
    const agent = agentStore.get(agentId);
    if (!agent) {
      jsonResponse(res, 404, { error: 'Agent not found' });
      return;
    }

    const body = await parseBody(req);
    const taskId = crypto.randomUUID();
    agent.tasks.push({ taskId, payload: body });
    agent.status = 'running';

    jsonResponse(res, 200, { taskId, status: 'accepted' });
  }

  private async handleResult(req: IncomingMessage, res: ServerResponse, agentId: string): Promise<void> {
    const agent = agentStore.get(agentId);
    if (!agent) {
      jsonResponse(res, 404, { error: 'Agent not found' });
      return;
    }

    const body = await parseBody(req);
    const lastTask = agent.tasks[agent.tasks.length - 1];
    agent.results.push({ taskId: lastTask?.taskId ?? 'unknown', result: body });
    agent.status = 'completed';

    jsonResponse(res, 200, { status: 'received' });
  }

  private async handleStatus(res: ServerResponse, agentId: string): Promise<void> {
    const agent = agentStore.get(agentId);
    if (!agent) {
      jsonResponse(res, 404, { error: 'Agent not found' });
      return;
    }

    jsonResponse(res, 200, { status: agent.status });
  }
}
