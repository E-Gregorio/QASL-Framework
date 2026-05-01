#!/usr/bin/env node
/**
 * RUN API · QASL Framework F10.2
 * ─────────────────────────────────────────────────────────────────────────
 * Convierte los .har capturados durante E2E en una Postman Collection v2.1
 * + Environment, los persiste como artefactos .json (importables en Postman)
 * y ejecuta Newman con reporter htmlextra.
 *
 * Flujo:
 *   .api-captures/*.har  →  Postman Collection v2.1 + Environment
 *                        →  Newman --reporters cli,htmlextra,json
 *                        →  reports/api/htmlextra-report.html
 *                        →  reports/api/newman-report.json
 *                        →  reports/api/postman/{collection,environment}.json
 *
 * Uso:
 *   node scripts/run-api.mjs            (procesa todos los .har)
 *   node scripts/run-api.mjs <pattern>  (filtra .har cuyo nombre matchee)
 */

import { spawnSync, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const ROOT = process.cwd();
const CAPTURES_DIR = path.join(ROOT, '.api-captures');
const REPORTS_DIR = path.join(ROOT, 'reports', 'api');
const POSTMAN_DIR = path.join(REPORTS_DIR, 'postman');

const STATIC_EXTENSIONS = [
  '.css', '.js', '.mjs', '.map', '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
  '.mp4', '.webm', '.mp3', '.wav', '.pdf',
];

const SKIP_PATH_PATTERNS = [
  /^\/static\//i,
  /^\/cdn-cgi\//i,
  /^\/get_product_picture\//i,
  /^\/favicon/i,
  /^\/img\//i,
  /^\/css\//i,
  /^\/js\//i,
  /^\/fonts?\//i,
  /^\/assets?\//i,
];

const SKIP_MIME_PREFIXES = [
  'image/', 'font/', 'audio/', 'video/',
  'text/css', 'text/javascript',
  'application/javascript', 'application/x-javascript',
  'application/font-', 'application/octet-stream',
];

const THIRD_PARTY_HOSTS = [
  'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
  'facebook.com', 'facebook.net', 'cloudflare.com', 'cloudflareinsights.com',
  'gstatic.com', 'googleapis.com', 'googlesyndication.com',
  'adservice.google', 'adtrafficquality.google', 'fundingchoicesmessages.google',
  'taboola.com', 'twitter.com', 'tiktok.com',
];

const NEWMAN_FLAGS = ['--insecure', '--ignore-redirects'];
const RESPONSE_TIME_THRESHOLD_MS = 5000;

function banner() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  API TEST RUNNER · F10.2 · HAR → Postman Collection → Newman → HTMLExtra');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function findHarFiles(pattern) {
  if (!fs.existsSync(CAPTURES_DIR)) {
    console.error(`  ERROR: No existe ${CAPTURES_DIR}/`);
    console.error('  Primero ejecuta: npm run e2e:capture');
    process.exit(1);
  }
  const all = fs.readdirSync(CAPTURES_DIR).filter((f) => f.endsWith('.har'));
  const filtered = pattern ? all.filter((f) => f.toLowerCase().includes(pattern.toLowerCase())) : all;
  if (filtered.length === 0) {
    console.error(`  ERROR: No se encontraron .har${pattern ? ` con patrón "${pattern}"` : ''} en ${CAPTURES_DIR}/`);
    process.exit(1);
  }
  return filtered.sort();
}

function isStaticAsset(url) {
  const lower = url.toLowerCase();
  if (STATIC_EXTENSIONS.some((ext) => lower.includes(ext + '?') || lower.endsWith(ext))) {
    return true;
  }
  return false;
}

function isThirdParty(hostname) {
  return THIRD_PARTY_HOSTS.some((h) => hostname.toLowerCase().includes(h));
}

function pickPrimaryHost(entries) {
  const counts = new Map();
  for (const entry of entries) {
    try {
      const host = new URL(entry.request.url).hostname;
      counts.set(host, (counts.get(host) || 0) + 1);
    } catch {
      continue;
    }
  }
  let best = '';
  let bestCount = -1;
  for (const [host, count] of counts) {
    if (!isThirdParty(host) && count > bestCount) {
      best = host;
      bestCount = count;
    }
  }
  return best;
}

