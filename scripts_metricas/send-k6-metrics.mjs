#!/usr/bin/env node
/**
 * SEND K6 METRICS · QASL Framework F10.3
 * ─────────────────────────────────────────────────────────────────────────
 * Lee reports/k6/k6-summary.json (handleSummary aggregate) y manda al
 * measurement `k6_performance` en InfluxDB · qa_metrics, para los tiles
 * de alto nivel del dashboard Grafana.
 *
 * Las métricas streaming detalladas (http_req_duration, vus, iterations
 * por timestamp) las manda K6 directo via `k6 run --out influxdb=...`
 * desde scripts/run-k6.mjs.
 */

import fs from 'fs';
import path from 'path';
import { sendK6Metrics, checkInfluxConnection } from './influx-client.mjs';

const SUMMARY_JSON = path.join('reports', 'k6', 'k6-summary.json');

function get(metrics, key, sub) {
  return metrics?.[key]?.values?.[sub];
}

function countThresholds(metrics) {
  let passed = 0;
  let failed = 0;
  for (const m of Object.values(metrics || {})) {
    if (!m.thresholds) continue;
    for (const info of Object.values(m.thresholds)) {
      if (info.ok) passed++;
      else failed++;
    }
  }
  return { passed, failed };
}

function countChecks(rootGroup) {
  let passed = 0;
  let failed = 0;
  function walk(group) {
    if (group.checks) {
      for (const c of group.checks) {
        passed += c.passes || 0;
        failed += c.fails || 0;
      }
    }
    if (group.groups) {
      for (const g of group.groups) walk(g);
    }
  }
  if (rootGroup) walk(rootGroup);
  return { passed, failed };
}

(async function main() {
  console.log('');
  console.log('  📊 Enviando métricas K6 a InfluxDB...');

  if (!fs.existsSync(SUMMARY_JSON)) {
    console.log(`  ⚠️ No existe ${SUMMARY_JSON}. Métricas no enviadas.`);
    return;
  }

  const connected = await checkInfluxConnection();
  if (!connected) {
    console.log('  ⚠️ InfluxDB no disponible. Métricas no enviadas.');
    return;
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY_JSON, 'utf-8'));
  const m = summary.metrics || {};
  const thresholds = countThresholds(m);
  const checks = countChecks(summary.root_group);

  await sendK6Metrics({
    test_name: 'HU_REG_01',
    iterations: get(m, 'iterations', 'count') ?? 0,
    http_requests: get(m, 'http_reqs', 'count') ?? 0,
    http_failed_rate: get(m, 'http_req_failed', 'rate') ?? 0,
    p95_response_time: get(m, 'http_req_duration', 'p(95)') ?? 0,
    p99_response_time: get(m, 'http_req_duration', 'p(99)') ?? 0,
    max_vus: get(m, 'vus_max', 'max') ?? 0,
    duration_seconds: (summary.state?.testRunDurationMs ?? 0) / 1000,
    thresholds_passed: thresholds.passed,
    thresholds_failed: thresholds.failed,
    checks_passed: checks.passed,
    checks_failed: checks.failed,
  });

  console.log(`  ✓ Métricas enviadas: ${checks.passed} checks passed · ${thresholds.passed}/${thresholds.passed + thresholds.failed} thresholds passed`);
})();
