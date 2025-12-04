# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | HU_SGPP_01 - Gestión de Perfiles y Permisos |
| **Épica** | Perfiles y Permisos |
| **Fecha** | 2025-11-29 12:30 |
| **Estado** | ❌ **FAILED** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---

## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | 🔴 ROJO |
| **Cobertura** | `[██░░░░░░░░░░░░░░░░░░]` **14.3%** |
| **Descripción** | BLOQUEADO - Gaps críticos detectados que requieren atención inmediata |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **8** |
| 🟠 ALTO | Importante | **9** |
| 🟡 MEDIO | Moderado | **6** |
| 🟢 BAJO | Menor | **0** |
| **TOTAL** | | **23** |

---

## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | 14 | - |
| 📝 Escenarios Necesarios | 28 | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | 4 | - |
| ✅ Escenarios Positivos | 4 | - |
| ❌ Escenarios Negativos | 0 | - |
| ⚠️ Gaps (Escenarios Faltantes) | 23 | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | 0 | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | 5 | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | 9 | Sin escenarios |

---

## 🔍 BRECHAS IDENTIFICADAS

| # | BR | Tipo | Severidad | Descripción |
|---|-----|------|-----------|-------------|
| 1 | BR1 | falta_positivo | 🔴 CRITICO | Falta escenario positivo para BR1 |
| 2 | BR1 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR1 |
| 3 | BR2 | falta_positivo | 🔴 CRITICO | Falta escenario positivo para BR2 |
| 4 | BR2 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR2 |
| 5 | BR3 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR3 |
| 6 | BR4 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR4 |
| 7 | BR4 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR4 |
| 8 | BR5 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR5 |
| 9 | BR5 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR5 |
| 10 | BR6 | falta_positivo | 🔴 CRITICO | Falta escenario positivo para BR6 |
| 11 | BR6 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR6 |
| 12 | BR7 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR7 |
| 13 | BR7 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR7 |
| 14 | BR8 | falta_positivo | 🟡 MEDIO | Falta escenario positivo para BR8 |
| 15 | BR8 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR8 |
| 16 | BR9 | falta_positivo | 🟠 ALTO | Falta escenario positivo para BR9 |
| 17 | BR9 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR9 |
| 18 | BR10 | falta_negativo | 🔴 CRITICO | Falta escenario negativo para BR10 |
| 19 | BR11 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR11 |
| 20 | BR12 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR12 |
| 21 | BR13 | falta_negativo | 🟠 ALTO | Falta escenario negativo para BR13 |
| 22 | BR14 | falta_positivo | 🟡 MEDIO | Falta escenario positivo para BR14 |
| 23 | BR14 | falta_negativo | 🟡 MEDIO | Falta escenario negativo para BR14 |

---

## 📋 MATRIZ DE COBERTURA POR BR

| BR | Descripción | Positivo | Negativo | Cobertura |
|-----|-------------|:--------:|:--------:|-----------|
| **BR1** | La autenticación de usuarios y el alta lógica de l... | ❌ | ❌ | 🔴 0% |
| **BR2** | La gestión de usuarios y de sus credenciales es re... | ❌ | ❌ | 🔴 0% |
| **BR3** | Para poder acceder a SIGMA, el usuario debe estar ... | ✅ | ❌ | 🟡 50% |
| **BR4** | Desde SIGMA, se debe realizar el alta de los roles... | ❌ | ❌ | 🔴 0% |
| **BR5** | En SIGMA tienen que registrarse los roles de usuar... | ❌ | ❌ | 🔴 0% |
| **BR6** | A cada usuario que requiera acceder al SIGMA se le... | ❌ | ❌ | 🔴 0% |
| **BR7** | Una vez que el usuario accede por primera vez al S... | ❌ | ❌ | 🔴 0% |
| **BR8** | Desde el SIGMA se podrá consultar el listado de us... | ❌ | ❌ | 🔴 0% |
| **BR9** | El usuario tendrá su rol asignado en Keycloak y lo... | ❌ | ❌ | 🔴 0% |
| **BR10** | Sólo los usuarios con permiso de administración de... | ✅ | ❌ | 🟡 50% |
| **BR11** | El listado de perfiles debe mostrar todos los perf... | ✅ | ❌ | 🟡 50% |
| **BR12** | La búsqueda debe filtrar por nombre y descripción ... | ✅ | ❌ | 🟡 50% |
| **BR13** | Las acciones ‘Nuevo Perfil’, 'Ver detalle', 'Edita... | ✅ | ❌ | 🟡 50% |
| **BR14** | Si SIGMA recibe un perfil desde el AM que no exist... | ❌ | ❌ | 🔴 0% |