function shouldKeepEntry(entry, primaryHost) {
  let urlObj;
  try {
    urlObj = new URL(entry.request.url);
  } catch {
    return false;
  }
  if (urlObj.hostname !== primaryHost) return false;
  if (isThirdParty(urlObj.hostname)) return false;
  if (isStaticAsset(urlObj.href)) return false;

  if (SKIP_PATH_PATTERNS.some((re) => re.test(urlObj.pathname))) return false;

  const status = entry.response?.status ?? 0;
  if (status <= 0) return false;

  const mime = (entry.response?.content?.mimeType ?? '').toLowerCase();
  if (mime === 'x-unknown') return false;
  if (SKIP_MIME_PREFIXES.some((p) => mime.startsWith(p))) return false;

  return true;
}

function entryDedupeKey(entry) {
  const req = entry.request;
  const body = req.postData?.text ?? '';
  return `${req.method} ${req.url} :: ${body}`;
}

function sanitizeName(filename) {
  return filename
    .replace(/^HU_REG_01_spec_ts_/i, '')
    .replace(/_chromium_HU_REG_01_Registro_de_Nuevo_Usuario_/i, ' · ')
    .replace(/HU_REG_01_Registro_de_Nuevo_Usuario_/i, '')
    .replace(/\.har$/i, '')
    .replace(/_/g, ' ')
    .trim();
}

function buildPostmanRequest(entry, idx) {
  const req = entry.request;
  const res = entry.response;
  const urlObj = new URL(req.url);

  const headers = (req.headers || [])
    .filter(({ name }) => {
      const n = name.toLowerCase();
      return !['host', 'connection', 'content-length', ':authority', ':method', ':path', ':scheme'].includes(n)
        && !n.startsWith(':');
    })
    .map(({ name, value }) => ({ key: name, value, type: 'text' }));

  let body;
  if (req.postData && req.postData.text) {
    const isJson = (req.postData.mimeType || '').includes('json');
    body = {
      mode: 'raw',
      raw: req.postData.text,
      options: { raw: { language: isJson ? 'json' : 'text' } },
    };
  } else if (req.postData && req.postData.params) {
    body = {
      mode: 'urlencoded',
      urlencoded: req.postData.params.map(({ name, value }) => ({ key: name, value: value || '', type: 'text' })),
    };
  }

  const expectedStatus = res?.status ?? 200;
  const pathname = urlObj.pathname || '/';
  const itemName = `${String(idx + 1).padStart(2, '0')}. ${req.method} ${pathname}`;

  const testExec = [
    `pm.test("Response time below ${RESPONSE_TIME_THRESHOLD_MS}ms", function () {`,
    `    pm.expect(pm.response.responseTime).to.be.below(${RESPONSE_TIME_THRESHOLD_MS});`,
    `});`,
    `pm.test("Status code is ${expectedStatus} (as captured during E2E)", function () {`,
    `    pm.expect(pm.response.code).to.eql(${expectedStatus});`,
    `});`,
  ];

  return {
    name: itemName,
    request: {
      method: req.method,
      header: headers,
      url: {
        raw: `{{baseUrl}}${pathname}${urlObj.search}`,
        host: ['{{baseUrl}}'],
        path: pathname.split('/').filter(Boolean),
        query: Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({ key, value })),
      },
      ...(body ? { body } : {}),
      description: `Generated from HAR entry · captured status ${expectedStatus}`,
    },
    event: [
      {
        listen: 'test',
        script: { type: 'text/javascript', exec: testExec },
      },
    ],
  };
}

function buildFolderForHar(harPath) {
  const filename = path.basename(harPath);
  const harJson = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
  const entries = harJson?.log?.entries ?? [];
  if (entries.length === 0) {
    return null;
  }
  const primaryHost = pickPrimaryHost(entries);
  const kept = entries.filter((e) => shouldKeepEntry(e, primaryHost));
  if (kept.length === 0) {
    return null;
  }
  const seen = new Set();
  const deduped = [];
  for (const e of kept) {
    const key = entryDedupeKey(e);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
  }
  const items = deduped.map((e, idx) => buildPostmanRequest(e, idx));
  return {
    name: sanitizeName(filename),
    description: `${deduped.length} unique request(s) of ${kept.length} kept (${entries.length} total in HAR) · ${filename}`,
    item: items,
    primaryHost,
    counts: { total: entries.length, kept: kept.length, deduped: deduped.length },
  };
}

