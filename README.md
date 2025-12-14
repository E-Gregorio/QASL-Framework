# QA-HU-TEMPLATE

**Template Universal QA - Shift-Left Testing**

EPIDATA - Proyecto SIGMA | TeamQA

---

## DIA NUEVO DE TRABAJO - COMANDOS EN ORDEN

> **IMPORTANTE:** Ejecutar los comandos en el orden indicado para que Grafana muestre todas las metricas.

### PASO 1: Limpiar Todo (Empezar desde Cero)

```bash
npm run clean
```

> Elimina: `reports/`, `allure-results/`, `.api-captures/`, `.temp-k6/`, `.temp-newman/`

---

### PASO 2: Levantar Servicios Docker

```bash
npm run docker:up
```

Esperar ~30 segundos. **Verificar:** http://localhost:3001 (Grafana)

---

### PASO 3: Ejecutar Unit Tests del Framework (Vitest)

```bash
npm run unit
```

> Valida que los helpers, validators y generadores de datos funcionen correctamente antes de ejecutar E2E.

---

### PASO 4: Ejecutar Pruebas E2E (Playwright) + Enviar Metricas

```bash
npm run e2e:capture
node scripts_metricas/send-e2e-metrics.mjs
```

> Ejecuta E2E + captura APIs + envia metricas a Grafana.

---

### PASO 5: Ejecutar Pruebas API (Newman) + Enviar Metricas

```bash
npm run api
node scripts_metricas/send-api-metrics.mjs
```

---

### PASO 6: Ejecutar Pruebas Performance (K6)

```bash
npm run k6:reset
npm run k6 -- --type=stairs --vus=5 --duration=150s
```

> K6 envia metricas automaticamente a InfluxDB/Grafana.

**Tipos de prueba disponibles:**
| Tipo | Descripcion | Comando |
|------|-------------|---------|
| `load` | Carga normal (default) | `npm run k6` |
| `stairs` | Escalera visible en Grafana | `npm run k6 -- --type=stairs --vus=5 --duration=150s` |
| `stress` | Estres hasta el limite | `npm run k6 -- --type=stress --vus=50` |
| `spike` | Pico de carga repentino | `npm run k6 -- --type=spike --vus=30` |
| `soak` | Resistencia prolongada | `npm run k6 -- --type=soak --vus=10 --duration=300s` |

---

### PASO 7: Ejecutar Pruebas Seguridad (OWASP ZAP) + Enviar Metricas

```bash
npm run zap
node scripts_metricas/send-zap-metrics.mjs
```

---

### PASO 8: Ver Centro de Control (Grafana)

```
http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control?kiosk=true
```

**Credenciales:** admin / admin

---

### PASO 9: Publicar Reportes a GitLab Pages

```bash
npm run publish
```

**URL Reportes:** https://sigma-qa-framework-207db7.gitlab.io/

> Envia este link por correo a tu equipo.

---

### PASO 10: Fin del Dia - Apagar Docker

```bash
npm run docker:down
```

---

## RESUMEN RAPIDO - COPY/PASTE

```bash
# 1. Limpiar todo (dia nuevo)
npm run clean

# 2. Levantar servicios Docker
npm run docker:up

# 3. Unit Tests del Framework (validar helpers antes de E2E)
npm run unit

# 4. E2E + Metricas a Grafana
npm run e2e:capture
node scripts_metricas/send-e2e-metrics.mjs

# 5. API + Metricas a Grafana
npm run api
node scripts_metricas/send-api-metrics.mjs

# 6. Performance (K6 envia metricas automaticamente)
npm run k6:reset
npm run k6 -- --type=stairs --vus=5 --duration=150s

# 7. Seguridad + Metricas a Grafana
npm run zap
node scripts_metricas/send-zap-metrics.mjs

# 8. Ver Grafana (todas las metricas visibles)
# http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control?kiosk=true

# 9. Publicar reportes
npm run publish

# 10. Apagar Docker
npm run docker:down
```

---

## Ver Reporte Allure Local

```bash
npm run allure:open
```

---

