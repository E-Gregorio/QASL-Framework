# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** |  -  |
| **Épica** |  |
| **Fecha** | 2025-11-29 09:15 |
| **Estado** | ❌ **FAILED** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🔴 ROJO |
| **Cobertura** | `[████████████████████]` **100.0%** |
| **Descripción** | BLOQUEADO - Gaps críticos detectados que requieren atención inmediata |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **1** |
| 🟠 ALTO | Importante | **2** |
| 🟡 MEDIO | Moderado | **1** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **4** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 0 | - |
| 📝 Escenarios Necesarios | 0 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 5 | - |
| ✅ Escenarios Positivos | 0 | - |
| ❌ Escenarios Negativos | 0 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 4 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 0 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 0 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 0 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR1 |
| 2 | BR2 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR2 |
| 3 | BR3 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR3 |
| 4 | BR4 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR4 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|

---

## 📝 DETALLE DE GAPS

### GAP-001 🔴 CRITICO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | Solo usuarios con perfil CARGA pueden acceder a la pantalla del módulo. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-002 🟡 MEDIO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | La pantalla debe mostrar la grilla con las inconsistencias cargadas y las acciones de Edición, Borrado y Selección. |
| Razón | falta_negativo |

### GAP-003 🟠 ALTO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | El sistema debe permitir la búsqueda de inconsistencias por CUIT, Razón social y Período. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-004 🟠 ALTO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | El sistema debe permitir la edición y borrado de inconsistencias. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🔴 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que ingreso con un usuario SIN perfil CARGA
CUANDO accedo a la pantalla del módulo
ENTONCES el sistema muestra un mensaje de error indicando que no tengo permisos para acceder a esta sección.
Y El sistema me redirige a la pantalla de inicio.
```

🔒 **Referencia OWASP:** A07:2021


### 🟡 GAP-002: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que ingreso con un usuario con perfil CARGA y no existen inconsistencias cargadas
CUANDO accedo a la pantalla del módulo
ENTONCES visualizo la grilla vacía con un mensaje indicando 'No se encontraron inconsistencias'.
```


### 🟠 GAP-003: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO la grilla cuenta con el campo de búsqueda
CUANDO ingreso un texto inválido (ej: caracteres especiales) y ejecuto la búsqueda
ENTONCES el sistema muestra un mensaje de error indicando 'El texto ingresado no es válido. Por favor, ingrese un CUIT, Razón Social o Período válido.'
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-004: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO selecciono “Edición” en una fila
CUANDO completo los datos obligatorios y la conexión a la base de datos falla al intentar guardar los cambios
ENTONCES el sistema muestra un mensaje de error indicando 'No se pudo guardar los cambios. Por favor, intente nuevamente más tarde.'
```

🔒 **Referencia OWASP:** A03:2021


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 09:15:27

*Análisis potenciado por Google Gemini AI para precisión semántica.*
