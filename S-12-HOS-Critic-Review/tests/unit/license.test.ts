import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLicense, licenseFindings } from '../../scripts/analyzers/license.ts';

test('license：SPDX 标识识别（MIT）', () => {
  const d = detectLicense('This project is licensed under the MIT License. Copyright (c) 2026.');
  assert.equal(d.spdx, 'MIT');
  assert.equal(d.matched_by, 'identifier');
});

test('license：标准文本特征识别（Apache-2.0）', () => {
  const d = detectLicense('Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.');
  assert.equal(d.spdx, 'Apache-2.0');
  assert.equal(d.matched_by, 'text');
});

test('license：无声明 → MEDIUM finding', () => {
  const d = detectLicense('Copyright (c) 2026 Some Company. All rights reserved.');
  assert.equal(d.spdx, null);
  const f = licenseFindings(d);
  assert.ok(f.some(x => x.class === 'LIC' && x.severity === 'MEDIUM' && x.title.includes('无许可证')));
});

test('license：AGPL → HIGH copyleft 风险', () => {
  const d = detectLicense('This software is released under the GNU Affero General Public License v3.0.');
  assert.equal(d.spdx, 'AGPL-3.0');
  const f = licenseFindings(d);
  assert.ok(f.some(x => x.class === 'LIC' && x.severity === 'HIGH' && x.title.includes('AGPL')));
});

test('license：MIT 带免责 → 无 copyleft、无免责缺失 finding', () => {
  const d = detectLicense('MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.');
  const f = licenseFindings(d);
  assert.equal(f.length, 0, `MIT+免责不应产生 finding，实际 ${JSON.stringify(f)}`);
});
