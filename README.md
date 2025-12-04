# QA-HU-TEMPLATE

**Template Universal QA - Shift-Left Testing**

EPIDATA - Proyecto SIGMA | TeamQA

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
│   ├── locators/                # Selectores centralizados (SOLO MODIFICAR)
│   ├── pages/                   # Page Object Model (SOLO MODIFICAR)
│   ├── specs/                   # Test Specs (SOLO MODIFICAR)
│   ├── test-base/               # Base de tests (SOLO MODIFICAR)
│   └── utils/                   # Utilidades (AllureDecorators, APICapture)
│
├── scripts/                     # Scripts de ejecucion
│   ├── run-e2e.mjs              # Ejecuta E2E + Allure
│   ├── run-api.mjs              # Ejecuta Newman + HTMLExtra
│   ├── run-k6.mjs               # Ejecuta K6 + HTML Report
│   ├── run-zap.mjs              # Ejecuta OWASP ZAP + HTML
│   └── run-pipeline.mjs         # Ejecuta todo el pipeline
│
├── reports/                     # Reportes generados (NO TOCAR)
│   ├── e2e/                     # Allure + Playwright HTML
│   ├── api/                     # Newman HTMLExtra
│   ├── k6/                      # K6 HTML Report
│   └── zap/                     # OWASP ZAP HTML/JSON
│
├── plantillas-istqb/            # [0] PLANTILLAS DOCUMENTACION QA
│   ├── plantillaMasterTestPlan.md        # Master Test Plan
│   ├── plantillaTestPlan.md              # Sprint Test Plan
│   ├── Calendario de Pruebas.md          # Test Schedule
│   ├── Metricas de Prueba.md             # KPIs y Metricas QA
│   ├── Informe de Avance de Prueba.md    # Progress Report
│   ├── Informe de Bug_defecto.md         # Bug Report Individual
│   ├── Informe de defecto.md             # Defect Report Consolidado
│   ├── Informe de Prueba_IEEE 29119-3.md # Test Closure Report
│   └── Guia-Estimacion-VCR-Story-Points.md # Estimacion VCR
│
├── docker/                      # Configuracion Docker
│   └── postgres/init.sql        # Schema y datos de prueba PostgreSQL
├── docker-compose.yml           # Servicios Docker (ver tabla abajo)
├── playwright.config.ts         # Configuracion Playwright
└── package.json                 # Scripts npm
```

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
│       └── Genera reporte Allure con trazabilidad                       │
│              │                                                          │
│              ▼                                                          │
│  [3] PRUEBAS API (Newman + HTMLExtra)                                  │
│       │                                                                 │
│       ├── Lee APIs capturadas (.api-captures/)                         │
│       ├── Genera coleccion Postman dinamica                            │
│       └── Ejecuta y genera reporte HTMLExtra                           │
│              │                                                          │
│              ▼                                                          │
│  [4] PRUEBAS PERFORMANCE (K6 + HTML)                                   │
│       │                                                                 │
│       ├── Lee APIs capturadas                                          │
│       ├── Ejecuta test de carga (VUs, duration)                        │
│       └── Genera reporte HTML con metricas                             │
│              │                                                          │
│              ▼                                                          │
│  [5] PRUEBAS SEGURIDAD (OWASP ZAP + Docker)                           │
│       │                                                                 │
│       ├── Lee target URL de APIs capturadas                            │
│       ├── Ejecuta baseline scan                                        │
│       └── Genera reporte HTML/JSON de vulnerabilidades                 │
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
- **Docker** (para servicios y ZAP)
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

## Archivos que el Usuario Debe Modificar

```
e2e/
├── locators/     # Agregar selectores de tu aplicacion
├── pages/        # Agregar Page Objects
├── specs/        # Agregar Test Specs
└── test-base/    # Configurar fixtures personalizados

plantillas-istqb/
└── *.md          # Usar como base para documentacion del proyecto
```

**NO MODIFICAR:**
- `scripts/` - Scripts de ejecucion
- `e2e/utils/` - Utilidades del framework
- `reports/` - Generados automaticamente

---

## Soporte

**EPIDATA - Proyecto SIGMA | TeamQA**

---

## COMANDOS - DIA DE TRABAJO (ORDEN CRONOLOGICO)

### 1. INICIO DEL DIA - Encender Laptop

```bash
# Levantar servicios Docker (Grafana, InfluxDB, Allure Server)
npm run docker:up
```

### 2. LIMPIAR REPORTES ANTERIORES (Inicio de Sprint o cuando sea necesario)

```bash
# Limpiar SOLO reportes
npm run clean:reports