## Unit Tests del Framework de Automatizacion (Vitest)

Pruebas unitarias que validan el codigo de automatizacion (helpers, validators, generadores).

> **IMPORTANTE:** Estas pruebas NO testean el codigo fuente de la aplicacion (eso lo hacen los desarrolladores). Testean las funciones del framework de automatizacion para garantizar que la automatizacion es 100% confiable.

### Comandos

```bash
npm run unit              # Ejecutar todos los unit tests
npm run unit:watch        # Modo desarrollo (re-ejecuta al guardar)
npm run unit:ui           # Interfaz visual de Vitest
npm run unit:coverage     # Con reporte de cobertura de codigo
```

### Que se testea

| Modulo | Funcion | Proposito |
|--------|---------|-----------|
| `validators.ts` | `validateCUIT()` | Valida CUIT argentino antes de usarlo en formularios |
| `validators.ts` | `validateEmail()` | Valida formato de email |
| `validators.ts` | `validateDateFormat()` | Valida fecha DD/MM/YYYY |
| `formatters.ts` | `formatCurrency()` | Formatea montos correctamente |
| `test-data-generator.ts` | `generateValidCUIT()` | Genera CUIT valido para tests |
| `test-data-generator.ts` | `generateTestUser()` | Genera usuario completo fake |

### Por que es importante

1. **Confiabilidad** - Si `generateValidCUIT()` genera un CUIT invalido, 100 tests E2E fallarian
2. **Deteccion temprana** - Detecta bugs en el framework antes de ejecutar E2E
3. **Documentacion viva** - Los tests documentan como funcionan los helpers
4. **Cobertura 80%** - Configurado con umbrales minimos de cobertura

### Reportes

```
reports/
├── unit/
│   ├── results.json       # Resultados JSON
│   └── junit.xml          # Para CI/CD
└── unit-coverage/
    └── index.html         # Reporte visual de cobertura
```

---

## PIPELINE COMPLETO (Un Solo Comando)

```bash
npm run pipeline
```

**Con opciones:**
```bash
npm run pipeline -- --skip-zap    # Omitir seguridad
npm run pipeline -- --skip-k6     # Omitir performance
```

---

## Arquitectura del Template

### Archivos que SE MODIFICAN (Adaptables al Proyecto)

```
e2e/
├── locators/     # Selectores CSS/XPath de tu aplicacion
├── pages/        # Page Objects de tu aplicacion
├── specs/        # Test Specs con tus casos de prueba
└── test-base/    # Configuracion base y fixtures
```

### Archivos que NO SE TOCAN (Framework Universal)

```
scripts/              # Scripts de ejecucion (universales)
scripts_metricas/     # Envio de metricas a InfluxDB (universales)
e2e/utils/            # Utilidades del framework
docker/               # Configuracion Docker
reports/              # Generados automaticamente
```

---

## Estructura del Proyecto

