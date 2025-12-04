#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RUN E2E - Ejecuta tests E2E con Playwright + Genera Reporte Allure
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Uso:
 *   node scripts/run-e2e.mjs [spec-file] [--capture-api]
 *
 * Ejemplos:
 *   node scripts/run-e2e.mjs                           # Ejecuta todos los specs
 *   node scripts/run-e2e.mjs TS-001                    # Ejecuta spec específico
 *   node scripts/run-e2e.mjs TS-001 --capture-api      # Ejecuta + captura APIs
 *
 * Reportes:
 *   - Allure HTML: reports/e2e/allure-report/
 *   - Screenshots: reports/e2e/screenshots/
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const REPORTS_DIR = 'reports/e2e';
const ALLURE_RESULTS = `${REPORTS_DIR}/allure-results`;
const ALLURE_REPORT = `${REPORTS_DIR}/allure-report`;

// Parse arguments
const args = process.argv.slice(2);
const specFile = args.find(arg => !arg.startsWith('--'));
const captureAPI = args.includes('--capture-api');

console.log(`
═══════════════════════════════════════════════════════════════════════════
  E2E TEST RUNNER - Playwright + Allure
═══════════════════════════════════════════════════════════════════════════
`);

// Crear directorios
[REPORTS_DIR, ALLURE_RESULTS, `${REPORTS_DIR}/screenshots`].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Construir comando Playwright (usa config de playwright.config.ts)
let playwrightCmd = 'npx playwright test';
if (specFile) {
    playwrightCmd += ` e2e/specs/${specFile}`;
    if (!specFile.endsWith('.spec.ts')) {
        playwrightCmd += '*.spec.ts';
    }
}

// Variables de entorno
const env = { ...process.env };
if (captureAPI) {
    env.RECORD_HAR = 'true';
    console.log('  API Capture: ENABLED');
}

console.log(`  Spec: ${specFile || 'ALL'}`);
console.log(`  Reports: ${REPORTS_DIR}/`);
console.log('');
console.log('  Ejecutando tests...');
console.log('───────────────────────────────────────────────────────────────────────────');

try {
    // Ejecutar Playwright
    execSync(playwrightCmd, {
        stdio: 'inherit',
        env,
        cwd: process.cwd()
    });

    console.log('');
    console.log('───────────────────────────────────────────────────────────────────────────');
    console.log('  Tests completados. Generando reporte Allure...');

    // Generar reporte Allure
    try {
        execSync(`npx allure generate ${ALLURE_RESULTS} -o ${ALLURE_REPORT} --clean`, {
            stdio: 'inherit'
        });

        console.log('');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log('  REPORTE GENERADO');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log(`  HTML: ${ALLURE_REPORT}/index.html`);
        console.log('');
        console.log('  Para abrir el reporte:');
        console.log(`    npx allure open ${ALLURE_REPORT}`);
        console.log('');
        console.log('  O con Docker (Allure Server):');
        console.log('    http://localhost:5050');
        console.log('═══════════════════════════════════════════════════════════════════════════');

    } catch (allureError) {
        console.log('  Allure CLI no disponible. Instalar con: npm install -g allure-commandline');
        console.log('  Los resultados están en:', ALLURE_RESULTS);
    }

} catch (error) {
    console.error('');
    console.error('  ERROR: Tests fallaron');
    process.exit(1);
}