---

## 📝 DETALLE DE GAPS

### GAP-001 🔴 CRITICO

**Falta escenario positivo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | La autenticación de usuarios y el alta lógica de los roles base se realiza en el Access Manager centralizado (Keycloak); SIGMA sólo permite gestionarlos si el nombre coincide con el rol existente en el AM. |
| Razón | falta_positivo |
| OWASP | 🔒 A07:2021 |

### GAP-002 🔴 CRITICO

**Falta escenario negativo para BR1**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR1** |
| Texto BR | La autenticación de usuarios y el alta lógica de los roles base se realiza en el Access Manager centralizado (Keycloak); SIGMA sólo permite gestionarlos si el nombre coincide con el rol existente en el AM. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-003 🔴 CRITICO

**Falta escenario positivo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | La gestión de usuarios y de sus credenciales es realizada a través de Keycloak. |
| Razón | falta_positivo |
| OWASP | 🔒 A07:2021 |

### GAP-004 🔴 CRITICO

**Falta escenario negativo para BR2**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR2** |
| Texto BR | La gestión de usuarios y de sus credenciales es realizada a través de Keycloak. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-005 🔴 CRITICO

**Falta escenario negativo para BR3**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR3** |
| Texto BR | Para poder acceder a SIGMA, el usuario debe estar previamente registrado en Keycloak. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-006 🟠 ALTO

**Falta escenario positivo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Desde SIGMA, se debe realizar el alta de los roles de usuario ya existentes en Keycloak y la asignación de sus respectivos permisos. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-007 🟠 ALTO

**Falta escenario negativo para BR4**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR4** |
| Texto BR | Desde SIGMA, se debe realizar el alta de los roles de usuario ya existentes en Keycloak y la asignación de sus respectivos permisos. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-008 🟠 ALTO

**Falta escenario positivo para BR5**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR5** |
| Texto BR | En SIGMA tienen que registrarse los roles de usuario con los mismos nombres con los que se registraron en Keycloak. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-009 🟠 ALTO

**Falta escenario negativo para BR5**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR5** |
| Texto BR | En SIGMA tienen que registrarse los roles de usuario con los mismos nombres con los que se registraron en Keycloak. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-010 🔴 CRITICO

**Falta escenario positivo para BR6**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR6** |
| Texto BR | A cada usuario que requiera acceder al SIGMA se le deben asignar los roles correspondientes en Keycloak. |
| Razón | falta_positivo |
| OWASP | 🔒 A07:2021 |

### GAP-011 🔴 CRITICO

**Falta escenario negativo para BR6**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR6** |
| Texto BR | A cada usuario que requiera acceder al SIGMA se le deben asignar los roles correspondientes en Keycloak. |
| Razón | falta_negativo |
| OWASP | 🔒 A07:2021 |

### GAP-012 🟠 ALTO

**Falta escenario positivo para BR7**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR7** |
| Texto BR | Una vez que el usuario accede por primera vez al SIGMA, queda registrado en el sistema. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-013 🟠 ALTO

**Falta escenario negativo para BR7**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR7** |
| Texto BR | Una vez que el usuario accede por primera vez al SIGMA, queda registrado en el sistema. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-014 🟡 MEDIO

**Falta escenario positivo para BR8**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR8** |
| Texto BR | Desde el SIGMA se podrá consultar el listado de usuarios con acceso, junto con los roles asignados. |
| Razón | falta_positivo |

### GAP-015 🟡 MEDIO

