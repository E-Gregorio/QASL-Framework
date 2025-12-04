# Informe de Métricas - Pruebas Estáticas

**Proyecto:** SIGMA
**Cliente:** AGIP
**Fecha:** 03/12/2025
**Elaborado por:** Equipo QA - Epidata

---

## 1. Indicadores Clave de Rendimiento (KPIs)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│       7         │      100%       │       83        │       44        │
│                 │                 │                 │                 │
│ HUs Analizadas  │ Cobertura Final │   Test Cases    │ Reglas Negocio  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## 2. Resumen Ejecutivo

El presente informe documenta los resultados del análisis estático realizado sobre las Historias de Usuario del proyecto SIGMA, siguiendo los lineamientos de ISTQB CTFL v4.0 e IEEE 829.

| Concepto | Valor |
|----------|-------|
| Historias de Usuario analizadas | 7 |
| Épicas cubiertas | 2 |
| Reglas de Negocio identificadas | 44 |
| Test Cases generados | 83 |
| Test Suites creados | 28 |
| Precondiciones definidas | 28 |

---

## 3. Evolución de Cobertura por Historia de Usuario

```
Cobertura Inicial ████░░░░░░  vs  Cobertura Final ██████████

HU_SGINC_02  ████░░░░░░░░░░░░░░░░  37.5%  →  ████████████████████  100%
HU_SGINC_03  ██████████░░░░░░░░░░  50.0%  →  ████████████████████  100%
HU_SGINC_04  ████████░░░░░░░░░░░░  41.7%  →  ████████████████████  100%
HU_SGINC_05  ██████████░░░░░░░░░░  50.0%  →  ████████████████████  100%
HU_SGINC_06  ████░░░░░░░░░░░░░░░░  37.5%  →  ████████████████████  100%
HU_SGPP_01   ███░░░░░░░░░░░░░░░░░  14.3%  →  ████████████████████  100%
HU_SGPP_02   ██████░░░░░░░░░░░░░░  28.6%  →  ████████████████████  100%
```

---

## 4. Detalle por Historia de Usuario

### EP_SIGMA_01 - Módulo Alta de Inconsistencias

| HU | Nombre | Inicial | Final | Test Cases |
|----|--------|---------|-------|------------|
| HU_SGINC_02 | Alta de Inconsistencias | 37.5% | 100% | 8 |
| HU_SGINC_03 | Grilla de Inconsistencias | 50.0% | 100% | 11 |
| HU_SGINC_04 | Importar Lote | 41.7% | 100% | 10 |
| HU_SGINC_05 | Carga Individual | 50.0% | 100% | 8 |
| HU_SGINC_06 | Generar Expediente Lote | 37.5% | 100% | 7 |

### EP_SGPP - Perfiles y Permisos

| HU | Nombre | Inicial | Final | Test Cases |
|----|--------|---------|-------|------------|
| HU_SGPP_01 | Gestión de Perfiles y Permisos | 14.3% | 100% | 27 |
| HU_SGPP_02 | Nuevo Perfil | 28.6% | 100% | 12 |

---

## 5. Distribución de Test Cases por Tipo

```
Funcional     ████████████████████████████████████████████████████████  62 (74.7%)
Seguridad     ████████████████                                          15 (18.1%)
Integración   ██████                                                     6 ( 7.2%)
              ├────────────┼────────────┼────────────┼────────────┤
              0           20           40           60           80
```

| Tipo | Cantidad | Porcentaje |
|------|----------|------------|
| Funcional | 62 | 74.7% |
| Seguridad | 15 | 18.1% |
| Integración | 6 | 7.2% |
| **Total** | **83** | **100%** |

---

## 6. Distribución por Prioridad

```
Alta     ████████████████████████████████████████████████████████████  58 (69.9%)
Media    ████████████████████                                          20 (24.1%)
Baja     █████                                                          5 ( 6.0%)
         ├────────────┼────────────┼────────────┼────────────┤
         0           20           40           60           80
```

| Prioridad | Cantidad | Porcentaje |
|-----------|----------|------------|
| Alta | 58 | 69.9% |
| Media | 20 | 24.1% |
| Baja | 5 | 6.0% |
| **Total** | **83** | **100%** |

---

## 7. Cobertura de Reglas de Negocio

```
EP_SIGMA_01 - Alta de Inconsistencias
████████████████████████████████████████████████████████████████  23/23 BRs (100%)

EP_SGPP - Perfiles y Permisos
████████████████████████████████████████████████████████████████  21/21 BRs (100%)

TOTAL
████████████████████████████████████████████████████████████████  44/44 BRs (100%)
```

| Épica | Total BRs | BRs Cubiertas | Cobertura |
|-------|-----------|---------------|-----------|
| EP_SIGMA_01 | 23 | 23 | 100% |
| EP_SGPP | 21 | 21 | 100% |
| **Total** | **44** | **44** | **100%** |

---

## 8. Escenarios Identificados

Durante el análisis se identificaron escenarios de prueba que complementan la documentación original:

```
Escenarios Negativos Agregados    ████████████████████████████████████  45 (52.9%)
Escenarios Positivos Agregados    ████████████████████                  25 (29.4%)
BRs Sin Cobertura Previa          ████████████                          15 (17.6%)
                                  ├──────────┼──────────┼──────────┤
                                  0         20         40         60
```

| Categoría | Cantidad | Porcentaje |
|-----------|----------|------------|
| Escenarios negativos agregados | 45 | 52.9% |
| Escenarios positivos agregados | 25 | 29.4% |
| BRs sin cobertura previa | 15 | 17.6% |
| **Total** | **85** | **100%** |

---

## 9. Artefactos Entregados

| Artefacto | Cantidad | Descripción |
|-----------|----------|-------------|
| Test Cases | 83 | Casos de prueba con pasos detallados |
| Test Suites | 28 | Agrupaciones lógicas de casos de prueba |
| Precondiciones | 28 | Condiciones previas documentadas |
| HUs Actualizadas | 7 | Historias con escenarios completos |
| Reportes de Análisis | 7 | Análisis detallado por HU |
| Dashboard de Métricas | 1 | Visualización interactiva (HTML) |

---

## 10. Trazabilidad

Se estableció trazabilidad completa entre los siguientes niveles:

```
    ÉPICA  ──────►  HISTORIA DE USUARIO  ──────►  TEST SUITE  ──────►  TEST CASE
      │                    │                          │                    │
      2                    7                         28                   83
```

---

## 11. Estándares Aplicados

- ISTQB CTFL v4.0 - Capítulo 3: Pruebas Estáticas
- IEEE 829 - Documentación de Pruebas de Software
- IEEE 830 - Especificación de Requisitos de Software

---

## 12. Equipo QA

| Rol | Nombre |
|-----|--------|
| Líder Técnico QA | Elyer Maldonado |
| QA Analyst | Kelly Ybarra |

---

*Documento generado el 03/12/2025*
*Proyecto SIGMA - Cliente AGIP*
*Epidata*
