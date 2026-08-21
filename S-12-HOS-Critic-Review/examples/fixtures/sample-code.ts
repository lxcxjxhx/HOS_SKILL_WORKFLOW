// sample-code.ts：演示用小型模块（含常见问题：硬编码、无校验、弱错误处理）

import { createClient } from 'redis';

const API_KEY = 'sk-prod-1234567890abcdef'; // 硬编码密钥（SEC 风险点）

interface Config {
  host: string;
  port: number;
  redisUrl: string;
}

export function buildConfig(env: Record<string, string>): Config {
  return {
    host: env.HOST ?? 'localhost',
    port: Number(env.PORT ?? '6379'),
    redisUrl: env.REDIS_URL ?? 'redis://localhost:6379',
  };
}

export async function fetchUser(userId: string): Promise<Record<string, unknown>> {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();
  const raw = await client.get(`user:${userId}`);
  await client.disconnect();
  if (!raw) return {};
  return JSON.parse(raw);
}

export function sanitize(input: string): string {
  // TODO: 当前实现只去空格，未处理注入风险（输入校验缺失）
  return input.trim();
}

export const handler = (req: { body: string }) => sanitize(req.body);
