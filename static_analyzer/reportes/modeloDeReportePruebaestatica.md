# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGINC_03 - Grilla de Inconsistencias |
| **Épica** | Módulo Alta de Inconsistencias |
| **Fecha** | 2025-11-29 09:18 |
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
| 🟡 MEDIO | Moderado | **4** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **6** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 5 | - |
| 📝 Escenarios Necesarios | 10 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 5 | - |
| ✅ Escenarios Positivos | 5 | - |
| ❌ Escenarios Negativos | 0 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 6 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 0 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 4 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 1 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR1 |
| 2 | BR2 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR2 |
| 3 | BR3 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR3 |
| 4 | BR4 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR4 |
| 5 | BR5 | falta_positivo | 🟡 MEDIO | Falta escenario positivo para BR5 |
| 6 | BR5 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR5 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | La grilla debe mostrar datos de contribuyentes y s... | ✅ | ❌ | 🟡 50% |
| **BR2** | La grilla debe permitir búsqueda por CUIT, Razón s... | ✅ | ❌ | 🟡 50% |
| **BR3** | Cada fila debe permitir edición y borrado con conf... | ✅ | ❌ | 🟡 50% |
| **BR4** | La grilla debe permitir la selección de una o vari... | ✅ | ❌ | 🟡 50% |
| **BR5** | Si hay selección, se habilita “Generar Lote” (HU_S... | ❌ | ❌ | 🔴 0% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🟡 MEDIO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | La grilla debe mostrar datos de contribuyentes y sus inconsistencias ingresadas, una fila por CUIT, Razón social y período. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-002 🟠 ALTO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | La grilla debe permitir búsqueda por CUIT, Razón social y Período. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-003 🟠 ALTO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | Cada fila debe permitir edición y borrado con confirmación. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-004 🟡 MEDIO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | La grilla debe permitir la selección de una o varias filas. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-005 🟡 MEDIO

**Falta escenario positivo para BR5**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR5** |
| Texto BR | Si hay selección, se habilita “Generar Lote” (HU_SGINC_06). |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-006 🟡 MEDIO

**Falta escenario negativo para BR5**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR5** |
| Texto BR | Si hay selección, se habilita “Generar Lote” (HU_SGINC_06). |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🟡 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que no existen inconsistencias cargadas en el sistema
CUANDO accedo a la pantalla del módulo
ENTONCES visualizo un mensaje indicando que no hay inconsistencias cargadas y la grilla se muestra vacía
Y no se muestran las acciones de Edición, Borrado y Selección.
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-002: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO la grilla cuenta con el campo de búsqueda
CUANDO ingreso un texto con caracteres especiales en el campo de búsqueda y ejecuto la búsqueda
ENTONCES el sistema muestra un mensaje de error indicando que no se permiten caracteres especiales en la búsqueda
Y la grilla no realiza la búsqueda.
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-003: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO selecciono “Edición” en una fila
CUANDO intento guardar los cambios sin tener permisos de edición
ENTONCES el sistema muestra un mensaje de error indicando que no tengo permisos para editar la información
Y los datos no se modifican.
```

🔒 **Referencia OWASP:** A07:2021


### 🟡 GAP-004: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO la grilla muestra las inconsistencias
CUANDO intento seleccionar una fila cuando no tengo permisos para generar lotes
ENTONCES la fila no se selecciona y se muestra un mensaje indicando que no tengo permisos para generar lotes
Y la opción 'Generar Lote' permanece deshabilitada.
```

🔒 **Referencia OWASP:** A07:2021


### 🟡 GAP-005: Falta escenario positivo para BR5

**BR Afectada:** BR5

```gherkin
DADO seleccioné una o más filas en la grilla
CUANDO verifico la disponibilidad de la opción 'Generar Lote'
ENTONCES la opción 'Generar Lote' se encuentra habilitada y puedo hacer clic en ella
Y al hacer clic, se invoca la HU_SGINC_06.
```

🔒 **Referencia OWASP:** A03:2021


### 🟡 GAP-006: Falta escenario negativo para BR5

**BR Afectada:** BR5

```gherkin
DADO no seleccioné ninguna fila en la grilla
CUANDO verifico la disponibilidad de la opción 'Generar Lote'
ENTONCES la opción 'Generar Lote' se encuentra deshabilitada y no puedo hacer clic en ella
Y se muestra un mensaje indicando que debo seleccionar al menos una fila para generar el lote.
```

🔒 **Referencia OWASP:** A03:2021


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 09:18:58

*Análisis potenciado por Google Gemini AI para precisión semántica.*