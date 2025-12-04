# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGINC_06 - Generar Expediente Lote |
| **Épica** | Módulo Alta de Inconsistencias |
| **Fecha** | 2025-11-29 09:32 |
| **Estado** | ⚠️ **WARNING** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🟡 AMARILLO |
| **Cobertura** | `[███████░░░░░░░░░░░░░]` **37.5%** |
| **Descripción** | ADVERTENCIA - Gaps altos detectados o cobertura insuficiente |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **0** |
| 🟠 ALTO | Importante | **2** |
| 🟡 MEDIO | Moderado | **1** |
| 🟢 BAJO | Menor | **1** |
| **TOTAL** | | **4** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 4 | - |
| 📝 Escenarios Necesarios | 8 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 3 | - |
| ✅ Escenarios Positivos | 2 | - |
| ❌ Escenarios Negativos | 1 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 4 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 0 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 4 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 0 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR1 |
| 2 | BR2 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR2 |
| 3 | BR3 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR3 |
| 4 | BR4 | falta_positivo | 🟢 BAJO | Falta escenario positivo para BR4 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | La opción “Generar Lote” solo se habilita cuando h... | ✅ | ❌ | 🟡 50% |
| **BR2** | Al generar el lote se debe crear un expediente (in... | ✅ | ❌ | 🟡 50% |
| **BR3** | Las inconsistencias enviadas deben quedar con esta... | ✅ | ❌ | 🟡 50% |
| **BR4** | En caso de error en la generación del expediente d... | ❌ | ✅ | 🟡 50% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🟡 MEDIO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | La opción “Generar Lote” solo se habilita cuando hay una selección de una o más inconsistencias en la grilla. |
| Razón | falta_negativo |

### GAP-002 🟠 ALTO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | Al generar el lote se debe crear un expediente (integración SADE) y asociar el número de expediente a cada inconsistencia seleccionada. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-003 🟠 ALTO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | Las inconsistencias enviadas deben quedar con estado “Candidato a fiscalizar”. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-004 🟢 BAJO

**Falta escenario positivo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | En caso de error en la generación del expediente debe mostrarse un mensaje de error. |
| Razón | falta_positivo |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🟡 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que estoy en la grilla de inconsistencias
CUANDO no selecciono ninguna fila
ENTONCES la opción “Generar Lote” permanece deshabilitada
```


### 🟠 GAP-002: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que seleccioné inconsistencias y presioné “Generar Lote”
CUANDO la integración con SADE falla y no se puede crear el expediente
ENTONCES se muestra un mensaje de error específico indicando que no se pudo crear el expediente y las inconsistencias NO se asocian a ningún expediente
Y Las inconsistencias permanecen en su estado original.
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-003: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO que seleccioné inconsistencias y presioné “Generar Lote” y la integración con SADE fue exitosa
CUANDO la actualización del estado de las inconsistencias a “Candidato a fiscalizar” falla
ENTONCES se muestra un mensaje de error indicando que no se pudo actualizar el estado de las inconsistencias y el expediente se revierte o se marca como inválido
Y Las inconsistencias permanecen en su estado original.
```

🔒 **Referencia OWASP:** A03:2021


### 🟢 GAP-004: Falta escenario positivo para BR4

**BR Afectada:** BR4

```gherkin
DADO que seleccioné inconsistencias y presioné “Generar Lote”
CUANDO la integración con SADE es exitosa y se crea el expediente
ENTONCES se muestra el mensaje de éxito con el número de expediente y NO se muestra ningún mensaje de error
```


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 09:32:13

*Análisis potenciado por Google Gemini AI para precisión semántica.*