**Falta escenario negativo para BR8**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR8** |
| Texto BR | Desde el SIGMA se podrá consultar el listado de usuarios con acceso, junto con los roles asignados. |
| Razón | falta_negativo |

### GAP-016 🟠 ALTO

**Falta escenario positivo para BR9**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR9** |
| Texto BR | El usuario tendrá su rol asignado en Keycloak y los accesos que se le asignaron a ese rol en SIGMA. |
| Razón | falta_positivo |
| OWASP | 🔒 A03:2021 |

### GAP-017 🟠 ALTO

**Falta escenario negativo para BR9**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR9** |
| Texto BR | El usuario tendrá su rol asignado en Keycloak y los accesos que se le asignaron a ese rol en SIGMA. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-018 🔴 CRITICO

**Falta escenario negativo para BR10**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR10** |
| Texto BR | Sólo los usuarios con permiso de administración de seguridad pueden acceder a esta pantalla. |
| Razón | falta_negativo |
| OWASP | 🔒 A01:2021 |

### GAP-019 🟡 MEDIO

**Falta escenario negativo para BR11**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR11** |
| Texto BR | El listado de perfiles debe mostrar todos los perfiles activos de SIGMA, aunque el rol haya sido deshabilitado en el AM, para fines de trazabilidad. |
| Razón | falta_negativo |

### GAP-020 🟡 MEDIO

**Falta escenario negativo para BR12**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR12** |
| Texto BR | La búsqueda debe filtrar por nombre y descripción del perfil. |
| Razón | falta_negativo |

### GAP-021 🟠 ALTO

**Falta escenario negativo para BR13**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR13** |
| Texto BR | Las acciones ‘Nuevo Perfil’, 'Ver detalle', 'Editar' y Deshabilitar deben mostrarse según los permisos asignados al usuario autenticado. |
| Razón | falta_negativo |
| OWASP | 🔒 A03:2021 |

### GAP-022 🟡 MEDIO

**Falta escenario positivo para BR14**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR14** |
| Texto BR | Si SIGMA recibe un perfil desde el AM que no existe en SIGMA, se debe mostrar un mensaje que el perfil no existe, hasta que se cree completamente en SIGMA. |
| Razón | falta_positivo |

### GAP-023 🟡 MEDIO

**Falta escenario negativo para BR14**

| Campo | Valor |
|-------|-------|
| BR Afectada | **BR14** |
| Texto BR | Si SIGMA recibe un perfil desde el AM que no existe en SIGMA, se debe mostrar un mensaje que el perfil no existe, hasta que se cree completamente en SIGMA. |
| Razón | falta_negativo |

---

## 💡 ESCENARIOS SUGERIDOS

Los siguientes escenarios se sugieren para cerrar las brechas identificadas:

### 🔴 GAP-001: Falta escenario positivo para BR1

**BR Afectada:** BR1

```gherkin
DADO que un usuario con un rol existente en Keycloak intenta acceder a SIGMA
CUANDO el usuario se autentica correctamente en Keycloak
ENTONCES SIGMA permite el acceso al usuario y gestiona los roles basándose en la coincidencia de nombres con Keycloak
```

🔒 **Referencia OWASP:** A07:2021


### 🔴 GAP-002: Falta escenario negativo para BR1

**BR Afectada:** BR1

```gherkin
DADO que un usuario con un rol NO existente en Keycloak intenta acceder a SIGMA
CUANDO el usuario intenta autenticarse
ENTONCES SIGMA rechaza el acceso al usuario y muestra un mensaje de error indicando que el rol no es válido
```

🔒 **Referencia OWASP:** A07:2021


### 🔴 GAP-003: Falta escenario positivo para BR2

**BR Afectada:** BR2

```gherkin
DADO que un usuario intenta modificar sus credenciales en SIGMA
CUANDO el usuario intenta cambiar su contraseña
ENTONCES SIGMA redirige al usuario a Keycloak para la gestión de credenciales
```

🔒 **Referencia OWASP:** A07:2021


### 🔴 GAP-004: Falta escenario negativo para BR2

**BR Afectada:** BR2

