#!/usr/bin/env node
/**
 * SEND ALL METRICS · QASL Framework F10.5
 * ─────────────────────────────────────────────────────────────────────────
 * Orquesta el envío de las 4 capas de métricas a InfluxDB (qa_metrics) leyendo
 * directamente los JSON de reports/ — sin re-ejecutar pruebas.
 *
 * Capas:
 *   1. E2E       ← reports/e2e/results.json          → measurement: e2e_tests
 *   2. API       ← reports/api/newman-report.json    → measurement: api_tests
 *   3. K6        ← reports/k6/k6-summary.json        → measurement: k6_performance
 *   4. ZAP       ← reports/zap/zap-report.json       → measurement: zap_security
 *
 * Uso:
 *   node scripts_metricas/send-all-metrics.mjs
 *   npm run metrics:send-all
 *
 * Pre-requisito:
 *   docker-compose up -d   (InfluxDB en localhost:8086)
 */

import fs from 'fs';
import path from 'path';
import {
  checkInfluxConnection,
  sendE2EMetrics,
  sendAPIMetrics,
  sendK6Metrics,
  sendZAPMetrics,
} from './influx-client.mjs';

const ROOT = process.cwd();
const E2E_RESULTS = path.join(ROOT, 'reports', 'e2e', 'results.json');
const API_RESULTS = path.join(ROOT, 'reports', 'api', 'newman-report.json');
const K6_SUMMARY = path.join(ROOT, 'reports', 'k6', 'k6-summary.json');
const ZAP_REPORT = path.join(ROOT, 'reports', 'zap', 'zap-report.json');

const RESULTS = [];

function banner() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  SEND ALL METRICS · F10.5 · QASL Framework → Grafana');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function track(layer, status, payload, error) {
  RESULTS.push({ layer, status, payload, error });
}

async function pushE2E() {
  const data = readJson(E2E_RESULTS);
  if (!data) {
    track('E2E', 'skipped', null, `No existe ${path.relative(ROOT, E2E_RESULTS)}`);
    return;
  }
  const stats = data.stats || {};
  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const skipped = stats.skipped ?? 0;
  const durationSec = (stats.duration ?? 0) / 1000;

  const ok = await sendE2EMetrics({
    suite: 'HU_REG_01',
    passed,
    failed,
    skipped,
    duration: durationSec,
  });
  track('E2E', ok ? 'sent' : 'failed', {
    suite: 'HU_REG_01',
    passed, failed, skipped,
    pass_rate: ((passed / Math.max(passed + failed + skipped, 1)) * 100).toFixed(2) + '%',
    duration_s: durationSec.toFixed(1),
  });
}

async function pushAPI() {
  const data = readJson(API_RESULTS);
  if (!data) {
    track('API', 'skipped', null, `No existe ${path.relative(ROOT, API_RESULTS)}`);
    return;
  }
  const assertions = data.run?.stats?.assertions || {};
  const requests = data.run?.stats?.requests || {};
  const timings = data.run?.timings || {};

  const totalAssertions = assertions.total ?? 0;
  const failed = assertions.failed ?? 0;
  const passed = totalAssertions - failed;
  const totalRequests = requests.total ?? 0;
  const durationSec = ((timings.completed ?? 0) - (timings.started ?? 0)) / 1000;
  const collection = data.collection?.info?.name ?? 'newman';

  const ok = await sendAPIMetrics({
    collection,
    passed,
    failed,
    total_requests: totalRequests,
    duration: durationSec,
  });
  track('API', ok ? 'sent' : 'failed', {
    collection,
    passed, failed,
    pass_rate: totalAssertions > 0 ? ((passed / totalAssertions) * 100).toFixed(2) + '%' : 'n/a',
    total_requests: totalRequests,
    duration_s: durationSec.toFixed(1),
  });
}