```
qa-hu-template/
│
├── sigma_analyzer/              # [1] PRUEBAS ESTATICAS - Analisis de HUs
│   ├── run_analysis.py          # Script principal de analisis
│   ├── parser.py                # Parser de HUs en Markdown
│   ├── rtm_analyzer_ai.py       # Analizador RTM con Claude AI
│   ├── report_generator.py      # Generador de reportes
│   ├── hu_ideal_html_generator.py # Generador de HU IDEAL
│   ├── templates/               # Plantillas ISTQB
│   ├── docs/                    # Documentacion del flujo
│   ├── reportes/                # Reportes generados
│   └── hu_actualizadas/         # HUs con 100% cobertura
│
├── e2e/                         # [2-5] PRUEBAS DINAMICAS
│   ├── locators/                # Selectores centralizados (MODIFICAR)
│   ├── pages/                   # Page Object Model (MODIFICAR)
│   ├── specs/                   # Test Specs (MODIFICAR)
│   ├── test-base/               # Base de tests (MODIFICAR)
│   └── utils/                   # Utilidades (NO TOCAR)
│
├── scripts/                     # Scripts de ejecucion (NO TOCAR)
│   ├── run-e2e.mjs              # Ejecuta E2E + Allure + Metricas
│   ├── run-api.mjs              # Ejecuta Newman + Metricas
│   ├── run-k6.mjs               # Ejecuta K6 + Metricas
│   ├── run-zap.mjs              # Ejecuta OWASP ZAP + Metricas
│   └── run-pipeline.mjs         # Ejecuta todo el pipeline
│
├── scripts_metricas/            # Envio de metricas (NO TOCAR)
│   ├── influx-client.mjs        # Cliente InfluxDB compartido
│   ├── send-e2e-metrics.mjs     # E2E -> InfluxDB
│   ├── send-api-metrics.mjs     # API -> InfluxDB
│   ├── send-zap-metrics.mjs     # ZAP -> InfluxDB
│   └── send-k6-metrics.mjs      # K6 info (metricas nativas)
│
├── reports/                     # Reportes generados (NO TOCAR)
│   ├── e2e/                     # Allure + Playwright HTML
│   ├── api/                     # Newman HTMLExtra
│   ├── k6/                      # K6 HTML Report
│   └── zap/                     # OWASP ZAP HTML/JSON
│
├── docker/                      # Configuracion Docker
│   ├── grafana/dashboards/      # Dashboard Centro de Control
│   └── postgres/init.sql        # Schema y datos de prueba
│
├── sigma-sql/                   # [DB] BASE DE DATOS DE PRUEBAS
│   ├── SIGMA_DDL.sql            # DDL completo (30+ tablas)
│   ├── importar_csv_docker.sql  # Script para Docker
│   ├── importar_csv_windows.sql # Script para Windows/SSMS
│   ├── datos_prueba.csv         # ~911 registros enmascarados
│   └── README.md                # Documentacion de uso
│
├── unit/                        # [UNIT] TESTS DEL FRAMEWORK DE AUTOMATIZACION
│   ├── utils/                   # Validators, formatters (testeados)
│   ├── helpers/                 # Generadores de datos (testeados)
│   ├── __tests__/               # Tests unitarios con Vitest
│   ├── setup.ts                 # Configuracion global
│   └── index.ts                 # Exports centralizados
│
├── plantillas-istqb/            # Plantillas documentacion QA
├── docker-compose.yml           # Servicios Docker
├── playwright.config.ts         # Configuracion Playwright
├── vitest.config.ts             # Configuracion Unit Tests
└── package.json                 # Scripts npm
```

---

## Centro de Control (Grafana Dashboard)

Dashboard en tiempo real con metricas de todas las pruebas.

### URL de Acceso

```
http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control
```

**Modo Kiosk (Pantalla Completa):**
```
http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control?kiosk=true
```

### Secciones del Dashboard

| Seccion | Metricas | Fuente |
|---------|----------|--------|
| **E2E (Playwright)** | Pass Rate, Passed, Failed, Skipped, Duration | `e2e_tests` |
| **API (Newman)** | Pass Rate, Passed, Failed, Requests, Duration | `api_tests` |
| **Seguridad (ZAP)** | High, Medium, Low, Informational | `zap_security` |
| **Performance (K6)** | Success Rate, Response Time, VUs, Requests, Errors | K6 nativo |

### Caracteristicas

- Refresh automatico cada 5 segundos
- Colores dinamicos segun umbrales (verde/amarillo/rojo)
- Graficos historicos de K6
- 100% dinamico - funciona con cualquier proyecto

---

