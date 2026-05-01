#!/usr/bin/env node
/**
 * RUN K6 · QASL Framework F10.3
 * ─────────────────────────────────────────────────────────────────────────
 * Orquesta la ejecución del test K6 standalone (performance/HU_REG_01.k6.js)
 * con flujo dinámico de adquisición de token y concurrencia parametrizable.
 *
 * Uso:
 *   node scripts/run-k6.mjs                          # default: 2 VUs, 20s hold
 *   node scripts/run-k6.mjs --vus=5 --duration=60s   # override
 *
 * Outputs en reports/k6/:
 *   k6-summary.json    handleSummary aggregate (KPIs, thresholds, checks)
 *   k6-results.json    Streaming raw points (insumo de gráficos time-series)
 *   k6-report.html     Reporte profesional fondo blanco (generado por k6-html-report.mjs)
 *   k6-summary.txt     Stdout summary
 *
 * Si Docker está up con InfluxDB → métricas streaming a Grafana.
 */

import { spawnSync, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const ROOT = process.cwd();
const PERF_SCRIPT = path.join(ROOT, 'performance', 'HU_REG_01.k6.js');
const REPORTS_DIR = path.join(ROOT, 'reports', 'k6');

const SUMMARY_JSON = path.join(REPORTS_DIR, 'k6-summary.json');
const RESULTS_JSON = path.join(REPORTS_DIR, 'k6-results.json');
const SUMMARY_TXT = path.join(REPORTS_DIR, 'k6-summary.txt');
const HTML_REPORT = path.join(REPORTS_DIR, 'k6-report.html');

const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086';
const INFLUX_DB = process.env.INFLUX_DB || 'k6';

function banner() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  PERFORMANCE TEST RUNNER · F10.3 · K6 + Custom HTML Report');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
}

function parseArg(name, fallback) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=')[1] : fallback;
}

function verifyK6Installed() {
  try {
    const out = execSync('k6 version', { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    console.log(`  k6 binary: ${out}`);
  } catch {
    console.error('  ERROR: k6 no está instalado.');
    console.error('  Instalar desde: https://k6.io/docs/getting-started/installation/');
    process.exit(1);
  }
}

function verifyTestScript() {
  if (!fs.existsSync(PERF_SCRIPT)) {
    console.error(`  ERROR: No existe ${PERF_SCRIPT}`);
    process.exit(1);
  }
}

function detectInfluxDB() {
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${INFLUX_URL}/ping`, { stdio: 'pipe', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

function runK6(vus, duration) {
  const env = {
    ...process.env,
    K6_VUS: String(vus),
    K6_DURATION: duration,
    K6_SUMMARY_JSON: SUMMARY_JSON,
    BASE_URL: process.env.BASE_URL || 'https://automationexercise.com',
  };

  const args = ['run', PERF_SCRIPT, '--out', `json=${RESULTS_JSON}`];

  if (detectInfluxDB()) {
    console.log(`  InfluxDB: CONECTADO (${INFLUX_URL}) → métricas streaming a Grafana`);
    args.push('--out', `influxdb=${INFLUX_URL}/${INFLUX_DB}`);
  } else {
    console.log('  InfluxDB: NO DISPONIBLE (docker-compose up -d para activar Grafana streaming)');
  }
  console.log('');
  console.log(`  ▶ k6 ${args.join(' ')}`);
  console.log('───────────────────────────────────────────────────────────────────────────');

  const result = spawnSync('k6', args, { stdio: ['inherit', 'pipe', 'inherit'], env });
  if (result.stdout) {
    const stdoutStr = result.stdout.toString();
    process.stdout.write(stdoutStr);
    fs.writeFileSync(SUMMARY_TXT, stdoutStr, 'utf-8');
  }
  return result.status ?? 1;
}

function generateHtmlReport() {
  console.log('');
  console.log('  Generando reporte HTML profesional...');
  const result = spawnSync('node', [path.join('scripts', 'k6-html-report.mjs')], {
    stdio: 'inherit',
    shell: true,
  });
  return result.status ?? 1;
}

function sendInfluxSummary() {
  if (!fs.existsSync(SUMMARY_JSON)) return;
  try {
    spawnSync('node', [path.join('scripts_metricas', 'send-k6-metrics.mjs')], {
      stdio: 'inherit',
      shell: true,
    });
  } catch {
    // Métricas opcionales
  }
}

(function main() {
  banner();
  const vus = parseInt(parseArg('vus', '2'), 10);
  const duration = parseArg('duration', '20s');

  console.log(`  Test script    : ${path.relative(ROOT, PERF_SCRIPT)}`);
  console.log(`  VUs            : ${vus}`);
  console.log(`  Hold duration  : ${duration} (+ 5s ramp-up + 5s ramp-down)`);
  console.log(`  Reports        : ${path.relative(ROOT, REPORTS_DIR)}/`);
  console.log('');

  verifyK6Installed();
  verifyTestScript();
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const k6ExitCode = runK6(vus, duration);
  console.log('');

  if (!fs.existsSync(SUMMARY_JSON)) {
    console.error('  ERROR: No se generó k6-summary.json. El reporte HTML no se construirá.');
    process.exit(k6ExitCode);
  }

  generateHtmlReport();
  sendInfluxSummary();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  ARTEFACTOS GENERADOS · F10.3');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`  K6 summary JSON  : ${path.relative(ROOT, SUMMARY_JSON)}`);
  console.log(`  K6 raw results   : ${path.relative(ROOT, RESULTS_JSON)}`);
  console.log(`  K6 summary TXT   : ${path.relative(ROOT, SUMMARY_TXT)}`);
  console.log(`  HTML report      : ${path.relative(ROOT, HTML_REPORT)}`);
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');

  process.exit(k6ExitCode);
})();