function buildCollection(folders) {
  return {
    info: {
      _postman_id: `qasl-${Date.now()}`,
      name: 'QASL Framework · API Suite from E2E HAR',
      description: 'Auto-generated from Playwright HAR captures during the F10.1 E2E run.\nCovers HU_REG_01 (Registro de Nuevo Usuario) end-to-end traffic.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: folders.map(({ name, description, item }) => ({ name, description, item })),
  };
}

function buildEnvironment(primaryHost) {
  return {
    id: `qasl-env-${Date.now()}`,
    name: 'QASL Framework · API Environment',
    values: [
      { key: 'baseUrl', value: `https://${primaryHost}`, type: 'default', enabled: true },
      { key: 'primaryHost', value: primaryHost, type: 'default', enabled: true },
    ],
    _postman_variable_scope: 'environment',
  };
}

function quote(s) {
  return `"${String(s).replace(/"/g, '\\"')}"`;
}

function runNewman(collectionPath, environmentPath, htmlReport, jsonReport) {
  const parts = [
    'npx newman run', quote(collectionPath),
    '-e', quote(environmentPath),
    ...NEWMAN_FLAGS,
    '--reporters cli,htmlextra,json',
    '--reporter-htmlextra-export', quote(htmlReport),
    '--reporter-htmlextra-title', quote('QASL Framework · API Suite Report'),
    '--reporter-htmlextra-browserTitle', quote('QASL · Newman HTMLExtra'),
    '--reporter-htmlextra-darkTheme',
    '--reporter-json-export', quote(jsonReport),
  ];
  const cmd = parts.join(' ');
  console.log('  ▶', cmd);
  console.log('───────────────────────────────────────────────────────────────────────────');
  try {
    execSync(cmd, { stdio: 'inherit' });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

(function main() {
  banner();
  const pattern = process.argv[2];
  const harFiles = findHarFiles(pattern);

  console.log(`  HAR files encontrados: ${harFiles.length}${pattern ? ` (filtro: "${pattern}")` : ''}`);
  console.log('');

  ensureDir(REPORTS_DIR);
  ensureDir(POSTMAN_DIR);

  const folders = [];
  let primaryHost = '';
  for (const filename of harFiles) {
    const harPath = path.join(CAPTURES_DIR, filename);
    const folder = buildFolderForHar(harPath);
    if (!folder) {
      console.log(`  · ${sanitizeName(filename).padEnd(70)} → 0 useful (skipped)`);
      continue;
    }
    if (!primaryHost) primaryHost = folder.primaryHost;
    folders.push(folder);
    const { total, kept, deduped } = folder.counts;
    console.log(`  · ${sanitizeName(filename).padEnd(70)} → ${String(deduped).padStart(2)} unique  (kept ${kept}/${total} after filter)`);
  }

  if (folders.length === 0) {
    console.error('');
    console.error('  ERROR: Ningún HAR produjo requests útiles tras el filtrado.');
    process.exit(1);
  }

  const totalRequests = folders.reduce((acc, f) => acc + f.item.length, 0);
  console.log('');
  console.log(`  Total folders : ${folders.length}`);
  console.log(`  Total requests: ${totalRequests}`);
  console.log(`  Primary host  : ${primaryHost}`);
  console.log('');

  const collection = buildCollection(folders);
  const environment = buildEnvironment(primaryHost);

  const collectionPath = path.join(POSTMAN_DIR, 'collection.json');
  const environmentPath = path.join(POSTMAN_DIR, 'environment.json');
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf-8');
  fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2), 'utf-8');
  console.log('  Postman Collection :', path.relative(ROOT, collectionPath));
  console.log('  Postman Environment:', path.relative(ROOT, environmentPath));
  console.log('');

  const htmlReport = path.join(REPORTS_DIR, 'htmlextra-report.html');
  const jsonReport = path.join(REPORTS_DIR, 'newman-report.json');
  const exitCode = runNewman(collectionPath, environmentPath, htmlReport, jsonReport);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  ARTEFACTOS GENERADOS');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`  Collection (Postman v2.1) : ${path.relative(ROOT, collectionPath)}`);
  console.log(`  Environment (Postman)     : ${path.relative(ROOT, environmentPath)}`);
  console.log(`  Newman JSON report        : ${path.relative(ROOT, jsonReport)}`);
  console.log(`  Newman HTMLExtra report   : ${path.relative(ROOT, htmlReport)}`);
  console.log('═══════════════════════════════════════════════════════════════════════════');

  try {
    spawnSync('node', [path.join('scripts_metricas', 'send-api-metrics.mjs')], { stdio: 'inherit', shell: true });
  } catch {
    // Métricas opcionales — no falla el script si InfluxDB no está disponible
  }

  process.exit(exitCode);
})();
