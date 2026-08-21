/**
 * 事件流（对应 docs/07 §7.4）：CLI 以 --events 开启，输出 JSON 行事件供上游工作流订阅。
 * 事件序列固定且单调：review.started → discovery.done → chunk.done → analyze.done → … → review.finished
 */
export interface ReviewEvent {
  event: string;
  ts: string;
  [k: string]: unknown;
}

let enabled = false;

export function enableEvents(): void {
  enabled = true;
}

export function isEventsEnabled(): boolean {
  return enabled;
}

export function formatEvent(name: string, payload: Record<string, unknown> = {}): ReviewEvent {
  return { event: name, ts: new Date().toISOString(), ...payload };
}

export function emitEvent(name: string, payload?: Record<string, unknown>): void {
  if (enabled) console.log(JSON.stringify(formatEvent(name, payload)));
}
