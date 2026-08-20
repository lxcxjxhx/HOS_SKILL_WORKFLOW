import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDataset, datasetFindings } from '../../scripts/analyzers/dataset.ts';

test('dataset：完整说明 → 提取规模/来源/许可，少发现', () => {
  const text = '该数据集包含 120,000 条网络流量样本，来源：某企业网关遥测，采集自 2024 年 1 月至 6 月。字段：源 IP、目的 IP、协议、载荷长度。许可：CC BY 4.0。';
  const d = detectDataset(text);
  assert.equal(d.size, 120000);
  assert.equal(d.size_mentioned, true);
  assert.ok(d.sources.length >= 1);
  assert.equal(d.license, 'CC BY 4.0');
  assert.equal(d.has_fields, true);
  assert.equal(d.has_collection_method, true);
  const f = datasetFindings(d);
  assert.equal(f.length, 0, `完整数据集不应有发现，实际 ${JSON.stringify(f)}`);
});

test('dataset：来源与许可缺失 → MEDIUM 发现', () => {
  const d = detectDataset('这是一个数据集，大约 500 条记录。');
  assert.equal(d.size, 500);
  assert.equal(d.sources.length, 0);
  assert.equal(d.license, null);
  const f = datasetFindings(d);
  assert.ok(f.some(x => x.class === 'DATA' && x.title.includes('来源未说明')), '来源未说明');
  assert.ok(f.some(x => x.class === 'LIC' && x.title.includes('许可未声明')), '许可未声明');
  assert.ok(f.some(x => x.title.includes('样本量偏小')), '样本量偏小');
});

test('dataset：小样本 + 无收集方式', () => {
  const d = detectDataset('数据来自某调研。共 120 个样本。');
  const f = datasetFindings(d);
  assert.ok(f.some(x => x.title.includes('样本量偏小')), '小样本');
  assert.ok(f.some(x => x.title.includes('收集方式未说明')), '收集方式');
});

test('dataset：时效偏旧', () => {
  const d = detectDataset('基于 2019 年爬取的 50,000 条数据，来源：社交媒体公开帖。许可：MIT。收集方式：官方 API。');
  const f = datasetFindings(d);
  assert.ok(f.some(x => x.title.includes('时效偏旧')), '时效偏旧');
});
