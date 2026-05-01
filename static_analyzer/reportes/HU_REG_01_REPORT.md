# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **HU Analizada** | HU_REG_01 - Registro de Nuevo Usuario |
| **Épica** | Módulo de Onboarding |
| **Fecha** | 2026-04-30 22:14 |
| **Estado** | ⚠️ **WARNING** |
| **Analizador** | Static Analyzer (QASL Framework) |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🟡 AMARILLO |
| **Cobertura** | `[█████░░░░░░░░░░░░░░░]` **25.0%** |
| **Descripción** | ADVERTENCIA - Gaps altos detectados o cobertura insuficiente |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **0** |
| 🟠 ALTO | Importante | **3** |
| 🟡 MEDIO | Moderado | **2** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **5** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 4 | - |
| 📝 Escenarios Necesarios | 8 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 2 | - |
| ✅ Escenarios Positivos | 1 | - |
| ❌ Escenarios Negativos | 0 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 5 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 0 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 3 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 1 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR1 |
| 2 | BR2 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR2 |
| 3 | BR3 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR3 |
| 4 | BR4 | falta_positivo | 🟡 MEDIO | Falta escenario positivo para BR4 |
| 5 | BR4 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR4 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | El email del usuario debe ser único en el sistema.... | ✅ | ❌ | 🟡 50% |
| **BR2** | El password debe tener un mínimo de 6 caracteres a... | ✅ | ❌ | 🟡 50% |
| **BR3** | Los campos email, nombre y password son obligatori... | ✅ | ❌ | 🟡 50% |
| **BR4** | Tras un registro exitoso debe mostrarse un mensaje... | ❌ | ❌ | 🔴 0% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🟠 ALTO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | El email del usuario debe ser único en el sistema. No se permiten registros duplicados con el mismo email. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-002 🟠 ALTO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | El password debe tener un mínimo de 6 caracteres alfanuméricos. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-003 🟠 ALTO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | Los campos email, nombre y password son obligatorios para completar el registro. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-004 🟡 MEDIO

**Falta escenario positivo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Tras un registro exitoso debe mostrarse un mensaje de confirmación visible para el usuario. |
| Razón | falta_positivo |

### GAP-005 🟡 MEDIO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Tras un registro exitoso debe mostrarse un mensaje de confirmación visible para el usuario. |
| Razón | falta_negativo |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🟠 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que estoy en el formulario de registro y ya existe un usuario registrado con el email 'usuario@ejemplo.com'
CUANDO intento registrarme ingresando el mismo email 'usuario@ejemplo.com', un nombre y una contraseña válidos
ENTONCES el sistema muestra un mensaje de error indicando que el email ya está registrado
Y el sistema no crea una cuenta duplicada y mantiene el formulario visible para corregir el email
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-002: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que estoy en el formulario de registro
CUANDO ingreso un email válido, un nombre válido y una contraseña con menos de 6 caracteres (ejemplo: '12abc') y envío el formulario
ENTONCES el sistema muestra un mensaje de error indicando que la contraseña debe tener mínimo 6 caracteres alfanuméricos
Y el sistema no crea la cuenta y mantiene el formulario visible para corregir la contraseña
```

🔒 **Referencia OWASP:** A07:2021


### 🟠 GAP-003: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO que estoy en el formulario de registro
CUANDO dejo uno o más campos obligatorios (email, nombre o password) vacíos e intento enviar el formulario
ENTONCES el sistema muestra mensajes de error indicando qué campos obligatorios faltan por completar
Y el sistema no crea la cuenta y mantiene el formulario visible con los campos marcados como requeridos
```

🔒 **Referencia OWASP:** A03:2021


### 🟡 GAP-004: Falta escenario positivo para BR4

**BR Afectada:** BR4

```gherkin
DADO que estoy en el formulario de registro
CUANDO ingreso un email único, un nombre y una contraseña válidos y envío el formulario
ENTONCES el sistema muestra un mensaje de confirmación visible indicando que el registro fue exitoso
Y el mensaje de confirmación contiene información clara sobre el éxito de la operación
```


### 🟡 GAP-005: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO que estoy en el formulario de registro
CUANDO ingreso datos inválidos (email duplicado o contraseña menor a 6 caracteres) y envío el formulario
ENTONCES el sistema NO muestra el mensaje de confirmación de registro exitoso
Y el sistema muestra mensajes de error específicos en lugar del mensaje de confirmación
```


---

## 📚 REFERENCIAS

- ISO/IEC/IEEE 29119-3:2021 — Test Documentation
- ISO/IEC/IEEE 29148:2018 — Requirements Engineering
- ISTQB CTFL v4.0 (2023) — Certified Tester Foundation Level
- OWASP Top 10:2021 — Web Application Security Risks
- IEEE 1028-2008 — Software Reviews and Audits

---

🤖 **Static Analyzer (QASL Framework)** | 2026-04-30 22:14:08

*Análisis potenciado por Anthropic Claude AI para precisión semántica.*
