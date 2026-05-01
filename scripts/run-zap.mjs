#!/usr/bin/env node
/**
 * RUN ZAP · QASL Framework F10.4
 * ─────────────────────────────────────────────────────────────────────────
 * Ejecuta OWASP ZAP Baseline Scan vía Docker contra el SUT y genera los
 * reportes nativos de ZAP (HTML, JSON, Markdown) en reports/zap/.
 *
 * Uso:
 *   node scripts/run-zap.mjs                                  (default target)
 *   node scripts/run-zap.mjs --target=https://example.com     (override)
 *
 * Outputs:
 *   reports/zap/zap-report.html   Reporte nativo de ZAP (fondo claro, profesional)
 *   reports/zap/zap-report.json   Insumo para send-zap-metrics.mjs (Grafana)
 *   reports/zap/zap-report.md     Markdown summary (PRs / Slack / GitHub)
 *
 * Exit codes (zap-baseline.py):
 *   0 = sin warnings ni risks
 *   1 = warnings encontrados (esperado en demo)
 *   2 = error de configuración (lo tratamos como falla real)
 */

import { spawnSync, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports', 'zap');
const ZAP_IMAGE = 'zaproxy/zap-stable';
const DEFAULT_TARGET = 'https://automationexercise.com';

const REPORT_HTML = 'zap-report.html';
const REPORT_JSON = 'zap-report.json';
const REPORT_MD = 'zap-report.md';

function banner() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  SECURITY TEST RUNNER · F10.4 · OWASP ZAP Baseline Scan');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
}

function parseArg(name, fallback) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=')[1] : fallback;
}

function verifyDocker() {
  try {
    const out = execSync('docker version --format "{{.Server.Version}}"', {
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString().trim();
    console.log(`  Docker engine        : v${out}`);
  } catch {
    console.error('  ERROR: Docker no está corriendo o no está instalado.');
    console.error('  Verificá que Docker Desktop esté abierto y corriendo.');
    process.exit(2);
  }
}

function imageExists() {
  try {
    const out = execSync(`docker image ls ${ZAP_IMAGE} --format "{{.Repository}}"`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    return out.includes('zaproxy/zap-stable');
  } catch {
    return false;
  }
}

function dockerVolumePath(absPath) {
  return absPath.replace(/\\/g, '/');
}

function runZapBaseline(target) {
  const volumeHost = dockerVolumePath(REPORTS_DIR);
  const args = [
    'run', '--rm',
    '-v', `${volumeHost}:/zap/wrk/:rw`,
    '-t', ZAP_IMAGE,
    'zap-baseline.py',
    '-t', target,
    '-r', REPORT_HTML,
    '-J', REPORT_JSON,
    '-w', REPORT_MD,
    '-I',
  ];
  console.log('  ▶ docker ' + args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' '));
  console.log('───────────────────────────────────────────────────────────────────────────');
  const result = spawnSync('docker', args, { stdio: 'inherit', shell: true });
  return result.status ?? 2;
}

function summarizeFromJson() {
  const jsonPath = path.join(REPORTS_DIR, REPORT_JSON);
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  try {
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const counts = { High: 0, Medium: 0, Low: 0, Informational: 0 };
    if (Array.isArray(report.site)) {
      for (const site of report.site) {
        if (Array.isArray(site.alerts)) {
          for (const alert of site.alerts) {
            const map = { '3': 'High', '2': 'Medium', '1': 'Low', '0': 'Informational' };
            const key = map[String(alert.riskcode)] || alert.risk || alert.riskdesc?.split(' ')[0];
            if (key && counts[key] !== undefined) counts[key]++;
          }
        }
      }
    }
    const target = report.site?.[0]?.['@name'] || DEFAULT_TARGET;
    return { target, counts };
  } catch {
    return null;
  }
}

function sendInfluxSummary() {
  try {
    spawnSync('node', [path.join('scripts_metricas', 'send-zap-metrics.mjs')], {
      stdio: 'inherit',
      shell: true,
    });
  } catch {
    // Métricas opcionales
  }
}

(function main() {
  banner();
  const target = parseArg('target', DEFAULT_TARGET);

  console.log(`  Target               : ${target}`);
  console.log(`  ZAP image            : ${ZAP_IMAGE}`);
  console.log(`  Reports dir (host)   : ${path.relative(ROOT, REPORTS_DIR)}/`);
  console.log(`  Scan type            : Baseline (passive · non-intrusive · ~3-5 min)`);
  console.log('');

  verifyDocker();

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  if (!imageExists()) {
    console.log('');
    console.log('  ⚠ Imagen zaproxy/zap-stable no presente localmente.');
    console.log('  → Docker la descargará (~600 MB · solo la primera vez).');
    console.log('');
  }

  console.log('  Lanzando contenedor ZAP...');
  console.log('');

  const exitCode = runZapBaseline(target);

  console.log('');
  console.log('───────────────────────────────────────────────────────────────────────────');

  const htmlPath = path.join(REPORTS_DIR, REPORT_HTML);
  const jsonPath = path.join(REPORTS_DIR, REPORT_JSON);
  const mdPath = path.join(REPORTS_DIR, REPORT_MD);

  const allArtifactsExist = [htmlPath, jsonPath, mdPath].every((p) => fs.existsSync(p));
  if (!allArtifactsExist) {
    console.error('  ERROR: Faltan archivos de reporte. Revisá la salida del contenedor.');
    process.exit(2);
  }

  const summary = summarizeFromJson();
  if (summary) {
    const { target: t, counts } = summary;
    console.log('');
    console.log('  Resumen del scan:');
    console.log(`  ├── Target                : ${t}`);
    console.log(`  ├── 🔴 High               : ${counts.High}`);
    console.log(`  ├── 🟠 Medium             : ${counts.Medium}`);
    console.log(`  ├── 🟡 Low                : ${counts.Low}`);
    console.log(`  └── 🔵 Informational      : ${counts.Informational}`);
  }

  sendInfluxSummary();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  ARTEFACTOS GENERADOS · F10.4');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`  Reporte HTML (nativo) : ${path.relative(ROOT, htmlPath)}`);
  console.log(`  Reporte JSON          : ${path.relative(ROOT, jsonPath)}`);
  console.log(`  Reporte Markdown      : ${path.relative(ROOT, mdPath)}`);
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');

  if (exitCode === 2) {
    console.error('  ZAP exit code 2 → error de configuración. Revisar logs arriba.');
    process.exit(2);
  }

  const totalFindings = summary
    ? summary.counts.High + summary.counts.Medium + summary.counts.Low + summary.counts.Informational
    : 0;

  if (exitCode === 0 && totalFindings > 0) {
    console.log(`  ZAP exit code 0 (con flag -I) · ${totalFindings} hallazgos del SUT documentados (no fallan el build).`);
  } else if (exitCode === 0) {
    console.log('  ZAP exit code 0 · sin hallazgos.');
  } else if (exitCode === 1) {
    console.log(`  ZAP exit code 1 · ${totalFindings} hallazgos detectados (esperado en demo, no es falla del framework).`);
  }
  process.exit(0);
})();
