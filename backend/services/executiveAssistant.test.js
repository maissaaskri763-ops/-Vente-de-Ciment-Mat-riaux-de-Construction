import test from 'node:test';
import assert from 'node:assert/strict';
import { runExecutiveTool } from './executiveAssistant.js';

const data = {
  transactions: [{ cod_cli: '7', date_liv: '2026-01-01', qte_liv: 10, lib_gouv: 'TUNIS', mnt_ttc: 100 }],
  customers: [{ code: '7', credit_ratio: 0.4 }, { code: '8', credit_ratio: 0.8 }],
  products: [{ name: 'CEM I' }]
};

test('regional tool returns only matching transactional data', () => {
  assert.deepEqual(runExecutiveTool('get_regional_stats', { region: 'tunis' }, data), { region: 'TUNIS', transactions: 1, quantity_tonnes: 10, revenue_tnd: 100 });
});

test('risk tool orders clients by credit ratio', () => {
  assert.equal(runExecutiveTool('get_top_risk_clients', { limit: 1 }, data)[0].code, '8');
});
