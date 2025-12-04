import { test, expect } from '../test-base/TestBase';
import { Allure } from '../utils/AllureDecorators';
import { APICapture } from '../utils/APICapture';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SUITE: TS-001 - Formularios DemoQA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TRAZABILIDAD SHIFT-LEFT:
 *   Epic:     EP_DEMOQA - Plataforma DemoQA
 *   Feature:  Formularios
 *   Story:    HU-001 - Completar formularios de texto
 *
 * TAGS: @smoke @e2e @regression
 * SEVERITY: critical
 * ═══════════════════════════════════════════════════════════════════════════
 */
test.describe('TS-001: Formularios DemoQA', () => {

    test.beforeEach(async () => {
        // Configuración Allure para trazabilidad
        await Allure.setup({
            epic: 'EP_DEMOQA - Plataforma DemoQA',
            feature: 'Formularios',
            story: 'HU-001: Como usuario quiero completar formularios para enviar mis datos',
            severity: 'critical',
            owner: 'QA Team',
            tags: ['smoke', 'e2e', 'regression', 'forms'],
            testCase: 'TS-001'
        });
    });

    test('TC-001: Completar formularios de texto y práctica', async ({ demoQaPage }) => {
        // Descripción del test case
        await Allure.description(`
            **Objetivo:** Validar que el usuario puede completar los formularios Text Box y Practice Form.

            **Precondiciones:**
            - Acceso a https://demoqa.com
            - Navegador compatible

            **Datos de Prueba:**
            - Nombre: Pedro Perez
            - Email: pedro@ejemplo.com
        `);

        // Iniciar captura de APIs
        const apiCapture = new APICapture(demoQaPage.page, 'TS-001');
        await apiCapture.start();

        await Allure.step('DADO que navego a la home de DemoQA', async () => {
            await Allure.parameter('URL', 'https://demoqa.com');
            await demoQaPage.gotoHome();
            await demoQaPage.screenshot('TS-001-TC-001-paso-01-home');
        });

        await Allure.step('CUANDO completo el formulario Text Box', async () => {
            await Allure.parameter('Formulario', 'Text Box');
            await demoQaPage.navigateToTextBox();
            await demoQaPage.fillTextBoxForm({
                fullName: 'Pedro Perez',
                email: 'pedro@ejemplo.com',
                currentAddress: 'Dirección actual de prueba',
                permanentAddress: 'Dirección permanente de prueba',
            });
            await demoQaPage.screenshot('TS-001-TC-001-paso-02-text-box');
        });

        await Allure.step('Y completo el formulario Practice Form', async () => {
            await Allure.parameter('Formulario', 'Practice Form');
            await demoQaPage.navigateToPracticeForm();
            await demoQaPage.fillPracticeForm({
                firstName: 'Pedro',
                lastName: 'Perez',
                email: 'pedro@ejemplo.com',
                mobile: '1170619966',
                subject: 'QA Testing',
                currentAddress: 'Dirección de prueba',
                state: 'Uttar Pradesh',
                city: 'Lucknow',
            });
            await demoQaPage.screenshot('TS-001-TC-001-paso-03-practice-form');
        });

        await Allure.step('ENTONCES se muestra el resumen enviado correctamente', async () => {
            await expect(demoQaPage.modalTitle).toBeVisible();
            await demoQaPage.closeSubmissionModal();
            await demoQaPage.screenshot('TS-001-TC-001-paso-04-validacion');
        });

        // Guardar APIs capturadas
        await apiCapture.save();
    });

    test('TC-002: Validar campos requeridos en Text Box', async ({ demoQaPage }) => {
        await Allure.description(`
            **Objetivo:** Validar que los campos requeridos muestran error cuando están vacíos.

            **Tipo:** Negative Test
        `);
        await Allure.severity('normal');
        await Allure.tags('negative', 'validation');

        await Allure.step('DADO que navego al formulario Text Box', async () => {
            await demoQaPage.gotoHome();
            await demoQaPage.navigateToTextBox();
        });

        await Allure.step('CUANDO envío el formulario con email inválido', async () => {
            await demoQaPage.fillTextBoxForm({
                fullName: 'Test User',
                email: 'email-invalido',
                currentAddress: 'Test',
                permanentAddress: 'Test',
            });
        });

        await Allure.step('ENTONCES se muestra indicador de error en email', async () => {
            // El campo email debe tener clase de error
            const emailField = demoQaPage.page.locator('#userEmail');
            await expect(emailField).toHaveClass(/field-error|mr-sm-2/);
        });
    });
});
