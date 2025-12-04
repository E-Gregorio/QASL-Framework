# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGINC_02 - Alta de Inconsistencias |
| **Épica** | Módulo Alta de Inconsistencias |
| **Fecha** | 2025-11-29 09:07 |
| **Estado** | ❌ **FAILED** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🔴 ROJO |
| **Cobertura** | `[███████░░░░░░░░░░░░░]` **37.5%** |
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
| 📋 Reglas de Negocio (BRs) | 4 | - |
| 📝 Escenarios Necesarios | 8 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 3 | - |
| ✅ Escenarios Positivos | 1 | - |
| ❌ Escenarios Negativos | 1 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 4 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 1 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 2 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 1 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR1 |
| 2 | BR3 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR3 |
| 3 | BR4 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR4 |
| 4 | BR4 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR4 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | Solo los usuarios con perfil CARGA del módulo Alta... | ✅ | ❌ | 🟡 50% |
| **BR2** | La pantalla principal debe mostrar la grilla de in... | ✅ | ✅ | ✅ 100% |
| **BR3** | La pantalla principal debe exponer las funcionalid... | ✅ | ❌ | 🟡 50% |
| **BR4** | Todo ingreso (masivo o individual) se incorpora a ... | ❌ | ❌ | 🔴 0% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🔴 CRITICO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | Solo los usuarios con perfil CARGA del módulo Alta de Inconsistencias pueden acceder a la pantalla principal. |
| Razón | falta_negativo |
| OWASP | 🔒 A01:2021 |

### GAP-002 🟡 MEDIO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | La pantalla principal debe exponer las funcionalidades “Importar Lote” (HU\_SGINC\_04) y “Carga Individual” (HU\_SGINC\_05). |
| Razón | falta_negativo |

### GAP-003 🟠 ALTO

**Falta escenario positivo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Todo ingreso (masivo o individual) se incorpora a las entidades correspondientes. |
| Razón | falta_positivo |
| OWASP | 🔒 A03 |

### GAP-004 🟠 ALTO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Todo ingreso (masivo o individual) se incorpora a las entidades correspondientes. |
| Razón | falta_negativo |
| OWASP | 🔒 A03 |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🔴 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que accedo al sistema con un usuario SIN los permisos del perfil CARGA del Módulo Alta de Inconsistencias
CUANDO intento ingresar a la opción “Alta de Inconsistencias”
ENTONCES el sistema muestra un mensaje de error indicando que no tiene permisos
Y el sistema no permite el acceso a la pantalla principal
```

🔒 **Referencia OWASP:** A01:2021


### 🟡 GAP-002: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO que accedo al sistema con un usuario con perfil CARGA pero con una configuración que deshabilita las funcionalidades de Importar Lote y Carga Individual
CUANDO ingreso a la opción “Alta de Inconsistencias”
ENTONCES el sistema muestra la pantalla con la grilla de inconsistencias
Y las funcionalidades “Importar Lote” y “Carga Individual” NO se muestran
```


### 🟠 GAP-003: Falta escenario positivo para BR4

**BR Afectada:** BR4

```gherkin
DADO que ingreso una inconsistencia individualmente
CUANDO guardo la inconsistencia
ENTONCES la inconsistencia se guarda correctamente en la base de datos
Y la inconsistencia se muestra en la grilla de inconsistencias
```

🔒 **Referencia OWASP:** A03


### 🟠 GAP-004: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO que intento ingresar una inconsistencia individualmente con datos inválidos
CUANDO guardo la inconsistencia
ENTONCES el sistema muestra un mensaje de error indicando que los datos son inválidos
Y la inconsistencia NO se guarda en la base de datos
```

🔒 **Referencia OWASP:** A03


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 09:07:11

*Análisis potenciado por Google Gemini AI para precisión semántica.*