```gherkin
DADO que un usuario intenta crear un nuevo usuario directamente en SIGMA
CUANDO el usuario intenta guardar la información del nuevo usuario
ENTONCES SIGMA muestra un mensaje de error indicando que la gestión de usuarios se realiza a través de Keycloak
```

🔒 **Referencia OWASP:** A07:2021


### 🔴 GAP-005: Falta escenario negativo para BR3

**BR Afectada:** BR3

```gherkin
DADO que un usuario NO registrado en Keycloak intenta acceder a SIGMA
CUANDO el usuario intenta autenticarse
ENTONCES SIGMA rechaza el acceso al usuario y muestra un mensaje de error indicando que debe registrarse en Keycloak
```

🔒 **Referencia OWASP:** A07:2021


### 🟠 GAP-006: Falta escenario positivo para BR4

**BR Afectada:** BR4

```gherkin
DADO que un usuario con permisos de administración accede a la pantalla de gestión de roles
CUANDO el usuario crea un nuevo rol y le asigna permisos
ENTONCES SIGMA guarda el nuevo rol y sus permisos correctamente
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-007: Falta escenario negativo para BR4

**BR Afectada:** BR4

```gherkin
DADO que un usuario con permisos de administración intenta crear un rol con un nombre ya existente en Keycloak
CUANDO el usuario intenta guardar el nuevo rol
ENTONCES SIGMA muestra un mensaje de error indicando que el nombre del rol ya existe
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-008: Falta escenario positivo para BR5

**BR Afectada:** BR5

```gherkin
DADO que un usuario con permisos de administración crea un nuevo rol en SIGMA
CUANDO el usuario ingresa el nombre del rol que coincide con un rol existente en Keycloak
ENTONCES SIGMA permite la creación del rol
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-009: Falta escenario negativo para BR5

**BR Afectada:** BR5

```gherkin
DADO que un usuario con permisos de administración crea un nuevo rol en SIGMA
CUANDO el usuario ingresa un nombre de rol que NO coincide con un rol existente en Keycloak
ENTONCES SIGMA muestra un mensaje de error indicando que el nombre del rol debe coincidir con un rol de Keycloak
```

🔒 **Referencia OWASP:** A03:2021


### 🔴 GAP-010: Falta escenario positivo para BR6

**BR Afectada:** BR6

```gherkin
DADO que un usuario tiene asignado un rol en Keycloak
CUANDO el usuario intenta acceder a SIGMA
ENTONCES SIGMA permite el acceso al usuario basándose en los roles asignados en Keycloak
```

🔒 **Referencia OWASP:** A07:2021


### 🔴 GAP-011: Falta escenario negativo para BR6

**BR Afectada:** BR6

```gherkin
DADO que un usuario NO tiene asignado ningún rol en Keycloak
CUANDO el usuario intenta acceder a SIGMA
ENTONCES SIGMA rechaza el acceso al usuario y muestra un mensaje de error indicando que debe tener roles asignados en Keycloak
```

🔒 **Referencia OWASP:** A07:2021


### 🟠 GAP-012: Falta escenario positivo para BR7

**BR Afectada:** BR7

```gherkin
DADO que un usuario accede por primera vez a SIGMA
CUANDO el usuario se autentica correctamente
ENTONCES SIGMA registra al usuario en el sistema
Y se puede verificar en la base de datos que el usuario fue creado
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-013: Falta escenario negativo para BR7

**BR Afectada:** BR7

```gherkin
DADO que un usuario con permisos de administración intenta registrar un nuevo usuario manualmente en SIGMA
CUANDO el usuario intenta guardar la información del nuevo usuario
ENTONCES SIGMA muestra un mensaje de error indicando que el registro se realiza automáticamente al primer acceso
```

🔒 **Referencia OWASP:** A03:2021


### 🟡 GAP-014: Falta escenario positivo para BR8

**BR Afectada:** BR8

```gherkin
DADO que un usuario con permisos de administración accede a la pantalla de gestión de usuarios
CUANDO el usuario visualiza el listado de usuarios
ENTONCES SIGMA muestra el listado de usuarios con sus roles asignados
```


