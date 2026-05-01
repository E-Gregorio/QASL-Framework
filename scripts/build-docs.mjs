#!/usr/bin/env node
/**
 * BUILD DOCS · QASL Framework F10.6
 * ─────────────────────────────────────────────────────────────────────────
 * Genera la carpeta docs/ con la landing pública para GitHub Pages.
 *
 * Pipeline:
 *   1. Limpia docs/reports y docs/img
 *   2. Copia reports/e2e/allure-report/    → docs/reports/e2e/
 *   3. Copia reports/api/htmlextra-report.html → docs/reports/api/index.html
 *   4. Copia reports/k6/k6-report.html      → docs/reports/k6/index.html
 *   5. Copia reports/zap/zap-report.html    → docs/reports/zap/index.html
 *   6. Copia img/                            → docs/img/
 *   7. Lee KPIs desde reports/*.json
 *   8. Renderiza docs/index.html con KPIs reales + cards de reportes
 *
 * Uso:
 *   node scripts/build-docs.mjs
 *   npm run docs:build
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const DOCS_REPORTS = path.join(DOCS, 'reports');
const DOCS_IMG = path.join(DOCS, 'img');

const SRC_E2E = path.join(ROOT, 'reports', 'e2e', 'allure-report');
const SRC_API = path.join(ROOT, 'reports', 'api', 'htmlextra-report.html');
const SRC_K6 = path.join(ROOT, 'reports', 'k6', 'k6-report.html');
const SRC_ZAP = path.join(ROOT, 'reports', 'zap', 'zap-report.html');

const E2E_RESULTS = path.join(ROOT, 'reports', 'e2e', 'results.json');
const API_RESULTS = path.join(ROOT, 'reports', 'api', 'newman-report.json');
const K6_SUMMARY = path.join(ROOT, 'reports', 'k6', 'k6-summary.json');
const ZAP_REPORT = path.join(ROOT, 'reports', 'zap', 'zap-report.json');

const SRC_IMG = path.join(ROOT, 'img');

function banner() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  BUILD DOCS · F10.6 · QASL Framework → GitHub Pages');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
}

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ skip · no existe ${path.relative(ROOT, src)}`);
    return false;
  }
  fs.cpSync(src, dest, { recursive: true });
  return true;
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ skip · no existe ${path.relative(ROOT, src)}`);
    return false;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function buildKpis() {
  const kpis = {
    e2e: { passed: 0, failed: 0, total: 0, passRate: '0%' },
    api: { passed: 0, failed: 0, total: 0, passRate: '0%' },
    k6: { iterations: 0, p95: 0, vus: 0, thresholds: '0/0' },
    zap: { high: 0, medium: 0, low: 0, info: 0, total: 0 },
    bugs: 1,
    layers: 4,
  };

  const e2e = readJson(E2E_RESULTS);
  if (e2e?.stats) {
    kpis.e2e.passed = e2e.stats.expected ?? 0;
    kpis.e2e.failed = e2e.stats.unexpected ?? 0;
    kpis.e2e.total = kpis.e2e.passed + kpis.e2e.failed + (e2e.stats.skipped ?? 0);
    kpis.e2e.passRate = kpis.e2e.total > 0
      ? ((kpis.e2e.passed / kpis.e2e.total) * 100).toFixed(1) + '%'
      : '0%';
  }

  const api = readJson(API_RESULTS);
  if (api?.run?.stats?.assertions) {
    const a = api.run.stats.assertions;
    kpis.api.failed = a.failed ?? 0;
    kpis.api.total = a.total ?? 0;
    kpis.api.passed = kpis.api.total - kpis.api.failed;
    kpis.api.passRate = kpis.api.total > 0
      ? ((kpis.api.passed / kpis.api.total) * 100).toFixed(1) + '%'
      : '0%';
  }

  const k6 = readJson(K6_SUMMARY);
  if (k6?.metrics) {
    const m = k6.metrics;
    kpis.k6.iterations = m.iterations?.values?.count ?? 0;
    kpis.k6.p95 = Math.round(m.http_req_duration?.values?.['p(95)'] ?? 0);
    kpis.k6.vus = m.vus_max?.values?.max ?? 0;
    let tp = 0, tf = 0;
    for (const v of Object.values(m)) {
      if (v.thresholds) for (const t of Object.values(v.thresholds)) (t.ok ? tp++ : tf++);
    }
    kpis.k6.thresholds = `${tp}/${tp + tf}`;
  }

  const zap = readJson(ZAP_REPORT);
  if (zap?.site) {
    const map = { '3': 'high', '2': 'medium', '1': 'low', '0': 'info' };
    for (const s of zap.site) {
      for (const a of (s.alerts || [])) {
        const k = map[String(a.riskcode)];
        if (k && kpis.zap[k] !== undefined) kpis.zap[k]++;
      }
    }
    kpis.zap.total = kpis.zap.high + kpis.zap.medium + kpis.zap.low + kpis.zap.info;
  }

  return kpis;
}

function renderIndex(kpis) {
  const generated = new Date().toLocaleString('es-AR', { hour12: false });
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QASL Framework · Quality Assurance Shift-Left · Public Showcase</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="hero">
  <div class="container">
    <div class="hero-tag">QASL FRAMEWORK</div>
    <h1>Quality Assurance Shift-Left</h1>
    <p class="hero-sub">A 10-phase methodology where the DoD of one actor becomes the DoR of the next, ending with 4 layers of automated defect detection — Functional, API contract, Performance and Security.</p>
    <div class="hero-meta">
      <span><strong>Last build:</strong> ${generated}</span>
      <span><strong>SUT:</strong> automationexercise.com</span>
      <span><strong>HU:</strong> HU_REG_01 · Registro de Nuevo Usuario</span>
    </div>
  </div>
</header>

<section class="kpis">
  <div class="container">
    <h2>Headline KPIs</h2>
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue">
        <div class="kpi-label">Layers verified</div>
        <div class="kpi-value">${kpis.layers}</div>
        <div class="kpi-foot">Functional · API · Performance · Security</div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-label">Defects detected</div>
        <div class="kpi-value">${kpis.bugs + kpis.zap.total}</div>
        <div class="kpi-foot">${kpis.bugs} BUG · ${kpis.zap.total} ZAP findings</div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-label">E2E Pass Rate</div>
        <div class="kpi-value">${kpis.e2e.passRate}</div>
        <div class="kpi-foot">${kpis.e2e.passed} passed · ${kpis.e2e.failed} failed</div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-label">API Assertions</div>
        <div class="kpi-value">${kpis.api.passRate}</div>
        <div class="kpi-foot">${kpis.api.passed}/${kpis.api.total} passed</div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-label">K6 Performance</div>
        <div class="kpi-value">${kpis.k6.p95}<span class="kpi-unit">ms</span></div>
        <div class="kpi-foot">p95 · ${kpis.k6.iterations} iterations · ${kpis.k6.vus} VUs · thresholds ${kpis.k6.thresholds}</div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-label">Security Alerts</div>
        <div class="kpi-value">${kpis.zap.total}</div>
        <div class="kpi-foot">${kpis.zap.high} High · ${kpis.zap.medium} Medium · ${kpis.zap.low} Low · ${kpis.zap.info} Info</div>
      </div>
    </div>
  </div>
</section>

<section class="reports">
  <div class="container">
    <h2>Test Reports</h2>
    <p class="section-sub">Each report is the canonical artifact emitted by its tool, untouched. Click to open.</p>
    <div class="report-grid">
      <a class="report-card" href="reports/e2e/index.html">
        <div class="report-tag">F10.1</div>
        <h3>Functional · Allure</h3>
        <p>Playwright + TypeScript suite · 20 TCs traced 1:1 to CSV · Allure native report.</p>
        <div class="report-stats"><strong>${kpis.e2e.passed}/${kpis.e2e.total}</strong> tests passed</div>
      </a>
      <a class="report-card" href="reports/api/index.html">
        <div class="report-tag">F10.2</div>
        <h3>API Contract · Newman + HTMLExtra</h3>
        <p>HAR → Postman Collection v2.1 → Newman with strict assertions · honest pass/fail reporting.</p>
        <div class="report-stats"><strong>${kpis.api.passed}/${kpis.api.total}</strong> assertions passed</div>
      </a>
      <a class="report-card" href="reports/k6/index.html">
        <div class="report-tag">F10.3</div>
        <h3>Performance · K6</h3>
        <p>Standalone K6 script · dynamic token flow · 2 VUs concurrency · custom HTML report.</p>
        <div class="report-stats"><strong>${kpis.k6.thresholds}</strong> thresholds passed · p95 ${kpis.k6.p95} ms</div>
      </a>
      <a class="report-card" href="reports/zap/index.html">
        <div class="report-tag">F10.4</div>
        <h3>Security · OWASP ZAP</h3>
        <p>Baseline scan · passive · non-intrusive · native ZAP report with 26 documented findings.</p>
        <div class="report-stats"><strong>${kpis.zap.high}</strong> High · ${kpis.zap.medium} Medium · ${kpis.zap.low} Low · ${kpis.zap.info} Info</div>
      </a>
    </div>
  </div>
</section>

<section class="evidence">
  <div class="container">
    <h2>Grafana · QASL Quality Cockpit</h2>
    <p class="section-sub">All four layers of metrics consolidated in a single dashboard. Live at <code>http://localhost:3001</code> when running locally · static evidence below.</p>
    <div class="screenshot-grid">
      <figure>
        <img src="img/grafana1.png" alt="QASL Quality Cockpit · upper section · E2E + API + ZAP">
        <figcaption>Upper section · E2E (85%) · API (83.8%) · Security alerts</figcaption>
      </figure>
      <figure>
        <img src="img/grafana2.png" alt="QASL Quality Cockpit · K6 performance section">
        <figcaption>Performance section · K6 100% success · 302 ms p95 · 2 VUs · 80 requests · 0 failed thresholds</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="defect">
  <div class="container">
    <h2>Defect detected · BUG-001</h2>
    <p class="section-sub">Real defect found by the framework on the SUT, documented per ISTQB / IEEE 1044 / OWASP / CVSS standards.</p>
    <div class="defect-card">
      <div class="defect-row"><span class="defect-label">ID</span><span class="defect-value">BUG-001</span></div>
      <div class="defect-row"><span class="defect-label">Title</span><span class="defect-value">El sistema acepta contraseñas con menos de 6 caracteres y crea la cuenta</span></div>
      <div class="defect-row"><span class="defect-label">Severity</span><span class="defect-value">S2-Critical</span></div>
      <div class="defect-row"><span class="defect-label">CWE</span><span class="defect-value">CWE-521 · Weak Password Requirements</span></div>
      <div class="defect-row"><span class="defect-label">OWASP</span><span class="defect-value">A07:2021 · Identification and Authentication Failures</span></div>
      <div class="defect-row"><span class="defect-label">CVSS v3.1</span><span class="defect-value">5.3 (Medium) · CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N</span></div>
      <div class="defect-row"><span class="defect-label">Detected by</span><span class="defect-value">TC-008, TC-009, TC-015 (Playwright E2E suite)</span></div>
      <div class="defect-row"><span class="defect-label">Traceability</span><span class="defect-value">HU_REG_01 · BR2 · Acceptance criterion E4</span></div>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <p><strong>QASL Framework</strong> · Quality Assurance Shift-Left · v1.2</p>
    <p class="footer-meta">Aligned to ISTQB CTFL v4.0 · ISO/IEC/IEEE 29119-3:2021 · IEEE 1044-2009 · ISO/IEC 25010:2011 · OWASP Top 10:2021 · ISO 31000:2018</p>
    <p class="footer-meta">Generated automatically from JSON artifacts · Last build ${generated}</p>
  </div>
</footer>
</body>
</html>`;
}

(function main() {
  banner();

  console.log('  Limpiando docs/reports y docs/img...');
  rmDir(DOCS_REPORTS);
  rmDir(DOCS_IMG);
  ensureDir(DOCS);
  ensureDir(DOCS_REPORTS);
  ensureDir(DOCS_IMG);

  console.log('');
  console.log('  Copiando reportes...');
  let ok = 0, skip = 0;
  if (copyDir(SRC_E2E, path.join(DOCS_REPORTS, 'e2e'))) { console.log('  ✓ E2E (Allure) → docs/reports/e2e/'); ok++; } else skip++;
  if (copyFile(SRC_API, path.join(DOCS_REPORTS, 'api', 'index.html'))) { console.log('  ✓ API (Newman HTMLExtra) → docs/reports/api/index.html'); ok++; } else skip++;
  if (copyFile(SRC_K6, path.join(DOCS_REPORTS, 'k6', 'index.html'))) { console.log('  ✓ K6 (Custom HTML) → docs/reports/k6/index.html'); ok++; } else skip++;
  if (copyFile(SRC_ZAP, path.join(DOCS_REPORTS, 'zap', 'index.html'))) { console.log('  ✓ ZAP (Native HTML) → docs/reports/zap/index.html'); ok++; } else skip++;

  console.log('');
  console.log('  Copiando imágenes...');
  if (copyDir(SRC_IMG, DOCS_IMG)) console.log('  ✓ img/ → docs/img/');

  console.log('');
  console.log('  Calculando KPIs desde JSONs...');
  const kpis = buildKpis();
  console.log(`  E2E   : ${kpis.e2e.passed}/${kpis.e2e.total} passed (${kpis.e2e.passRate})`);
  console.log(`  API   : ${kpis.api.passed}/${kpis.api.total} assertions (${kpis.api.passRate})`);
  console.log(`  K6    : ${kpis.k6.iterations} iters · p95 ${kpis.k6.p95}ms · ${kpis.k6.vus} VUs · thresholds ${kpis.k6.thresholds}`);
  console.log(`  ZAP   : ${kpis.zap.high}H/${kpis.zap.medium}M/${kpis.zap.low}L/${kpis.zap.info}I = ${kpis.zap.total} alerts`);

  console.log('');
  console.log('  Renderizando docs/index.html...');
  fs.writeFileSync(path.join(DOCS, 'index.html'), renderIndex(kpis), 'utf-8');
  console.log('  ✓ docs/index.html');

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  DOCS LISTO · GitHub Pages-ready');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`  Reportes copiados : ${ok} ok · ${skip} saltados`);
  console.log(`  Landing           : docs/index.html`);
  console.log(`  Para abrir local  : start docs/index.html`);
  console.log('');
})();
