import test from 'node:test';
import assert from 'node:assert/strict';
import { forecastClientConsumption } from './clientForecast.js';

test('returns strict insufficient-data result for fewer than three transactions', () => {
  const result = forecastClientConsumption({ clientId: 'C-1', transactions: [{ date: '2026-01-01', quantity: 10 }] });
  assert.equal(result.insufficient_data, true);
  assert.equal(result.niveau_confiance, 'faible');
});

test('weights recent volumes more heavily and returns a three-month estimate', () => {
  const result = forecastClientConsumption({
    clientId: 'C-1',
    transactions: [
      { date: '2026-01-10', quantity: 30 }, { date: '2026-02-10', quantity: 30 },
      { date: '2026-04-10', quantity: 60 }, { date: '2026-05-10', quantity: 60 }, { date: '2026-06-10', quantity: 60 }
    ]
  });
  assert.equal(result.client_id, 'C-1');
  assert.equal(result.periode, 'prochains 3 mois');
  assert.equal(result.tendance, 'croissante');
  assert.ok(result.estimation_tonnes > 0);
  assert.equal(result.insufficient_data, undefined);
});