# Limpiar TODO (reportes + captures + temporales)
npm run clean
```

### 3. PRUEBAS ESTATICAS - Analizar Historia de Usuario

```bash
cd sigma_analyzer
python run_analysis.py HU_XXXXX
```

**Salida:**
- `reportes/HU_XXXXX_REPORT.md` (gaps encontrados)
- `hu_actualizadas/HU_XXXXX_ACTUALIZADA.html` (HU IDEAL 100%)
- `flujo-ideal/*.csv` (trazabilidad Jira/Xray)

### 4. PRUEBAS E2E - Ejecutar con Captura de APIs

```bash
npm run e2e -- --capture-api
```

**Salida:**
- `reports/e2e/allure-report/` (HTML con trazabilidad)
- `.api-captures/*.json` (APIs capturadas)

### 5. VER REPORTE ALLURE

```bash
npm run allure:open
```

### 6. PRUEBAS API - Ejecutar Newman

```bash
npm run api
```

**Salida:**
- `reports/api/*.html` (Newman HTMLExtra)

### 7. PRUEBAS PERFORMANCE - Ejecutar K6

```bash
npm run k6
```

**Con parametros personalizados:**
```bash
npm run k6 -- --vus=20 --duration=60s
```

**Salida:**
- `reports/k6/*.html` (EPIDATA - Proyecto SIGMA | TeamQA)

### 8. PRUEBAS SEGURIDAD - Ejecutar OWASP ZAP

```bash
npm run zap
```

**Salida:**
- `reports/zap/*.html` (vulnerabilidades)
- `reports/zap/*.json` (detalle tecnico)

### 9. PIPELINE COMPLETO (Opcional - Un solo comando)

```bash
npm run pipeline
```

**Con opciones:**
```bash
npm run pipeline -- --skip-zap    # Omitir seguridad
npm run pipeline -- --skip-k6     # Omitir performance
```

### 10. FIN DEL DIA - Apagar Servicios Docker

```bash
npm run docker:down
```

---

## TABLA RESUMEN DE COMANDOS

| # | Comando | Descripcion | Reporte |
|---|---------|-------------|---------|
| 1 | `npm run docker:up` | Levantar servicios Docker | - |
| 2 | `npm run clean` | Limpiar TODO | - |
| 2 | `npm run clean:reports` | Limpiar solo reportes | - |
| 3 | `python run_analysis.py HU_XXX` | Pruebas estaticas | `sigma_analyzer/reportes/` |
| 4 | `npm run e2e -- --capture-api` | E2E + capturar APIs | `reports/e2e/` |
| 5 | `npm run allure:open` | Abrir reporte Allure | - |
| 6 | `npm run api` | Ejecutar Newman | `reports/api/*.html` |
| 7 | `npm run k6` | Ejecutar K6 | `reports/k6/*.html` |
| 8 | `npm run zap` | Ejecutar OWASP ZAP | `reports/zap/*.html` |
| 9 | `npm run pipeline` | Ejecutar TODO | Todos los reportes |
| 10 | `npm run docker:down` | Apagar servicios Docker | - |

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

### Esquema de Tablas

| Tabla | Descripcion | Registros |
|-------|-------------|-----------|
| `usuarios` | Usuarios del sistema | 5 |
| `roles` | Roles de usuario | 5 |
| `permisos` | Permisos del sistema | 9 |
| `rol_permisos` | Relacion roles-permisos | 15 |
| `estados` | Estados de workflow | 6 |
| `categorias` | Categorias de registros | 5 |
| `registros` | Registros principales | 5 |
| `comentarios` | Comentarios en registros | 0 |
| `archivos_adjuntos` | Archivos adjuntos | 0 |

### Usuarios de Prueba

| Username | Email | Password | Rol |
|----------|-------|----------|-----|
| admin_test | admin@test.local | Test123! | Administrador |
| supervisor_test | supervisor@test.local | Test123! | Supervisor |
| analista_test | analista@test.local | Test123! | Analista |
| operador_test | operador@test.local | Test123! | Operador |
| auditor_test | auditor@test.local | Test123! | Auditor |

### Uso en Tests E2E (Playwright)

```typescript
import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'sigma_qa',
    password: 'sigma_qa_2024',
    database: 'sigma_test'
});

// Obtener usuario de prueba
const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE username = $1',
    ['admin_test']
);

// Limpiar datos de prueba
await pool.query('DELETE FROM registros WHERE codigo LIKE $1', ['TEST-%']);
```

### Comandos Utiles PostgreSQL

```bash
# Conectar via Docker
docker exec -it sigma-postgres psql -U sigma_qa -d sigma_test

# Ver tablas
\dt

# Ver estructura de tabla
\d usuarios

# Ejecutar query
SELECT * FROM usuarios;

# Salir
\q
```