## Flujo Shift-Left Testing (6 Fases ISTQB)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SHIFT-LEFT TESTING FLOW                          │
│            Alineado con ISTQB v4.0 | ISO/IEC/IEEE 29119 | IEEE 829      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [0] DOCUMENTACION QA (plantillas-istqb/)                              │
│       │                                                                 │
│       ├── Master Test Plan (IEEE 29119-3)                              │
│       ├── Sprint Test Plan                                             │
│       ├── Estimacion VCR (Value + Cost + Risk)                         │
│       └── Plantillas de reportes y metricas                            │
│              │                                                          │
│              ▼                                                          │
│  [1] PRUEBAS ESTATICAS (sigma_analyzer)                                │
│       │                                                                 │
│       ├── Analiza HU Original (.md)                                    │
│       ├── Detecta gaps y cobertura                                     │
│       ├── Genera HU IDEAL (100% cobertura)                             │
│       └── Genera CSVs de trazabilidad                                  │
│              │                                                          │
│              ▼                                                          │
│  [2] PRUEBAS E2E (Playwright + Allure)                                 │
│       │                                                                 │
│       ├── Ejecuta specs con decoradores Allure                         │
│       ├── Captura APIs automaticamente                                 │
│       ├── Genera reporte Allure con trazabilidad                       │
│       └── Envia metricas a InfluxDB/Grafana                            │
│              │                                                          │
│              ▼                                                          │
│  [3] PRUEBAS API (Newman + HTMLExtra)                                  │
│       │                                                                 │
│       ├── Lee APIs capturadas (.api-captures/)                         │
│       ├── Genera coleccion Postman dinamica                            │
│       ├── Ejecuta y genera reporte HTMLExtra                           │
│       └── Envia metricas a InfluxDB/Grafana                            │
│              │                                                          │
│              ▼                                                          │
│  [4] PRUEBAS PERFORMANCE (K6 + InfluxDB)                               │
│       │                                                                 │
│       ├── Lee APIs capturadas                                          │
│       ├── Ejecuta test de carga (VUs, duration)                        │
│       ├── Genera reporte HTML con metricas                             │
│       └── Envia metricas nativas a InfluxDB/Grafana                    │
│              │                                                          │
│              ▼                                                          │
│  [5] PRUEBAS SEGURIDAD (OWASP ZAP + Docker)                           │
│       │                                                                 │
│       ├── Lee target URL de APIs capturadas                            │
│       ├── Ejecuta baseline scan                                        │
│       ├── Genera reporte HTML/JSON de vulnerabilidades                 │
│       └── Envia metricas a InfluxDB/Grafana                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Specs con Allure

```typescript
import { test, expect } from '../test-base/TestBase';
import { Allure } from '../utils/AllureDecorators';

test.describe('TS-001: Modulo Ejemplo', () => {

    test.beforeEach(async () => {
        await Allure.setup({
            epic: 'EP_SIGMA - Plataforma SIGMA',
            feature: 'Alta de Inconsistencias',
            story: 'HU-001: Como usuario quiero...',
            severity: 'critical',
            owner: 'QA Team',
            tags: ['smoke', 'e2e', 'regression'],
            testCase: 'TS-001'
        });
    });

    test('TC-001: Validar flujo principal', async ({ page }) => {
        await Allure.description('Objetivo del test case...');

        await Allure.step('DADO que navego al modulo', async () => {
            await page.goto('/modulo');
        });

        await Allure.step('CUANDO realizo la accion', async () => {
            await page.click('#boton');
        });

        await Allure.step('ENTONCES veo el resultado', async () => {
            await expect(page.locator('#resultado')).toBeVisible();
        });
    });
});
```

---

## Trazabilidad Shift-Left (Allure)

| Campo | Descripcion |
|-------|-------------|
| **Epic** | Modulo del sistema (EP_SIGMA_XX) |
| **Feature** | Funcionalidad especifica |
| **Story** | Historia de Usuario (HU-XXX) |
| **Severity** | blocker / critical / normal / minor / trivial |
| **Owner** | Responsable del test |
| **Tags** | smoke, e2e, regression, api, etc. |
| **Test Case** | ID del caso de prueba (TS-XXX) |

---

## Requisitos

- **Node.js** >= 18
- **Python** >= 3.10 (para sigma_analyzer)
- **Docker Desktop** (para servicios y ZAP)
- **K6** instalado globalmente: https://k6.io/docs/getting-started/installation/
- **Allure CLI**: `npm install -g allure-commandline`

### Instalacion

```bash
# 1. Instalar dependencias Node
npm install

# 2. Instalar browsers Playwright
npx playwright install

# 3. Instalar dependencias Python (sigma_analyzer)
cd sigma_analyzer
pip install -r requirements.txt
```

