import { test, expect } from '../test-base/TestBase';
import { allure } from 'allure-playwright';
import { DataGenerator } from '../utils/DataGenerator';
import { SignupPage } from '../pages/SignupPage';

const HU_ID = 'HU_REG_01';
const TS01 = 'HU_REG_01_TS01 · Flujo Principal y Validaciones Positivas';
const TS02 = 'HU_REG_01_TS02 · Validaciones Negativas y Manejo de Errores';
const TS03 = 'HU_REG_01_TS03 · Seguridad e Integración';
const SUT_BASE_URL = process.env.BASE_URL ?? 'https://automationexercise.com';

const seedDuplicate = {
  email: '',
  name: '',
  password: '',
};

async function tagTrace(
  ts: string,
  tcId: string,
  prc: string,
  cobertura: { escenario?: string; br?: string },
  tecnica: string,
  severity: 'critical' | 'normal' | 'high' | 'minor' | 'blocker' = 'critical',
): Promise<void> {
  await allure.story(ts);
  await allure.severity(severity);
  await allure.parameter('TC_ID', tcId);
  await allure.parameter('TS_ID', ts.split(' · ')[0]);
  await allure.parameter('PRC_Asociadas', prc);
  if (cobertura.escenario) await allure.parameter('Cobertura_Escenario', cobertura.escenario);
  if (cobertura.br) await allure.parameter('Cobertura_BR', cobertura.br);
  await allure.parameter('Tecnica_Aplicada', tecnica);
}

