import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEvent, enableEvents, isEventsEnabled } from '../../scripts/events.ts';

test('events：formatEvent 输出固定结构', () => {
  const e = formatEvent('discovery.done', { object_id: 'obj-x', type: 'repo' });
  assert.equal(e.event, 'discovery.done');
  assert.equal(e.object_id, 'obj-x');
  assert.equal(typeof e.ts, 'string');
  assert.ok(!Number.isNaN(Date.parse(e.ts)), 'ts 应为合法时间戳');
});

test('events：事件名遵循固定序列', () => {
  const sequence = ['review.started', 'discovery.done', 'chunk.done', 'analyze.done', 'evidence.done', 'critic.done', 'judge.done', 'report.done', 'review.finished'];
  for (const name of sequence) {
    const e = formatEvent(name);
    assert.equal(e.event, name);
  }
});

test('events：enableEvents 开关', () => {
  assert.equal(isEventsEnabled(), false);
  enableEvents();
  assert.equal(isEventsEnabled(), true);
});