---

## Servicios Docker

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|--------------|
| **Grafana** | 3001 | http://localhost:3001 | admin / admin |
| **InfluxDB** | 8086 | http://localhost:8086 | - |
| **Allure Server** | 4040, 5050 | http://localhost:4040 | - |
| **PostgreSQL** | 5432 | localhost:5432 | sigma_qa / sigma_qa_2024 |
| **Adminer** | 8083 | http://localhost:8083 | (ver PostgreSQL) |
| **Redis** | 6379 | localhost:6379 | - |
| **SQL Server** | 1433 | localhost:1433 | sa / MyStr0ngP4ssw0rd |
| **OWASP ZAP** | 8082 | http://localhost:8082 | - |
| **n8n** | 5678 | http://localhost:5678 | admin / admin |

---

## Base de Datos PostgreSQL (Test Data)

Base de datos para simular datos de prueba en tests E2E.

### Conexion

```
Host: localhost (o "postgres" desde Docker)
Puerto: 5432
Usuario: sigma_qa
Password: sigma_qa_2024
Base de datos: sigma_test
```

### Acceso via Adminer (GUI Web)

1. Abrir http://localhost:8083
2. Seleccionar **PostgreSQL** en el dropdown
3. Servidor: `postgres`
4. Usuario: `sigma_qa`
5. Password: `sigma_qa_2024`
6. Base de datos: `sigma_test`

### Usuarios de Prueba

| Username | Email | Password | Rol |
|----------|-------|----------|-----|
| admin_test | admin@test.local | Test123! | Administrador |
| supervisor_test | supervisor@test.local | Test123! | Supervisor |
| analista_test | analista@test.local | Test123! | Analista |
| operador_test | operador@test.local | Test123! | Operador |
| auditor_test | auditor@test.local | Test123! | Auditor |

---

## Base de Datos SQL Server - Datos Enmascarados (sigma-sql/)

Base de datos con datos enmascarados para pruebas E2E con formularios.

### Conexion

```
Host: localhost
Puerto: 1433
Usuario: sa
Password: MyStr0ngP4ssw0rd
Base de datos: SIGMA
```

### Cargar Datos de Prueba

```powershell
# 1. Copiar archivos al contenedor
docker cp sigma-sql/datos_prueba.csv sqlserver:/tmp/data.csv
docker cp sigma-sql/importar_csv_docker.sql sqlserver:/tmp/importar.sql

# 2. Ejecutar importacion
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP4ssw0rd" -C -i /tmp/importar.sql

# 3. Verificar
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP4ssw0rd" -C -d SIGMA -Q "SELECT COUNT(*) AS Total FROM contribuyente"
```

### Datos Disponibles

| Tabla | Registros | Descripcion |
|-------|-----------|-------------|
| `contribuyente` | ~911 | CUIT, razon social, tipo persona |
| `inconsistencia` | ~911 | Datos tributarios enmascarados |
| `actividad` | ~173 | Actividades economicas |

> Ver documentacion completa en `sigma-sql/README.md`

---

## Plantillas ISTQB Disponibles

| Plantilla | Estandar | Uso |
|-----------|----------|-----|
| **Master Test Plan** | IEEE 29119-3 | Plan general del proyecto |
| **Sprint Test Plan** | ISTQB v4.0 | Plan por sprint |
| **Test Schedule** | ISO 29119 | Calendario de pruebas |
| **Metricas de Prueba** | ISTQB | KPIs y dashboard |
| **Progress Report** | IEEE 829 | Avance semanal |
| **Bug Report** | ISTQB | Reporte individual de defecto |
| **Defect Report** | IEEE 829 | Consolidado de defectos |
| **Test Closure** | IEEE 29119-3 | Cierre de ciclo de pruebas |
| **Guia VCR** | Custom | Estimacion Value+Cost+Risk |

---

## Soporte

**EPIDATA - Proyecto SIGMA | TeamQA**

**Lider Tecnico:** Elyer Maldonado