test.describe(`${HU_ID} · Registro de Nuevo Usuario`, () => {
  test.beforeAll(async ({ browser }) => {
    seedDuplicate.email = DataGenerator.uniqueEmail('seed_duplicate');
    seedDuplicate.name = DataGenerator.randomName('SeedUser');
    seedDuplicate.password = DataGenerator.validPassword();

    const context = await browser.newContext();
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.goToHome(SUT_BASE_URL);
    await signupPage.registerCompleteUser(
      seedDuplicate.name,
      seedDuplicate.email,
      DataGenerator.accountInfo(seedDuplicate.password),
    );
    await context.close();
  });

  test.beforeEach(async () => {
    await allure.epic('QASL Framework · Shift-Left Testing');
    await allure.feature(`${HU_ID} · Registro de Nuevo Usuario`);
    await allure.owner('QA · Static Analyzer (Claude AI)');
  });

  test('Validar acceso al formulario de registro desde la página principal', async ({
    signupPage,
    baseUrl,
  }) => {
    await tagTrace(TS01, 'TC-001', 'PRC-001, PRC-004, PRC-005', { escenario: 'E1' }, 'Partición de Equivalencia');

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.assertNewUserSignupFormVisible();
  });

  test('Validar registro exitoso con datos válidos', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS01,
      'TC-002',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006',
      { escenario: 'E2', br: 'BR1, BR2, BR3' },
      'Partición de Equivalencia',
    );

    const email = DataGenerator.uniqueEmail('tc002');
    const name = DataGenerator.randomName();
    const password = DataGenerator.validPassword();

    await signupPage.goToHome(baseUrl);
    await signupPage.registerCompleteUser(name, email, DataGenerator.accountInfo(password));
  });

  test('Validar registro exitoso con password de 6 caracteres exactos', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS01,
      'TC-003',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006',
      { br: 'BR2' },
      'Valores Límite',
    );

    const email = DataGenerator.uniqueEmail('tc003');
    const name = DataGenerator.randomName();
    const password = DataGenerator.passwordOfLength(6);

    await allure.parameter('Password_Length', String(password.length));

    await signupPage.goToHome(baseUrl);
    await signupPage.registerCompleteUser(name, email, DataGenerator.accountInfo(password));
  });

  test('Validar registro exitoso con password de más de 6 caracteres', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS01,
      'TC-004',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006',
      { br: 'BR2' },
      'Valores Límite',
      'normal',
    );

    const email = DataGenerator.uniqueEmail('tc004');
    const name = DataGenerator.randomName();
    const password = DataGenerator.longPassword(20);

    await allure.parameter('Password_Length', String(password.length));

    await signupPage.goToHome(baseUrl);
    await signupPage.registerCompleteUser(name, email, DataGenerator.accountInfo(password));
  });

  test('Validar mensaje de confirmación tras registro exitoso', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS01,
      'TC-005',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006',
      { escenario: 'E6', br: 'BR4' },
      'Tabla de Decisión',
    );

    const email = DataGenerator.uniqueEmail('tc005');
    const name = DataGenerator.randomName();
    const password = DataGenerator.validPassword();

    await signupPage.goToHome(baseUrl);
    await signupPage.registerCompleteUser(name, email, DataGenerator.accountInfo(password));
    await signupPage.assertConfirmationMessageVisible();
  });

  test('Validar visibilidad completa del mensaje de confirmación', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS01,
      'TC-006',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006',
      { escenario: 'E6', br: 'BR4' },
      'Partición de Equivalencia',
      'normal',
    );

    const email = DataGenerator.uniqueEmail('tc006');
    const name = DataGenerator.randomName();
    const password = DataGenerator.validPassword();

    await signupPage.goToHome(baseUrl);
    await signupPage.registerCompleteUser(name, email, DataGenerator.accountInfo(password));
    await signupPage.assertConfirmationMessageVisible();
  });

  test('Validar rechazo de email duplicado con mensaje de error', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-007',
      'PRC-001, PRC-003, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E3', br: 'BR1' },
      'Partición de Equivalencia',
    );

    await allure.parameter('Seed_Email', seedDuplicate.email);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(seedDuplicate.name, seedDuplicate.email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertEmailAlreadyExists();
  });

  test('Validar rechazo de password con 5 caracteres', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-008',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E4', br: 'BR2' },
      'Valores Límite',
    );

    const email = DataGenerator.uniqueEmail('tc008');
    const name = DataGenerator.randomName();
    const password = DataGenerator.passwordOfLength(5);

    await allure.parameter('Password_Length', String(password.length));

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertAccountInformationVisible();
    await signupPage.fillAccountInformation(DataGenerator.accountInfo(password));
    await signupPage.submitAccountCreation();
    await signupPage.assertNoConfirmationMessage();
  });

  test('Validar rechazo de password con 1 carácter', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-009',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E4', br: 'BR2' },
      'Valores Límite',
      'normal',
    );

    const email = DataGenerator.uniqueEmail('tc009');
    const name = DataGenerator.randomName();
    const password = DataGenerator.passwordOfLength(1);

    await allure.parameter('Password_Length', String(password.length));

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertAccountInformationVisible();
    await signupPage.fillAccountInformation(DataGenerator.accountInfo(password));
    await signupPage.submitAccountCreation();
    await signupPage.assertNoConfirmationMessage();
  });

  test('Validar rechazo de password vacío', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-010',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E5', br: 'BR2, BR3' },
      'Análisis de Causa-Efecto',
    );

    const email = DataGenerator.uniqueEmail('tc010');
    const name = DataGenerator.randomName();
    const password = DataGenerator.emptyValue;

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertAccountInformationVisible();
    await signupPage.fillAccountInformation(DataGenerator.accountInfo(password));
    await signupPage.submitAccountCreation();
    await signupPage.assertPasswordFieldHtml5Invalid();
  });

  test('Validar rechazo de email vacío', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-011',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E5', br: 'BR3' },
      'Análisis de Causa-Efecto',
    );

    const email = DataGenerator.emptyValue;
    const name = DataGenerator.randomName();

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertEmailFieldHtml5Invalid();
  });

  test('Validar rechazo de nombre vacío', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-012',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E5', br: 'BR3' },
      'Análisis de Causa-Efecto',
    );

    const email = DataGenerator.uniqueEmail('tc012');
    const name = DataGenerator.emptyValue;

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertNameFieldHtml5Invalid();
  });

  test('Validar rechazo con múltiples campos obligatorios vacíos', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-013',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E5', br: 'BR3' },
      'Análisis de Causa-Efecto',
    );

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(DataGenerator.emptyValue, DataGenerator.emptyValue);
    await signupPage.submitNewUserSignup();
    await signupPage.assertNameFieldHtml5Invalid();
  });

  test('Validar ausencia de mensaje de confirmación con email duplicado', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-014',
      'PRC-001, PRC-003, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E7', br: 'BR4' },
      'Tabla de Decisión',
    );

    await allure.parameter('Seed_Email', seedDuplicate.email);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(seedDuplicate.name, seedDuplicate.email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertEmailAlreadyExists();
    await signupPage.assertNoConfirmationMessage();
  });

  test('Validar ausencia de mensaje de confirmación con password inválido', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS02,
      'TC-015',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-007',
      { escenario: 'E7', br: 'BR4' },
      'Tabla de Decisión',
    );

    const email = DataGenerator.uniqueEmail('tc015');
    const name = DataGenerator.randomName();
    const password = DataGenerator.passwordOfLength(5);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertAccountInformationVisible();
    await signupPage.fillAccountInformation(DataGenerator.accountInfo(password));
    await signupPage.submitAccountCreation();
    await signupPage.assertNoConfirmationMessage();
  });

  test('Validar rechazo de intento de inyección SQL en email', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS03,
      'TC-016',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-008',
      { br: 'BR1' },
      'Análisis de Riesgos OWASP',
    );

    const email = DataGenerator.sqlInjectionPayload(0);
    const name = DataGenerator.randomName('SqlInjectionTest');

    await allure.parameter('OWASP_Risk', 'A03:2021 - Injection');
    await allure.parameter('Payload', email);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertEmailFieldHtml5Invalid();
  });

  test('Validar sanitización de scripts XSS en nombre', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS03,
      'TC-017',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-008',
      { br: 'BR3' },
      'Análisis de Riesgos OWASP',
    );

    const email = DataGenerator.uniqueEmail('tc017_xss');
    const name = DataGenerator.xssPayload(0);

    await allure.parameter('OWASP_Risk', 'A03:2021 - Injection (XSS)');
    await allure.parameter('Payload', name);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertNoScriptExecuted();
  });

  test('Validar rechazo de email con formato inválido', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS03,
      'TC-018',
      'PRC-001, PRC-004, PRC-005, PRC-006, PRC-008',
      { br: 'BR1' },
      'Partición de Equivalencia',
      'normal',
    );

    const email = DataGenerator.invalidEmailFormat(0);
    const name = DataGenerator.randomName();

    await allure.parameter('Email_Inválido', email);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertEmailFieldHtml5Invalid();
  });

  test('Validar integración exitosa con endpoint de registro', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS03,
      'TC-019',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006, PRC-009',
      {},
      'Testing de Integración API',
    );

    const email = DataGenerator.uniqueEmail('tc019_api');
    const name = DataGenerator.randomName();
    const password = DataGenerator.validPassword();
    const accountInfo = DataGenerator.accountInfo(password);

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);

    const signupResponse = await signupPage.submitAndCaptureSignupResponse();
    expect([200, 201, 302]).toContain(signupResponse.status());

    await signupPage.assertAccountInformationVisible();
    await signupPage.fillAccountInformation(accountInfo);

    const createResponse = await signupPage.submitAndCaptureCreateAccountResponse();
    expect([200, 201, 302]).toContain(createResponse.status());

    await signupPage.assertAccountCreated();
  });

  test('Validar no exposición de contraseña en respuesta HTTP', async ({ signupPage, baseUrl }) => {
    await tagTrace(
      TS03,
      'TC-020',
      'PRC-001, PRC-002, PRC-004, PRC-005, PRC-006, PRC-009',
      {},
      'Análisis de Riesgos OWASP',
    );

    const email = DataGenerator.uniqueEmail('tc020_sec');
    const name = DataGenerator.randomName();
    const password = DataGenerator.validPassword();
    const accountInfo = DataGenerator.accountInfo(password);

    await allure.parameter('OWASP_Risk', 'A02:2021 - Cryptographic Failures');

    await signupPage.goToHome(baseUrl);
    await signupPage.openSignupLogin();
    await signupPage.fillNewUserSignup(name, email);
    await signupPage.submitNewUserSignup();
    await signupPage.assertAccountInformationVisible();
    await signupPage.fillAccountInformation(accountInfo);

    const responses = await signupPage.captureResponsesDuringAction(
      (url) => url.includes('automationexercise.com'),
      async () => {
        await signupPage.submitAccountCreation();
      },
    );

    expect(responses.length).toBeGreaterThan(0);
    await signupPage.assertNoPasswordLeakInResponses(responses, password);
    await signupPage.assertAccountCreated();
  });
});