async function pushK6() {
  const data = readJson(K6_SUMMARY);
  if (!data) {
    track('K6', 'skipped', null, `No existe ${path.relative(ROOT, K6_SUMMARY)}`);
    return;
  }
  const m = data.metrics || {};
  const get = (key, sub) => m[key]?.values?.[sub];

  let thresholdsPassed = 0;
  let thresholdsFailed = 0;
  for (const metric of Object.values(m)) {
    if (!metric.thresholds) continue;
    for (const info of Object.values(metric.thresholds)) {
      if (info.ok) thresholdsPassed++;
      else thresholdsFailed++;
    }
  }

  let checksPassed = 0;
  let checksFailed = 0;
  function walkChecks(group) {
    if (group.checks) {
      for (const c of group.checks) {
        checksPassed += c.passes ?? 0;
        checksFailed += c.fails ?? 0;
      }
    }
    if (group.groups) for (const g of group.groups) walkChecks(g);
  }
  if (data.root_group) walkChecks(data.root_group);

  const payload = {
    test_name: 'HU_REG_01',
    iterations: get('iterations', 'count') ?? 0,
    http_requests: get('http_reqs', 'count') ?? 0,
    http_failed_rate: get('http_req_failed', 'rate') ?? 0,
    p95_response_time: get('http_req_duration', 'p(95)') ?? 0,
    p99_response_time: get('http_req_duration', 'p(99)') ?? 0,
    max_vus: get('vus_max', 'max') ?? 0,
    duration_seconds: (data.state?.testRunDurationMs ?? 0) / 1000,
    thresholds_passed: thresholdsPassed,
    thresholds_failed: thresholdsFailed,
    checks_passed: checksPassed,
    checks_failed: checksFailed,
  };
  const ok = await sendK6Metrics(payload);
  track('K6', ok ? 'sent' : 'failed', {
    test_name: payload.test_name,
    iterations: payload.iterations,
    http_requests: payload.http_requests,
    p95_ms: payload.p95_response_time.toFixed(1),
    max_vus: payload.max_vus,
    thresholds: `${thresholdsPassed}/${thresholdsPassed + thresholdsFailed}`,
    checks: `${checksPassed}/${checksPassed + checksFailed}`,
  });
}

async function pushZAP() {
  const data = readJson(ZAP_REPORT);
  if (!data) {
    track('ZAP', 'skipped', null, `No existe ${path.relative(ROOT, ZAP_REPORT)}`);
    return;
  }
  const counts = { high: 0, medium: 0, low: 0, informational: 0 };
  const byRiskcode = { '3': 'high', '2': 'medium', '1': 'low', '0': 'informational' };
  let target = 'unknown';
  for (const site of data.site || []) {
    target = site['@name'] || target;
    for (const alert of site.alerts || []) {
      const key = byRiskcode[String(alert.riskcode)];
      if (key) counts[key]++;
    }
  }

  const ok = await sendZAPMetrics({
    target,
    high: counts.high,
    medium: counts.medium,
    low: counts.low,
    informational: counts.informational,
  });
  track('ZAP', ok ? 'sent' : 'failed', {
    target,
    high: counts.high,
    medium: counts.medium,
    low: counts.low,
    informational: counts.informational,
    total_alerts: counts.high + counts.medium + counts.low + counts.informational,
  });
}

function printSummary() {
  console.log('');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('  RESUMEN');
  console.log('───────────────────────────────────────────────────────────────────────────');
  for (const r of RESULTS) {
    const icon = r.status === 'sent' ? '✓' : (r.status === 'skipped' ? '⊘' : '✗');
    const label = r.layer.padEnd(4);
    if (r.status === 'sent') {
      console.log(`  ${icon} ${label}  → ${JSON.stringify(r.payload)}`);
    } else if (r.status === 'skipped') {
      console.log(`  ${icon} ${label}  → skipped · ${r.error}`);
    } else {
      console.log(`  ${icon} ${label}  → fallo de envío`);
    }
  }
  console.log('───────────────────────────────────────────────────────────────────────────');
  const sent = RESULTS.filter((r) => r.status === 'sent').length;
  const skipped = RESULTS.filter((r) => r.status === 'skipped').length;
  const failed = RESULTS.filter((r) => r.status === 'failed').length;
  console.log(`  Total: ${sent} enviados · ${skipped} saltados · ${failed} fallidos`);
  console.log('');
  if (sent > 0) {
    console.log('  Verificar en Grafana → http://localhost:3001');
    console.log('  Dashboard            → "QA Control Center" (folder QA Control Center)');
  }
  console.log('');
}

(async function main() {
  banner();

  console.log('  Verificando conexión a InfluxDB...');
  const connected = await checkInfluxConnection();
  if (!connected) {
    console.error('  ✗ InfluxDB no disponible en localhost:8086');
    console.error('');
    console.error('  Levantá la infraestructura primero:');
    console.error('    docker-compose up -d');
    console.error('');
    process.exit(1);
  }
  console.log('  ✓ InfluxDB conectado');
  console.log('');

  console.log('  Leyendo reportes y enviando métricas...');
  console.log('');
  await pushE2E();
  await pushAPI();
  await pushK6();
  await pushZAP();

  printSummary();

  const failed = RESULTS.filter((r) => r.status === 'failed').length;
  process.exit(failed > 0 ? 1 : 0);
})();
