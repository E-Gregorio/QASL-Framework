# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGINC_05 - Carga Individual |
| **Épica** | Módulo Alta de Inconsistencias EP_SIGMA_01 |
| **Fecha** | 2025-11-29 09:27 |
| **Estado** | ⚠️ **WARNING** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🟡 AMARILLO |
| **Cobertura** | `[██████████░░░░░░░░░░]` **50.0%** |
| **Descripción** | ADVERTENCIA - Gaps altos detectados o cobertura insuficiente |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **0** |
| 🟠 ALTO | Importante | **2** |
| 🟡 MEDIO | Moderado | **2** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **4** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 4 | - |
| 📝 Escenarios Necesarios | 8 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 4 | - |
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
| 2 | BR2 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR2 |
| 3 | BR3 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR3 |
| 4 | BR4 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR4 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | La funcionalidad “Carga Individual” se accede desd... | ✅ | ❌ | 🟡 50% |
| **BR2** | El formulario debe presentar los campos detallados... | ✅ | ❌ | 🟡 50% |
| **BR3** | Si falta un dato obligatorio se muestra “Faltan ca... | ❌ | ✅ | 🟡 50% |
| **BR4** | Si están todos los datos obligatorios se agregan l... | ✅ | ❌ | 🟡 50% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🟡 MEDIO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | La funcionalidad “Carga Individual” se accede desde la pantalla de la grilla de alta de inconsistencias. |
| Razón | falta_negativo |

### GAP-002 🟡 MEDIO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | El formulario debe presentar los campos detallados en el diseño de pantallas en figma (datos de contribuyente, datos de la inconsistencia, información general). |
| Razón | falta_negativo |

### GAP-003 🟠 ALTO

**Falta escenario positivo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | Si falta un dato obligatorio se muestra “Faltan campos obligatorios en algunas filas.” y no se registra. |
| Razón | falta_positivo |
| OWASP | 🔒 A03 |

### GAP-004 🟠 ALTO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Si están todos los datos obligatorios se agregan las entidades necesarias con estado “Ingresada” y origen “Carga Manual”. |
| Razón | falta_negativo |
| OWASP | 🔒 A03 |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🟡 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que estoy en otra pantalla del sistema
CUANDO intento acceder a la funcionalidad 'Carga Individual' directamente
ENTONCES el sistema no permite el acceso a la funcionalidad
Y muestra un mensaje indicando que la funcionalidad solo es accesible desde la grilla de inconsistencias
```


### 🟡 GAP-002: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que el diseño de la pantalla de carga individual tiene un error
CUANDO intento acceder a la funcionalidad 'Carga Individual'
ENTONCES el sistema muestra un mensaje de error indicando que no se pudo cargar el formulario correctamente
Y el sistema no permite la carga de datos
```


### 🟠 GAP-003: Falta escenario positivo para BR3

**BR Afectada:** BR3

```gherkin
DADO que todos los campos obligatorios del formulario están vacíos
CUANDO presiono 'Guardar'
ENTONCES el sistema muestra el mensaje 'Faltan campos obligatorios en algunas filas.'
Y el sistema permanece en el formulario
```

🔒 **Referencia OWASP:** A03


### 🟠 GAP-004: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO que completo todos los campos obligatorios correctamente
CUANDO presiono 'Guardar' y ocurre un error en la base de datos
ENTONCES el sistema muestra un mensaje de error indicando que no se pudo guardar la información
Y el sistema no registra los datos
```

🔒 **Referencia OWASP:** A03


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 09:27:08

*Análisis potenciado por Google Gemini AI para precisión semántica.*
