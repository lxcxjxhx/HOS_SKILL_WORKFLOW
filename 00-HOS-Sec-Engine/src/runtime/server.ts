import http, { IncomingMessage, ServerResponse } from 'http';
import * as crypto from 'crypto';
import { ServerConfig } from './types';

interface AgentRecord {
  status: 'idle' | 'running' | 'completed' | 'failed';
  tasks: Array<{ taskId: string; payload: unknown }>;
  results: Array<{ taskId: string; result: unknown }>;
}

const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AGENTS = 100;                  // 最大 Agent 注册数量，防止恶意注册耗尽内存
const MAX_AGENT_TASKS = 50;              // 单个 Agent 最大任务队列长度
const MAX_AGENT_RESULTS = 100;           // 单个 Agent 最大结果存储数量

class BodySizeError extends Error {
  constructor() {
    super('Request body too large');
    this.name = 'BodySizeError';
  }
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        reject(new BodySizeError());
        req.destroy();
        return;
      }
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
  private agentStore: Map<string, AgentRecord> = new Map();

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
    return this.agentStore;
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
      if (error instanceof BodySizeError) {
        jsonResponse(res, 413, { error: error.message });
        return;
      }
      const message = error instanceof Error ? error.message : 'Internal error';
      jsonResponse(res, 500, { error: message });
    }
  }

  private async handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (this.agentStore.size >= MAX_AGENTS) {
      jsonResponse(res, 429, { error: `Maximum agents (${MAX_AGENTS}) reached` });
      return;
    }
    const body = await parseBody(req);
    const agentId = crypto.randomUUID();
    this.agentStore.set(agentId, {
      status: 'idle',
      tasks: [],
      results: [],
    });
    jsonResponse(res, 200, { status: 'registered', agentId });
  }

  private async handleTask(req: IncomingMessage, res: ServerResponse, agentId: string): Promise<void> {
    const agent = this.agentStore.get(agentId);
    if (!agent) {
      jsonResponse(res, 404, { error: 'Agent not found' });
      return;
    }
    if (agent.tasks.length >= MAX_AGENT_TASKS) {
      jsonResponse(res, 429, { error: `Maximum tasks (${MAX_AGENT_TASKS}) reached for agent` });
      return;
    }

    const body = await parseBody(req);
    const taskId = crypto.randomUUID();
    agent.tasks.push({ taskId, payload: body });
    agent.status = 'running';

    jsonResponse(res, 200, { taskId, status: 'accepted' });
  }

  private async handleResult(req: IncomingMessage, res: ServerResponse, agentId: string): Promise<void> {
    const agent = this.agentStore.get(agentId);
    if (!agent) {
      jsonResponse(res, 404, { error: 'Agent not found' });
      return;
    }
    if (agent.results.length >= MAX_AGENT_RESULTS) {
      // 结果已满，移除最旧的结果以腾出空间
      agent.results.shift();
    }

    const body = await parseBody(req);
    const lastTask = agent.tasks[agent.tasks.length - 1];
    agent.results.push({ taskId: lastTask?.taskId ?? 'unknown', result: body });
    agent.status = 'completed';

    jsonResponse(res, 200, { status: 'received' });
  }

  private async handleStatus(res: ServerResponse, agentId: string): Promise<void> {
    const agent = this.agentStore.get(agentId);
    if (!agent) {
      jsonResponse(res, 404, { error: 'Agent not found' });
      return;
    }

    jsonResponse(res, 200, { status: agent.status });
  }
}
