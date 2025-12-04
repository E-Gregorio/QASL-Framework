# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGPP_02 - Nuevo Perfil |
| **Épica** | Perfiles y Permisos |
| **Fecha** | 2025-11-29 12:34 |
| **Estado** | ❌ **FAILED** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🔴 ROJO |
| **Cobertura** | `[█████░░░░░░░░░░░░░░░]` **28.6%** |
| **Descripción** | BLOQUEADO - Gaps críticos detectados que requieren atención inmediata |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **1** |
| 🟠 ALTO | Importante | **5** |
| 🟡 MEDIO | Moderado | **2** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **8** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 7 | - |
| 📝 Escenarios Necesarios | 14 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 4 | - |
| ✅ Escenarios Positivos | 2 | - |
| ❌ Escenarios Negativos | 1 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 8 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 0 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 5 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 2 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR1 |
| 2 | BR2 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR2 |
| 3 | BR2 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR2 |
| 4 | BR3 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR3 |
| 5 | BR4 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR4 |
| 6 | BR5 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR5 |
| 7 | BR7 | falta_positivo | 🟡 MEDIO | Falta escenario positivo para BR7 |
| 8 | BR7 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR7 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | El nombre del perfil es obligatorio y debe ser úni... | ❌ | ✅ | 🟡 50% |
| **BR2** | El nombre del perfil en SIGMA debe coincidir con e... | ❌ | ❌ | 🔴 0% |
| **BR3** | No se puede guardar un perfil sin al menos un módu... | ✅ | ❌ | 🟡 50% |
| **BR4** | Sólo los usuarios con permiso de 'Crear perfil' pu... | ✅ | ❌ | 🟡 50% |
| **BR5** | Al confirmar el guardado se debe persistir el perf... | ✅ | ❌ | 🟡 50% |
| **BR6** | Si el nombre ya existe se debe impedir el alta y m... | ❌ | ✅ | 🟡 50% |
| **BR7** | La lista de módulos y acciones debe provenir del c... | ❌ | ❌ | 🔴 0% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🟠 ALTO

**Falta escenario positivo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | El nombre del perfil es obligatorio y debe ser único dentro de SIGMA. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-002 🟠 ALTO

**Falta escenario positivo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | El nombre del perfil en SIGMA debe coincidir con el nombre del rol en el Access Manager centralizado para que el rol sea utilizable por los usuarios autenticados. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-003 🟠 ALTO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | El nombre del perfil en SIGMA debe coincidir con el nombre del rol en el Access Manager centralizado para que el rol sea utilizable por los usuarios autenticados. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-004 🟠 ALTO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | No se puede guardar un perfil sin al menos un módulo/acción asociado. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-005 🔴 CRITICO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Sólo los usuarios con permiso de 'Crear perfil' pueden acceder a esta funcionalidad. |
| Razón | falta_negativo |
| OWASP | 🔒 A01:2021 |

### GAP-006 🟠 ALTO

**Falta escenario negativo para BR5**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR5** |
| Texto BR | Al confirmar el guardado se debe persistir el perfil y sus permisos automáticamente. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-007 🟡 MEDIO

**Falta escenario positivo para BR7**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR7** |
| Texto BR | La lista de módulos y acciones debe provenir del catálogo de SIGMA (no editable en esta HU). |
| Razón | falta_positivo |

### GAP-008 🟡 MEDIO

**Falta escenario negativo para BR7**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR7** |
| Texto BR | La lista de módulos y acciones debe provenir del catálogo de SIGMA (no editable en esta HU). |
| Razón | falta_negativo |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🟠 GAP-001: Falta escenario positivo para BR1

**BR Afectada:** BR1

```gherkin
DADO que completé el nombre del perfil con un nombre que no existe en el sistema
CUANDO selecciono 'Guardar'
ENTONCES el sistema guarda el perfil correctamente
Y el perfil se muestra en la lista de perfiles
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-002: Falta escenario positivo para BR2

**BR Afectada:** BR2

```gherkin
DADO que el nombre del perfil en SIGMA coincide con el nombre del rol en Access Manager
CUANDO un usuario intenta autenticarse con ese rol
ENTONCES el usuario se autentica correctamente y puede acceder a las funcionalidades del perfil
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-003: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que el nombre del perfil en SIGMA NO coincide con el nombre del rol en Access Manager
CUANDO un usuario intenta autenticarse con ese rol
ENTONCES el usuario NO se autentica correctamente o no puede acceder a las funcionalidades del perfil
Y el sistema muestra un mensaje de error
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-004: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO que completé el nombre del perfil pero no agregué ningún módulo/acción
CUANDO selecciono 'Guardar'
ENTONCES el sistema muestra un mensaje de error indicando que debe agregar al menos un módulo/acción
Y el sistema no guarda el perfil
```

🔒 **Referencia OWASP:** A03:2021


### 🔴 GAP-005: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO que estoy autenticado como un usuario SIN permiso de 'Crear perfil'
CUANDO intento acceder a la pantalla de creación de perfiles
ENTONCES el sistema muestra un mensaje de error indicando que no tengo permisos para acceder a esta funcionalidad
Y el sistema me redirige a una pantalla donde sí tengo permisos
```

🔒 **Referencia OWASP:** A01:2021


### 🟠 GAP-006: Falta escenario negativo para BR5

**BR Afectada:** BR5

```gherkin
DADO que completé el nombre, descripción y agregué al menos un módulo con al menos una acción
CUANDO confirmo el guardado y la persistencia del perfil falla (por ejemplo, por un error de base de datos)
ENTONCES el sistema muestra un mensaje de error indicando que no se pudo guardar el perfil
Y el sistema no guarda el perfil
```

🔒 **Referencia OWASP:** A03:2021


### 🟡 GAP-007: Falta escenario positivo para BR7

**BR Afectada:** BR7

```gherkin
DADO que accedo a la pantalla de creación de perfiles
CUANDO visualizo la lista de módulos y acciones disponibles
ENTONCES la lista de módulos y acciones coincide con la lista definida en el catálogo de SIGMA
```


### 🟡 GAP-008: Falta escenario negativo para BR7

**BR Afectada:** BR7

```gherkin
DADO que accedo a la pantalla de creación de perfiles
CUANDO intento agregar, modificar o eliminar módulos/acciones de la lista
ENTONCES el sistema no permite realizar estas acciones y muestra un mensaje indicando que la lista no es editable
```


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 12:34:26

*Análisis potenciado por Google Gemini AI para precisión semántica.*
