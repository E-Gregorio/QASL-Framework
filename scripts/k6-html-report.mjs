#!/usr/bin/env node
/**
 * K6 HTML REPORT GENERATOR · QASL Framework F10.3
 * ─────────────────────────────────────────────────────────────────────────
 * Lee:
 *   reports/k6/k6-summary.json  (aggregates de handleSummary)
 *   reports/k6/k6-results.json  (streaming raw points para time-series)
 *
 * Genera:
 *   reports/k6/k6-report.html   (fondo blanco, KPIs, gráficos Chart.js, tablas)
 *
 * Diseño: fondo blanco · paleta gris+azul corporativo · sin colores chillones.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports', 'k6');
const SUMMARY_JSON = path.join(REPORTS_DIR, 'k6-summary.json');
const RESULTS_JSON = path.join(REPORTS_DIR, 'k6-results.json');
const HTML_REPORT = path.join(REPORTS_DIR, 'k6-report.html');

const TIME_BUCKETS = 30;

function fmt(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return Number(value).toFixed(decimals);
}

function pct(rate) {
  if (rate === null || rate === undefined) return 'n/a';
  return `${(rate * 100).toFixed(2)}%`;
}

function ms(value) {
  if (value === null || value === undefined) return 'n/a';
  return `${Number(value).toFixed(1)} ms`;
}

async function readResultsTimeSeries() {
  const series = {
    http_req_duration: [],
    http_reqs: [],
    vus: [],
    http_req_failed: [],
  };
  if (!fs.existsSync(RESULTS_JSON)) return series;

  const stream = fs.createReadStream(RESULTS_JSON, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream });
  for await (const line of rl) {
    if (!line || !line.startsWith('{')) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type !== 'Point') continue;
      const target = series[obj.metric];
      if (!target) continue;
      target.push({ t: new Date(obj.data.time).getTime(), v: obj.data.value });
    } catch {
      continue;
    }
  }
  return series;
}

function bucketize(points, buckets = TIME_BUCKETS, agg = 'avg') {
  if (points.length === 0) return { labels: [], values: [] };
  const t0 = points[0].t;
  const tN = points[points.length - 1].t;
  const span = Math.max(tN - t0, 1);
  const bins = Array.from({ length: buckets }, () => []);
  for (const p of points) {
    const idx = Math.min(buckets - 1, Math.floor(((p.t - t0) / span) * buckets));
    bins[idx].push(p.v);
  }
  const labels = bins.map((_, i) => ((i * span) / buckets / 1000).toFixed(0) + 's');
  const values = bins.map((arr) => {
    if (arr.length === 0) return 0;
    if (agg === 'sum') return arr.reduce((s, x) => s + x, 0);
    if (agg === 'max') return Math.max(...arr);
    if (agg === 'p95') {
      const sorted = [...arr].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length * 0.95)] || 0;
    }
    return arr.reduce((s, x) => s + x, 0) / arr.length;
  });
  return { labels, values };
}

function buildHtml(summary, series) {
  const m = summary.metrics || {};
  const get = (key, sub) => (m[key] && m[key].values ? m[key].values[sub] : undefined);

  const iterations = get('iterations', 'count') ?? 0;
  const httpReqs = get('http_reqs', 'count') ?? 0;
  const reqRate = get('http_reqs', 'rate') ?? 0;
  const failRate = get('http_req_failed', 'rate') ?? 0;
  const avgMs = get('http_req_duration', 'avg') ?? 0;
  const p50Ms = get('http_req_duration', 'med') ?? 0;
  const p95Ms = get('http_req_duration', 'p(95)') ?? 0;
  const p99Ms = get('http_req_duration', 'p(99)') ?? 0;
  const maxMs = get('http_req_duration', 'max') ?? 0;
  const maxVus = get('vus_max', 'max') ?? 0;
  const dataSent = get('data_sent', 'count') ?? 0;
  const dataRecv = get('data_received', 'count') ?? 0;

  const setupRate = get('setup_create_account_success', 'rate') ?? 0;
  const authRate = get('auth_verify_login_success', 'rate') ?? 0;
  const authdRate = get('authd_search_product_success', 'rate') ?? 0;
  const teardownRate = get('teardown_delete_account_success', 'rate') ?? 0;
  const tokenP95 = get('token_acquisition_ms', 'p(95)') ?? 0;
  const businessTx = get('business_transactions_completed', 'count') ?? 0;

  const thresholds = [];
  for (const [metricName, metric] of Object.entries(m)) {
    if (metric.thresholds) {
      for (const [expr, info] of Object.entries(metric.thresholds)) {
        thresholds.push({
          metric: metricName,
          expression: expr,
          ok: info.ok === true,
        });
      }
    }
  }

  const checksFlat = [];
  function walkChecks(group, prefix = '') {
    if (group.checks) {
      for (const c of group.checks) {
        checksFlat.push({
          name: prefix ? `${prefix} › ${c.name}` : c.name,
          passes: c.passes ?? 0,
          fails: c.fails ?? 0,
        });
      }
    }
    if (group.groups) {
      for (const g of group.groups) {
        walkChecks(g, prefix ? `${prefix} › ${g.name}` : g.name);
      }
    }
  }
  if (summary.root_group) walkChecks(summary.root_group);

  const respTime = bucketize(series.http_req_duration, TIME_BUCKETS, 'avg');
  const respTimeP95 = bucketize(series.http_req_duration, TIME_BUCKETS, 'p95');
  const reqRateBuckets = bucketize(series.http_reqs, TIME_BUCKETS, 'sum');
  const vusBuckets = bucketize(series.vus, TIME_BUCKETS, 'max');

  const generatedAt = new Date().toLocaleString('es-AR', { hour12: false });

  const allThresholdsOk = thresholds.every((t) => t.ok);
  const totalChecks = checksFlat.reduce((s, c) => s + c.passes + c.fails, 0);
  const failedChecks = checksFlat.reduce((s, c) => s + c.fails, 0);
  const passedChecks = totalChecks - failedChecks;

  const PASS = '#059669';
  const FAIL = '#dc2626';
  const ACCENT = '#2563eb';
  const ACCENT_SOFT = 'rgba(37, 99, 235, 0.10)';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QASL Framework · K6 Performance Report · HU_REG_01</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    line-height: 1.5;
  }
  .container { max-width: 1280px; margin: 0 auto; padding: 32px 40px; }
  .header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 24px;
    margin-bottom: 32px;
    display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;
  }
  .header h1 { margin: 0; font-size: 24px; font-weight: 600; color: #111827; }
  .header h1 .accent { color: ${ACCENT}; }
  .header .subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .header .meta { text-align: right; font-size: 12px; color: #6b7280; }
  .header .meta strong { color: #1f2937; font-weight: 600; }

  .badge {
    display: inline-block; padding: 4px 10px; border-radius: 4px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
  }
  .badge-pass { background: #ecfdf5; color: ${PASS}; border: 1px solid #a7f3d0; }
  .badge-fail { background: #fef2f2; color: ${FAIL}; border: 1px solid #fecaca; }

  h2 {
    font-size: 14px; font-weight: 600; color: #111827;
    text-transform: uppercase; letter-spacing: 0.05em;
    margin: 40px 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }

  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  }
  .kpi-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 18px 20px;
  }
  .kpi-card .label {
    font-size: 11px; color: #6b7280; text-transform: uppercase;
    letter-spacing: 0.04em; font-weight: 500; margin-bottom: 8px;
  }
  .kpi-card .value { font-size: 26px; font-weight: 600; color: #111827; line-height: 1.1; }
  .kpi-card .unit { font-size: 13px; color: #6b7280; margin-left: 4px; font-weight: 400; }
  .kpi-card.accent { border-left: 3px solid ${ACCENT}; }
  .kpi-card.pass .value { color: ${PASS}; }
  .kpi-card.fail .value { color: ${FAIL}; }

  .chart-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }
  .chart-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 20px;
  }
  .chart-card .chart-title {
    font-size: 13px; font-weight: 600; color: #374151;
    margin-bottom: 12px;
  }
  .chart-card .chart-subtitle {
    font-size: 11px; color: #6b7280; margin-bottom: 16px;
  }
  .chart-card canvas { max-height: 240px; }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  th {
    background: #f9fafb; font-weight: 600; color: #374151;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr:last-child td { border-bottom: none; }
  .table-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }
  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 12px;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 3px;
    color: #374151;
  }

  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
  }
  .footer .stack {
    display: inline-flex; gap: 16px; align-items: center;
  }
  .footer strong { color: #6b7280; font-weight: 600; }

  @media (max-width: 900px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .chart-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <div>
      <h1><span class="accent">QASL</span> Framework · K6 Performance Report</h1>
      <div class="subtitle">HU_REG_01 · Concurrency demo · Token-acquisition flow · Generated ${generatedAt}</div>
    </div>
    <div class="meta">
      <div><strong>Status:</strong> <span class="badge ${allThresholdsOk ? 'badge-pass' : 'badge-fail'}">${allThresholdsOk ? 'ALL THRESHOLDS PASSED' : 'THRESHOLD(S) FAILED'}</span></div>
      <div style="margin-top:6px"><strong>Test type:</strong> Concurrency · 2 VUs (demo)</div>
      <div><strong>Endpoint base:</strong> automationexercise.com</div>
    </div>
  </div>

  <h2>Key Performance Indicators</h2>
  <div class="kpi-grid">
    <div class="kpi-card accent">
      <div class="label">Iterations completed</div>
      <div class="value">${fmt(iterations)}</div>
    </div>
    <div class="kpi-card accent">
      <div class="label">HTTP requests</div>
      <div class="value">${fmt(httpReqs)}<span class="unit">total</span></div>
    </div>
    <div class="kpi-card accent">
      <div class="label">Throughput</div>
      <div class="value">${fmt(reqRate, 2)}<span class="unit">req/s</span></div>
    </div>
    <div class="kpi-card ${failRate < 0.5 ? 'pass' : 'fail'}">
      <div class="label">HTTP failure rate</div>
      <div class="value">${pct(failRate)}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Response time · p50</div>
      <div class="value">${fmt(p50Ms, 0)}<span class="unit">ms</span></div>
    </div>
    <div class="kpi-card ${p95Ms < 3000 ? 'pass' : 'fail'}">
      <div class="label">Response time · p95</div>
      <div class="value">${fmt(p95Ms, 0)}<span class="unit">ms</span></div>
    </div>
    <div class="kpi-card">
      <div class="label">Response time · p99</div>
      <div class="value">${fmt(p99Ms, 0)}<span class="unit">ms</span></div>
    </div>
    <div class="kpi-card accent">
      <div class="label">Max VUs reached</div>
      <div class="value">${fmt(maxVus)}</div>
    </div>
  </div>

  <h2>Thresholds (SLOs)</h2>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Threshold expression</th>
          <th style="text-align:right">Status</th>
        </tr>
      </thead>
      <tbody>
        ${thresholds.map((t) => `
          <tr>
            <td><code>${t.metric}</code></td>
            <td><code>${t.expression}</code></td>
            <td style="text-align:right"><span class="badge ${t.ok ? 'badge-pass' : 'badge-fail'}">${t.ok ? 'PASS' : 'FAIL'}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <h2>Time-series</h2>
  <div class="chart-grid">
    <div class="chart-card">
      <div class="chart-title">Response time</div>
      <div class="chart-subtitle">Average and p95 across the test duration · ms</div>
      <canvas id="chartRespTime"></canvas>
    </div>
    <div class="chart-card">
      <div class="chart-title">Virtual users</div>
      <div class="chart-subtitle">Concurrency profile across the test</div>
      <canvas id="chartVUs"></canvas>
    </div>
    <div class="chart-card">
      <div class="chart-title">Request volume</div>
      <div class="chart-subtitle">Requests per bucket · proxy for throughput</div>
      <canvas id="chartReqRate"></canvas>
    </div>
    <div class="chart-card">
      <div class="chart-title">Business success rates</div>
      <div class="chart-subtitle">Per-step success rate of the registration flow</div>
      <canvas id="chartBusiness"></canvas>
    </div>
  </div>

  <h2>Business flow steps (HU_REG_01)</h2>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Step</th>
          <th>Endpoint</th>
          <th style="text-align:right">Success rate</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1 · SETUP</td><td><code>POST /api/createAccount</code></td><td style="text-align:right">${pct(setupRate)}</td></tr>
        <tr><td>2 · AUTH (token acquisition)</td><td><code>POST /api/verifyLogin</code></td><td style="text-align:right">${pct(authRate)}</td></tr>
        <tr><td>3 · AUTHENTICATED</td><td><code>POST /api/searchProduct</code> (con <code>X-Auth-Token</code>)</td><td style="text-align:right">${pct(authdRate)}</td></tr>
        <tr><td>4 · TEARDOWN</td><td><code>DELETE /api/deleteAccount</code></td><td style="text-align:right">${pct(teardownRate)}</td></tr>
      </tbody>
    </table>
  </div>

  <h2>Custom metrics</h2>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Description</th>
          <th class="num">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>token_acquisition_ms (p95)</code></td><td>Tiempo de adquisición del token simulado vía /api/verifyLogin</td><td class="num">${ms(tokenP95)}</td></tr>
        <tr><td><code>business_transactions_completed</code></td><td>Iteraciones que completaron setup + auth + búsqueda autenticada</td><td class="num">${fmt(businessTx)}</td></tr>
        <tr><td><code>data_sent</code></td><td>Bytes enviados</td><td class="num">${fmt(dataSent)} B</td></tr>
        <tr><td><code>data_received</code></td><td>Bytes recibidos</td><td class="num">${fmt(dataRecv)} B</td></tr>
      </tbody>
    </table>
  </div>

  <h2>Checks (${passedChecks}/${totalChecks} passed)</h2>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Check</th>
          <th class="num">Passed</th>
          <th class="num">Failed</th>
          <th style="text-align:right">Result</th>
        </tr>
      </thead>
      <tbody>
        ${checksFlat.map((c) => `
          <tr>
            <td>${c.name}</td>
            <td class="num">${c.passes}</td>
            <td class="num">${c.fails}</td>
            <td style="text-align:right"><span class="badge ${c.fails === 0 ? 'badge-pass' : 'badge-fail'}">${c.fails === 0 ? 'PASS' : 'FAIL'}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div class="stack">
      <strong>QASL Framework</strong> · F10.3 Performance · K6 v0.57 · Chart.js v4 · Generated ${generatedAt}
    </div>
  </div>

</div>

<script>
  const COLOR_ACCENT = '${ACCENT}';
  const COLOR_ACCENT_SOFT = '${ACCENT_SOFT}';
  const COLOR_GRAY = '#9ca3af';
  const COLOR_PASS = '${PASS}';
  const COLOR_FAIL = '${FAIL}';

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#374151', font: { size: 11 } } } },
    scales: {
      x: { grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280', font: { size: 10 } } },
      y: { grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280', font: { size: 10 } }, beginAtZero: true },
    },
  };

  new Chart(document.getElementById('chartRespTime'), {
    type: 'line',
    data: {
      labels: ${JSON.stringify(respTime.labels)},
      datasets: [
        { label: 'avg (ms)', data: ${JSON.stringify(respTime.values.map((v) => +v.toFixed(1)))}, borderColor: COLOR_ACCENT, backgroundColor: COLOR_ACCENT_SOFT, fill: true, tension: 0.3, borderWidth: 2, pointRadius: 0 },
        { label: 'p95 (ms)', data: ${JSON.stringify(respTimeP95.values.map((v) => +v.toFixed(1)))}, borderColor: COLOR_GRAY, borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false },
      ],
    },
    options: baseOpts,
  });

  new Chart(document.getElementById('chartVUs'), {
    type: 'line',
    data: {
      labels: ${JSON.stringify(vusBuckets.labels)},
      datasets: [{ label: 'VUs', data: ${JSON.stringify(vusBuckets.values.map((v) => +v.toFixed(0)))}, borderColor: COLOR_ACCENT, backgroundColor: COLOR_ACCENT_SOFT, fill: true, stepped: true, borderWidth: 2, pointRadius: 0 }],
    },
    options: baseOpts,
  });

  new Chart(document.getElementById('chartReqRate'), {
    type: 'bar',
    data: {
      labels: ${JSON.stringify(reqRateBuckets.labels)},
      datasets: [{ label: 'requests', data: ${JSON.stringify(reqRateBuckets.values.map((v) => +v.toFixed(0)))}, backgroundColor: COLOR_ACCENT_SOFT, borderColor: COLOR_ACCENT, borderWidth: 1 }],
    },
    options: baseOpts,
  });

  new Chart(document.getElementById('chartBusiness'), {
    type: 'bar',
    data: {
      labels: ['Setup', 'Auth (token)', 'Authd request', 'Teardown'],
      datasets: [{
        label: 'success rate (%)',
        data: [${(setupRate * 100).toFixed(1)}, ${(authRate * 100).toFixed(1)}, ${(authdRate * 100).toFixed(1)}, ${(teardownRate * 100).toFixed(1)}],
        backgroundColor: [COLOR_ACCENT_SOFT, COLOR_ACCENT_SOFT, COLOR_ACCENT_SOFT, COLOR_ACCENT_SOFT],
        borderColor: COLOR_ACCENT, borderWidth: 1.5,
      }],
    },
    options: { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, max: 100, ticks: { ...baseOpts.scales.y.ticks, callback: (v) => v + '%' } } } },
  });
</script>
</body>
</html>`;
}

(async function main() {
  if (!fs.existsSync(SUMMARY_JSON)) {
    console.error(`  ERROR: No existe ${SUMMARY_JSON}. Ejecutá primero: npm run k6`);
    process.exit(1);
  }
  const summary = JSON.parse(fs.readFileSync(SUMMARY_JSON, 'utf-8'));
  const series = await readResultsTimeSeries();
  const html = buildHtml(summary, series);
  fs.writeFileSync(HTML_REPORT, html, 'utf-8');
  console.log(`  ✓ HTML report: ${path.relative(ROOT, HTML_REPORT)}`);
})();
