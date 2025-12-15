# QASL Framework - Shift-Left QA Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Playwright](https://img.shields.io/badge/playwright-latest-orange.svg)
![K6](https://img.shields.io/badge/k6-latest-purple.svg)

**The first unified Shift-Left Testing Platform that integrates Static Analysis, Unit Testing, E2E, API, Performance, and Security testing in a single workflow.**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## What Makes QASL Unique?

| Feature | Traditional Tools | QASL Framework |
|---------|------------------|----------------|
| **Static HU Analysis** | Manual review | AI-powered gap detection |
| **Unit Testing** | Separate project | Integrated Vitest (128+ tests) |
| **API Capture** | Manual Postman setup | Auto-capture from E2E |
| **Test Recording** | Playwright Codegen (5 levels) | Universal Recorder Pro (11 levels + confidence score) |
| **Unified Dashboard** | Multiple tools | Single Grafana Centro de Control |
| **Pipeline** | Separate configs | One command: `npm run pipeline` |

---

## Features

### Phase 0: Unit Testing (Vitest)
- **128+ Tests**: Validate automation helpers before E2E
- **Fast Execution**: Sub-second test runs
- **Coverage Reports**: 80% threshold configured
- **Visual UI**: Interactive test browser

### Phase 1: Static Testing (sigma_analyzer)
- **AI-Powered Analysis**: Detect coverage gaps in User Stories before coding
- **ISTQB/IEEE Compliance**: Following IEEE 829, IEEE 830, ISO/IEC 27001
- **Traceability CSVs**: Export to Jira, Xray, Azure DevOps, TestRail
- **100% Coverage Generation**: Transform incomplete HUs into fully covered ones

### Phase 2: Universal Recorder Pro
- **11-Level Selector Strategy** (vs 5 in Playwright Codegen)
- **Real-time Confidence Score**: Know selector reliability instantly
- **Smart Dynamic Detection**: Avoids UUIDs, timestamps, hashes
- **Auto-respawn UI**: Persistent recording interface

### Phase 3: E2E Testing (Playwright + Allure)
- **Automatic API Capture**: Record APIs during E2E for later testing
- **Allure Integration**: Full traceability with ISTQB decorators
- **Multi-browser**: Chromium, Firefox, WebKit
- **Parallel Execution**: Optimized for speed

### Phase 4: API Testing (Newman)
- **Zero Config**: Uses captured APIs automatically
- **HTMLExtra Reports**: Professional documentation
- **Metrics to Grafana**: Real-time visibility

### Phase 5: Performance Testing (K6)
- **Multiple Test Types**: Load, Stairs, Stress, Spike, Soak
- **Native InfluxDB**: Direct metrics streaming
- **Visual in Grafana**: Real-time VUs, response times, errors

### Phase 6: Security Testing (OWASP ZAP)
- **Automated Scanning**: Baseline security scan
- **OWASP Top 10**: Detect common vulnerabilities
- **Severity Metrics**: HIGH, MEDIUM, LOW, INFO in dashboard

### Phase 7: Infrastructure Observability (Loki + Promtail)
- **Centralized Log Aggregation**: All Docker container logs in one place
- **Real-time Error Detection**: Automatic error/warning detection across infrastructure
- **Lightweight Stack**: ~350MB RAM (vs 16-32GB for OpenShift/ELK)
- **LogQL Queries**: Powerful log querying and filtering
- **Grafana Integration**: Dedicated Infrastructure Logs dashboard
- **CLI Health Check**: `npm run infra:check` for quick infrastructure status

### Unified Dashboard (Grafana)
- **Centro de Control**: All metrics in one place
- **Auto-refresh**: 5-second updates
- **Color-coded**: Green/Yellow/Red thresholds
- **Historical Data**: Track trends over time

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10 (for sigma_analyzer)
- **Docker Desktop**
- **K6**: [Installation Guide](https://k6.io/docs/getting-started/installation/)

### Installation

```bash
# Clone the repository
git clone https://github.com/E-Gregorio/QASL-Framework.git
cd QASL-Framework

# Install dependencies
npm install
npx playwright install

# Install Python dependencies (for static analysis)
cd sigma_analyzer
pip install -r requirements.txt
cd ..
```

---

## Execution Flow (Step by Step)

> **IMPORTANT:** Execute commands in order for Grafana to show all metrics.

### STEP 1: Clean Everything (New Day)

```bash
npm run clean
```

### STEP 2: Start Docker Services

```bash
npm run docker:up
```

Wait ~30 seconds. **Verify:** http://localhost:3001 (Grafana)

### STEP 3: Run Unit Tests (Vitest)

```bash
npm run unit
```

> Validates helpers, validators, and data generators work correctly before E2E.

### STEP 4: Run E2E Tests (Playwright) + Send Metrics

```bash
npm run e2e:capture
node scripts_metricas/send-e2e-metrics.mjs
```

> Runs E2E + captures APIs + sends metrics to Grafana.

### STEP 5: Run API Tests (Newman) + Send Metrics

```bash
npm run api
node scripts_metricas/send-api-metrics.mjs
```

### STEP 6: Run Performance Tests (K6)

```bash
npm run k6:reset
npm run k6 -- --type=stairs --vus=5 --duration=150s
```

> K6 sends metrics automatically to InfluxDB/Grafana.

**Available test types:**

| Type | Description | Command |
|------|-------------|---------|
| `load` | Normal load (default) | `npm run k6` |
| `stairs` | Visible staircase in Grafana | `npm run k6 -- --type=stairs --vus=5 --duration=150s` |
| `stress` | Stress to the limit | `npm run k6 -- --type=stress --vus=50` |
| `spike` | Sudden load spike | `npm run k6 -- --type=spike --vus=30` |
| `soak` | Extended endurance | `npm run k6 -- --type=soak --vus=10 --duration=300s` |

### STEP 7: Run Security Tests (OWASP ZAP) + Send Metrics

```bash
npm run zap
node scripts_metricas/send-zap-metrics.mjs
```

### STEP 8: Check Infrastructure Health (Loki)

```bash
# Quick infrastructure health check
npm run infra:check

# With options
npm run infra:check -- --time=1h              # Last hour
npm run infra:check -- --container=postgres   # Specific container
```

> Opens Infrastructure Logs dashboard: `npm run infra:logs`

### STEP 9: View Centro de Control (Grafana)

```
http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control?kiosk=true
```

**Credentials:** admin / admin

### STEP 10: Publish Reports to GitLab Pages

```bash
npm run publish
```

**Reports URL:** https://sigma-qa-framework-207db7.gitlab.io/

### STEP 11: End of Day - Stop Docker

```bash
npm run docker:down
```

---

## Quick Reference - COPY/PASTE

```bash
# 1. Clean everything (new day)
npm run clean

# 2. Start Docker services
npm run docker:up

# 3. Unit Tests (validate helpers before E2E)
npm run unit

# 4. E2E + Metrics to Grafana
npm run e2e:capture
node scripts_metricas/send-e2e-metrics.mjs

# 5. API + Metrics to Grafana
npm run api
node scripts_metricas/send-api-metrics.mjs

# 6. Performance (K6 sends metrics automatically)
npm run k6:reset
npm run k6 -- --type=stairs --vus=5 --duration=150s

# 7. Security + Metrics to Grafana
npm run zap
node scripts_metricas/send-zap-metrics.mjs

# 8. Infrastructure Health Check (Loki)
npm run infra:check
npm run infra:logs  # Open dashboard

# 9. View Grafana (all metrics visible)
# http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control?kiosk=true

# 10. Publish reports
npm run publish

# 11. Stop Docker
npm run docker:down
```

---

## View Local Allure Report

```bash
npm run allure:open
```

---

## Unit Tests - Automation Framework (Vitest)

Unit tests that validate the automation code (helpers, validators, generators).

> **IMPORTANT:** These tests DO NOT test the application source code (developers do that). They test the automation framework functions to guarantee the automation is 100% reliable.

### Commands

```bash
npm run unit              # Run all unit tests
npm run unit:watch        # Development mode (re-runs on save)
npm run unit:ui           # Visual Vitest interface
npm run unit:coverage     # With code coverage report
```

### What Gets Tested

| Module | Function | Purpose |
|--------|----------|---------|
| `validators.ts` | `validateCUIT()` | Validates Argentine CUIT before using in forms |
| `validators.ts` | `validateEmail()` | Validates email format |
| `validators.ts` | `validateDateFormat()` | Validates DD/MM/YYYY date |
| `formatters.ts` | `formatCurrency()` | Formats amounts correctly |
| `test-data-generator.ts` | `generateValidCUIT()` | Generates valid CUIT for tests |
| `test-data-generator.ts` | `generateTestUser()` | Generates complete fake user |

### Why It Matters

1. **Reliability** - If `generateValidCUIT()` generates an invalid CUIT, 100 E2E tests would fail
2. **Early Detection** - Detects bugs in the framework before running E2E
3. **Living Documentation** - Tests document how helpers work
4. **80% Coverage** - Configured with minimum coverage thresholds

### Reports

```
reports/
├── unit/
│   ├── results.json       # JSON results
│   └── junit.xml          # For CI/CD
└── unit-coverage/
    └── index.html         # Visual coverage report
```

---

## Full Pipeline (Single Command)

```bash
npm run pipeline
```

**With options:**
```bash
npm run pipeline -- --skip-zap    # Skip security
npm run pipeline -- --skip-k6     # Skip performance
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      QASL FRAMEWORK ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐                                                    │
│  │   HU Original   │ User Story from Business/PO                        │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │ SIGMA ANALYZER  │───▶│   HU IDEAL      │───▶│  CSVs Export    │     │
│  │ (Static Tests)  │    │ (100% Coverage) │    │ (Jira/Xray)     │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │  UNIT TESTS     │ Validate automation helpers (Vitest 128+ tests)   │
│  │  (Vitest)       │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ RECORDER PRO    │ Optional: Record new tests with confidence score   │
│  │ (11-Level)      │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │   E2E TESTS     │───▶│  .api-captures/ │ Auto-captured APIs          │
│  │ (Playwright)    │    │                 │                            │
│  └────────┬────────┘    └────────┬────────┘                            │
│           │                      │                                      │
│           │    ┌─────────────────┼─────────────────┐                   │
│           │    │                 │                 │                   │
│           ▼    ▼                 ▼                 ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  API TESTS   │    │ PERFORMANCE  │    │  SECURITY    │              │
│  │  (Newman)    │    │    (K6)      │    │ (OWASP ZAP)  │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                   │                       │
│         └───────────────────┼───────────────────┘                       │
│                             │                                           │
│                             ▼                                           │
│                    ┌─────────────────┐                                  │
│                    │    InfluxDB     │                                  │
│                    │   (Metrics)     │                                  │
│                    └────────┬────────┘                                  │
│                             │                                           │
│  ┌─────────────────┐        │                                           │
│  │  PROMTAIL       │────────┤ Collects Docker container logs            │
│  │ (Log Collector) │        │                                           │
│  └────────┬────────┘        │                                           │
│           │                 │                                           │
│           ▼                 │                                           │
│  ┌─────────────────┐        │                                           │
│  │     LOKI        │────────┤ Log aggregation & querying                │
│  │  (Log Store)    │        │                                           │
│  └────────┬────────┘        │                                           │
│           │                 │                                           │
│           └─────────────────┼───────────────────────────────────────    │
│                             │                                           │
│                             ▼                                           │
│                    ┌─────────────────┐                                  │
│                    │  GRAFANA        │                                  │
│                    │ Centro Control  │ Real-time unified dashboard      │
│                    │ + Infra Logs    │ Infrastructure observability     │
│                    └─────────────────┘                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
QASL-Framework/
│
├── sigma_analyzer/              # [PHASE 1] Static Analysis
│   ├── run_analysis.py          # Main analysis script
│   ├── parser.py                # HU Markdown parser
│   ├── rtm_analyzer_ai.py       # AI-powered RTM analyzer
│   ├── report_generator.py      # Report generator
│   ├── hu_ideal_html_generator.py
│   ├── templates/               # ISTQB templates
│   ├── docs/                    # Shift-Left documentation
│   ├── reportes/                # Generated reports
│   └── hu_actualizadas/         # 100% coverage HUs
│
├── unit/                        # [PHASE 0] Unit Tests
│   ├── utils/                   # Validators, formatters (tested)
│   ├── helpers/                 # Data generators (tested)
│   ├── __tests__/               # Vitest unit tests
│   ├── setup.ts                 # Global configuration
│   └── index.ts                 # Centralized exports
│
├── universal_recorder_pro.js    # [PHASE 2] Advanced Test Recorder
│
├── e2e/                         # [PHASE 3] E2E Tests
│   ├── locators/                # Centralized selectors (MODIFY)
│   ├── pages/                   # Page Object Model (MODIFY)
│   ├── specs/                   # Test specifications (MODIFY)
│   ├── test-base/               # Test base & fixtures (MODIFY)
│   └── utils/                   # Utilities & Allure decorators
│
├── scripts/                     # Execution scripts (DO NOT TOUCH)
│   ├── run-e2e.mjs              # E2E + Allure + Metrics
│   ├── run-api.mjs              # Newman + Metrics
│   ├── run-k6.mjs               # K6 + Metrics
│   ├── run-zap.mjs              # OWASP ZAP + Metrics
│   └── run-pipeline.mjs         # Full pipeline
│
├── scripts_metricas/            # Metrics senders (DO NOT TOUCH)
│   ├── influx-client.mjs        # Shared InfluxDB client
│   ├── send-e2e-metrics.mjs
│   ├── send-api-metrics.mjs
│   └── send-zap-metrics.mjs
│
├── sigma-sql/                   # [DB] Test Database
│   ├── SIGMA_DDL.sql            # Complete DDL (30+ tables)
│   ├── importar_csv_docker.sql  # Script for Docker
│   ├── importar_csv_windows.sql # Script for Windows/SSMS
│   ├── datos_prueba.csv         # ~911 masked records
│   └── README.md                # Usage documentation
│
├── docker/                      # Docker configuration
│   ├── grafana/dashboards/      # Centro de Control + Infrastructure Logs
│   ├── loki/                    # Loki configuration
│   ├── promtail/                # Promtail configuration
│   └── postgres/init.sql        # Test data schema
│
├── reports/                     # Generated reports (gitignored)
├── plantillas-istqb/            # ISTQB documentation templates
├── docker-compose.yml           # Service definitions
├── playwright.config.ts         # Playwright configuration
├── vitest.config.ts             # Unit tests configuration
└── package.json                 # NPM scripts
```

---

## Grafana Centro de Control

Access the unified dashboard at `http://localhost:3001`

### Panels

| Section | Metrics | Source |
|---------|---------|--------|
| **E2E (Playwright)** | Pass Rate, Passed, Failed, Skipped, Duration | `e2e_tests` |
| **API (Newman)** | Pass Rate, Passed, Failed, Requests, Duration | `api_tests` |
| **Security (ZAP)** | High, Medium, Low, Informational alerts | `zap_security` |
| **Performance (K6)** | Success Rate, Response Time, VUs, Requests, Errors | Native K6 |
| **Infrastructure (Loki)** | Errors, Warnings, Total Logs, Active Containers | Loki/Promtail |

### Infrastructure Logs Dashboard

Access at `http://localhost:3001/d/infrastructure-logs`

| Panel | Description |
|-------|-------------|
| **ERRORS** | Critical errors across all containers (red = action needed) |
| **WARNINGS** | Warning messages (yellow = review) |
| **TOTAL LOGS** | Total log volume in time range |
| **CONTAINERS** | Number of active containers sending logs |
| **Timeline** | Log volume over time by container |
| **Error Logs** | Real-time error stream for diagnostics |
| **All Logs** | Complete log stream with container filter |

### Kiosk Mode (Full Screen)

```
http://localhost:3001/d/sigma-qa-control/sigma-qa-centro-de-control?kiosk=true
```

---

## SQL Server Database - Masked Data (sigma-sql/)

Database with masked data for E2E testing with forms.

### Connection

```
Host: localhost
Port: 1433
User: sa
Password: MyStr0ngP4ssw0rd
Database: SIGMA
```

### Load Test Data

```powershell
# 1. Copy files to container
docker cp sigma-sql/datos_prueba.csv sqlserver:/tmp/data.csv
docker cp sigma-sql/importar_csv_docker.sql sqlserver:/tmp/importar.sql

# 2. Execute import
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP4ssw0rd" -C -i /tmp/importar.sql

# 3. Verify
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP4ssw0rd" -C -d SIGMA -Q "SELECT COUNT(*) AS Total FROM contribuyente"
```

### Available Data

| Table | Records | Description |
|-------|---------|-------------|
| `contribuyente` | ~911 | CUIT, business name, person type |
| `inconsistencia` | ~911 | Masked tax data |
| `actividad` | ~173 | Economic activities |

> See complete documentation in `sigma-sql/README.md`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run clean` | Clean all reports + reset Grafana metrics |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |
| `npm run unit` | Run unit tests |
| `npm run unit:watch` | Unit tests in watch mode |
| `npm run unit:ui` | Visual Vitest interface |
| `npm run unit:coverage` | Unit tests with coverage |
| `npm run e2e` | Run E2E tests |
| `npm run e2e:capture` | Run E2E with API capture |
| `npm run api` | Run API tests |
| `npm run k6` | Run performance tests |
| `npm run k6:reset` | Reset K6 metrics in Grafana |
| `npm run zap` | Run security scan |
| `npm run infra:check` | Check infrastructure health via Loki |
| `npm run infra:logs` | Open Infrastructure Logs dashboard |
| `npm run pipeline` | Run full pipeline |
| `npm run publish` | Publish reports to GitLab Pages |
| `npm run allure:open` | Open Allure report |

---

## Standards & Compliance

- **ISTQB CTFL v4.0** - Foundation Level syllabus
- **ISTQB CTAL** - Advanced Level practices
- **IEEE 829** - Test documentation standard
- **IEEE 830** - Requirements specification
- **ISO/IEC 27001** - Security considerations
- **ISO 9001** - Quality management
- **OWASP Top 10** - Security testing

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Elyer Maldonado**
- QA Tech Lead @ EPIDATA Consulting
- GitHub: [@E-Gregorio](https://github.com/E-Gregorio)

---

## Acknowledgments

- Playwright team for the amazing E2E framework
- K6/Grafana Labs for performance testing tools
- OWASP for security scanning tools
- ISTQB for testing standards and methodologies

---

<div align="center">

**Built with care for the QA Community**

*Shift-Left Testing: Catch bugs before they're born*

</div>
