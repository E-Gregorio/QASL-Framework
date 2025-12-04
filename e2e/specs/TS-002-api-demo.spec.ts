import { test, expect } from '@playwright/test';
import { Allure } from '../utils/AllureDecorators';
import { APICapture } from '../utils/APICapture';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SUITE: TS-002 - BookStore API Capture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TRAZABILIDAD SHIFT-LEFT:
 *   Epic:     EP_DEMOQA - Plataforma DemoQA
 *   Feature:  BookStore API
 *   Story:    HU-002 - Consultar catálogo de libros
 *
 * TAGS: @smoke @api @integration
 * SEVERITY: critical
 * ═══════════════════════════════════════════════════════════════════════════
 */
test.describe('TS-002: BookStore API', () => {

    test.beforeEach(async () => {
        await Allure.setup({
            epic: 'EP_DEMOQA - Plataforma DemoQA',
            feature: 'BookStore API',
            story: 'HU-002: Como usuario quiero ver el catálogo de libros disponibles',
            severity: 'critical',
            owner: 'QA Team',
            tags: ['smoke', 'api', 'integration', 'bookstore'],
            testCase: 'TS-002'
        });
    });

    test('TC-001: Capturar APIs del catálogo de libros', async ({ page }) => {
        await Allure.description(`
            **Objetivo:** Capturar las llamadas API durante la navegación en BookStore.

            **APIs Esperadas:**
            - GET /BookStore/v1/Books

            **Uso Posterior:**
            - Las APIs capturadas se usan para Newman, K6 y ZAP
        `);

        // Iniciar captura de APIs
        const apiCapture = new APICapture(page, 'TS-002-BookStore');
        await apiCapture.start();

        await Allure.step('DADO que navego al BookStore de DemoQA', async () => {
            await Allure.parameter('URL', 'https://demoqa.com/books');
            await page.goto('https://demoqa.com/books', { waitUntil: 'domcontentloaded' });
        });

        await Allure.step('CUANDO la página carga el catálogo', async () => {
            await page.waitForSelector('.rt-tbody', { timeout: 10000 });
            await page.waitForTimeout(2000);
        });

        await Allure.step('ENTONCES veo la lista de libros disponibles', async () => {
            const books = page.locator('.rt-tr-group');
            await expect(books.first()).toBeVisible();
            await Allure.parameter('APIs Capturadas', String(apiCapture.getCount()));
        });

        // Guardar APIs capturadas
        await apiCapture.save();
        console.log(`APIs capturadas: ${apiCapture.getCount()}`);
    });
});
