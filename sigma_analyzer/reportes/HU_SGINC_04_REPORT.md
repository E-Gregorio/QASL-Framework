# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGINC_04 - Importar Lote |
| **Épica** | Módulo Alta de Inconsistencias |
| **Fecha** | 2025-11-29 09:22 |
| **Estado** | ❌ **FAILED** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🔴 ROJO |
| **Cobertura** | `[████████░░░░░░░░░░░░]` **41.7%** |
| **Descripción** | BLOQUEADO - Gaps críticos detectados que requieren atención inmediata |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **1** |
| 🟠 ALTO | Importante | **3** |
| 🟡 MEDIO | Moderado | **1** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **5** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 6 | - |
| 📝 Escenarios Necesarios | 12 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 5 | - |
| ✅ Escenarios Positivos | 3 | - |
| ❌ Escenarios Negativos | 2 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 5 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 1 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 5 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 0 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR1 |
| 2 | BR2 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR2 |
| 3 | BR3 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR3 |
| 4 | BR4 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR4 |
| 5 | BR5 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR5 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | La acción “Importar Lote” se muestra desde la pant... | ✅ | ❌ | 🟡 50% |
| **BR2** | El usuario debe poder seleccionar un archivo desde... | ✅ | ❌ | 🟡 50% |
| **BR3** | Si el proceso de importación del archivo es exitos... | ✅ | ❌ | 🟡 50% |
| **BR4** | Si los datos obligatorios de una fila no están com... | ❌ | ✅ | 🟡 50% |
| **BR5** | Si los datos están completos, se agregan a las ent... | ✅ | ❌ | 🟡 50% |
| **BR6** | El proceso puede ser exitoso o erróneo y en ambos ... | ✅ | ✅ | ✅ 100% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🔴 CRITICO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | La acción “Importar Lote” se muestra desde la pantalla de grilla de inconsistencias. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-002 🟠 ALTO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | El usuario debe poder seleccionar un archivo desde su equipo con los datos que se detallan en la referencia al modelo de datos y el ejemplo de archivo de importación. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-003 🟡 MEDIO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | Si el proceso de importación del archivo es exitoso los registros importados se visualizarán en una grilla pop up, para validar los datos. |
| Razón | falta_negativo |

### GAP-004 🟠 ALTO

**Falta escenario positivo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Si los datos obligatorios de una fila no están completos, la grilla pop up de importación permanece y se muestra el mensaje “Faltan los datos obligatorios” marcando los datos faltantes. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-005 🟠 ALTO

**Falta escenario negativo para BR5**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR5** |
| Texto BR | Si los datos están completos, se agregan a las entidades correspondientes El CUIT y Razón social del contribuyente, que se van a agregar si no existe en la entidad contribuyente se agrega con el estado “Ingresado”, si ya existe se agrega con el estado “Actualizado”. El Código de Actividad para el CUIT, en caso de no existir para el contribuyente se agrega como un nuevo código y se relaciona con la entidad Actividades Comerciales para extraer su descripción. Para el tipo de tributo por cada CUIT se agrega un registro para el período importado, si el Anticipo, TRX y Régimen ya existen se debe rechazar la importación por duplicación. el resto de los datos según el [detalle](https://docs.google.com/document/d/1Eqk-gB_Yvlj6lmB12hw-vaH6WCW0oV2Hl03d876WC5I/edit?tab=t.0#heading=h.8ktz6f6neek2), para el CUIT y el Tributo, en la entidad Inconsistencia, con Estado \= “Ingresada” y Origen \= “PAF” |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🔴 GAP-001: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que accedo al sistema con un usuario SIN el perfil CARGA
CUANDO estoy en la pantalla de la grilla de inconsistencias
ENTONCES NO visualizo la opción “Importar Lote”
Y la opción “Importar Lote” no está disponible
```

🔒 **Referencia OWASP:** A07:2021


### 🟠 GAP-002: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que selecciono la funcionalidad “Importar Lote”
CUANDO elijo un archivo con un formato NO válido
ENTONCES el sistema muestra un mensaje de error indicando que el formato del archivo es incorrecto
Y el sistema no carga los registros
```

🔒 **Referencia OWASP:** A03:2021


### 🟡 GAP-003: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO que selecciono la funcionalidad “Importar Lote”
CUANDO el proceso de importación falla
ENTONCES NO se visualiza la grilla pop up con los registros
Y se muestra un mensaje de error indicando la falla
```


### 🟠 GAP-004: Falta escenario positivo para BR4

**BR Afectada:** BR4

```gherkin
DADO que todas las filas tienen los datos obligatorios completos
CUANDO presiono “Guardar”
ENTONCES NO se muestra el mensaje “Faltan los datos obligatorios”
Y el sistema procede a guardar los datos
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-005: Falta escenario negativo para BR5

**BR Afectada:** BR5

```gherkin
DADO que el archivo contiene datos duplicados de Anticipo, TRX y Régimen para un CUIT y período
CUANDO presiono “Guardar”
ENTONCES el sistema muestra un mensaje de error indicando que existen datos duplicados y la importación se rechaza
Y no se guardan los registros duplicados
```

🔒 **Referencia OWASP:** A03:2021


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 09:22:50

*Análisis potenciado por Google Gemini AI para precisión semántica.*