### 🟡 GAP-015: Falta escenario negativo para BR8

**BR Afectada:** BR8

```gherkin
DADO que no hay usuarios registrados en SIGMA
CUANDO un usuario con permisos de administración accede a la pantalla de gestión de usuarios
ENTONCES SIGMA muestra un mensaje indicando que no hay usuarios registrados
```


### 🟠 GAP-016: Falta escenario positivo para BR9

**BR Afectada:** BR9

```gherkin
DADO que un usuario tiene un rol asignado en Keycloak y ese rol tiene permisos asignados en SIGMA
CUANDO el usuario accede a una funcionalidad en SIGMA
ENTONCES SIGMA permite el acceso a la funcionalidad basándose en los permisos asignados al rol en SIGMA
```

🔒 **Referencia OWASP:** A03:2021


### 🟠 GAP-017: Falta escenario negativo para BR9

**BR Afectada:** BR9

```gherkin
DADO que un usuario tiene un rol asignado en Keycloak pero ese rol NO tiene permisos asignados en SIGMA para una funcionalidad específica
CUANDO el usuario intenta acceder a esa funcionalidad en SIGMA
ENTONCES SIGMA rechaza el acceso a la funcionalidad y muestra un mensaje de error indicando que no tiene permisos
```

🔒 **Referencia OWASP:** A03:2021


### 🔴 GAP-018: Falta escenario negativo para BR10

**BR Afectada:** BR10

```gherkin
DADO que me autentique en SIGMA con un usuario SIN permisos de administración de seguridad
CUANDO intento ingresar al módulo 'Gestión de perfiles y permisos'
ENTONCES el sistema muestra un mensaje de error indicando que no tengo permisos para acceder
Y el sistema no permite el acceso al módulo
```

🔒 **Referencia OWASP:** A01:2021


### 🟡 GAP-019: Falta escenario negativo para BR11

**BR Afectada:** BR11

```gherkin
DADO que me autentique en SIGMA con un usuario con permisos de administración
CUANDO ingreso al módulo 'Gestión de perfiles y permisos'
ENTONCES el sistema muestra la grilla con todos los perfiles, incluyendo aquellos que están deshabilitados en el AM
Y se indica de alguna forma que el perfil está deshabilitado en el AM
```


### 🟡 GAP-020: Falta escenario negativo para BR12

**BR Afectada:** BR12

```gherkin
DADO que me encuentro en la grilla de perfiles
CUANDO ingreso un texto en el campo de búsqueda que no coincide con ningún nombre o descripción de perfil
ENTONCES el sistema muestra el mensaje 'No se encontraron resultados de búsqueda'
Y la grilla está vacía
```


### 🟠 GAP-021: Falta escenario negativo para BR13

**BR Afectada:** BR13

```gherkin
DADO que me autentique en SIGMA con un usuario SIN permisos para 'Nuevo Perfil'
CUANDO ingreso al módulo 'Gestión de perfiles y permisos'
ENTONCES la acción 'Nuevo Perfil' no se muestra en la grilla
Y las demás acciones se muestran según los permisos del usuario
```

🔒 **Referencia OWASP:** A03:2021


### 🟡 GAP-022: Falta escenario positivo para BR14

**BR Afectada:** BR14

```gherkin
DADO que SIGMA recibe un perfil desde el AM que no existe en SIGMA
CUANDO se intenta visualizar el listado de perfiles
ENTONCES el sistema muestra un mensaje indicando que el perfil no existe en SIGMA y debe ser creado
Y el perfil no se muestra en la grilla hasta que se cree completamente
```


### 🟡 GAP-023: Falta escenario negativo para BR14

**BR Afectada:** BR14

```gherkin
DADO que SIGMA recibe un perfil desde el AM que no existe en SIGMA
CUANDO se intenta acceder a la pantalla de detalle de ese perfil
ENTONCES el sistema muestra un mensaje indicando que el perfil no existe en SIGMA y no se puede acceder a la pantalla de detalle
```


---

## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | 2025-11-29 12:30:15

*Análisis potenciado por Google Gemini AI para precisión semántica.*
