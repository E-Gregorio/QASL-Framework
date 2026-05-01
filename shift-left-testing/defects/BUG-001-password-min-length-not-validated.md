# Informe de Defecto · QASL Framework

> Plantilla profesional alineada a **ISTQB CTFL v4.0**, **ISO/IEC/IEEE 29119-3:2021**, **IEEE 1044-2009 (R2017)**, **ISO/IEC 25010:2011** e **ISO/IEC/IEEE 24765:2017**.

---

# BUG-001 · El sistema acepta contraseñas con menos de 6 caracteres y crea la cuenta

| Metadato                  | Valor                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **ID del defecto**        | BUG-001                                                                                                                        |
| **Título**                | El sistema acepta contraseñas con menos de 6 caracteres y crea la cuenta                                                       |
| **Resumen ejecutivo**     | El formulario de registro de `automationexercise.com` no valida la longitud mínima de 6 caracteres declarada en la regla de negocio BR2 (HU_REG_01). Acepta passwords de 1 y 5 caracteres y crea la cuenta exitosamente, lo cual viola el criterio de aceptación E4. |
| **Fecha de detección**    | 2026-05-01                                                                                                                     |
| **Fecha de informe**      | 2026-05-01                                                                                                                     |
| **Reportado por (Autor)** | QA Automation · QASL Framework                                                                                                 |
| **Organización emisora**  | QASL Framework — Shift-Left Testing                                                                                            |
| **Estado inicial**        | New                                                                                                                            |

---

## 1. Contexto del defecto

| Campo                                    | Detalle                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Producto / Sistema bajo prueba (SUT)** | automationexercise.com                                                                           |
| **Componente / Módulo afectado**         | Formulario de registro · Backend `POST /signup` y `POST /api/createAccount`                      |
| **Versión / Build / Commit**             | Producción pública (sin versionado expuesto)                                                     |
| **URL / Endpoint**                       | `https://automationexercise.com/signup` · `https://automationexercise.com/api/createAccount`     |
| **Entorno de ejecución**                 | SO: Windows 11 · Browser: Chromium (Playwright 1.56) · Node 24.x                                 |
| **Datos de prueba**                      | Generados dinámicamente via `DataGenerator.passwordOfLength(N)` con N ∈ {1, 5}                   |
| **Fase de detección (ISTQB)**            | ☒ Sistema (E2E automatizado)                                                                     |
| **Tipo de prueba (origen)**              | ☒ Funcional (Validación de entrada)                                                              |

---

## 2. Pasos para reproducir

**Precondiciones:**

- El usuario no debe estar autenticado.
- Email único no registrado previamente.

**Datos de entrada:**

```json
{
  "name": "Sofia Torres",
  "email": "test_user_<timestamp>@qaslframework.test",
  "password": "Pass1",
  "title": "Mr",
  "day": "15", "month": "6", "year": "1995",
  "firstName": "Test", "lastName": "User",
  "address": "123 QA Automation Street",
  "country": "Canada", "state": "Ontario", "city": "Toronto",
  "zipcode": "A1B2C3", "mobileNumber": "+12345678901"
}
```

**Pasos:**

1. Navegar a `https://automationexercise.com/`.
2. Hacer clic en el enlace **Signup / Login**.
3. En la sección *New User Signup!*, ingresar nombre y email únicos.
4. Hacer clic en **Signup**.
5. En el formulario *Enter Account Information*, ingresar una contraseña de **5 caracteres** (`Pass1`) y completar el resto de los campos obligatorios.
6. Hacer clic en **Create Account**.

**Frecuencia de reproducción:** ☒ Siempre (100%)

---

## 3. Resultados

| Tipo                | Descripción                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Esperado**        | El sistema rechaza la solicitud, muestra un mensaje de error indicando que la contraseña debe tener mínimo 6 caracteres alfanuméricos (BR2) y NO crea la cuenta. |
| **Obtenido (Real)** | El sistema acepta la contraseña de 5 caracteres, redirige a `/account_created`, muestra el mensaje *"Account Created!"* y crea la cuenta en la base de datos. |
| **Diferencia**      | Falta validación de longitud mínima de password tanto en cliente (HTML5 `minlength`) como en servidor (validación de payload).             |

---

## 4. Evidencia adjunta

| Tipo de evidencia                     | Ruta / Identificador                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Captura de pantalla (5 chars)**     | `reports/test-results/HU_REG_01-HU-REG-01-·-Regi-34acd-e-password-con-5-caracteres-chromium/test-failed-1.png`                    |
| **Captura de pantalla (1 char)**      | `reports/test-results/HU_REG_01-HU-REG-01-·-Regi-6c84f--de-password-con-1-carácter-chromium/test-failed-1.png`                    |
| **Captura de pantalla (confirmación)** | `reports/test-results/HU_REG_01-HU-REG-01-·-Regi-516ee-ación-con-password-inválido-chromium/test-failed-1.png`                   |
| **HAR file (tráfico HTTP)**           | `.api-captures/chromium_HU_REG_01_·_Registro_de_Nuevo_Usuario_Validar_rechazo_de_password_con_5_caracteres.har`                   |
| **Reporte Allure (TC fallidos)**      | `reports/e2e/allure-report/index.html` → TC-008, TC-009, TC-015                                                                   |
| **Stack trace (extracto)**            | `expect(locator).toHaveCount(0) failed · Locator: 'b:has-text("Account Created!")' · Expected: 0 · Received: 1`                  |

---

## 5. Clasificación del defecto (IEEE 1044-2009)

| Dimensión IEEE 1044                       | Valor                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Tipo de anomalía** (Anomaly Type)       | ☒ Logic (validación faltante en lógica de negocio)                                          |
| **Source / Origen** (Insertion Activity)  | ☒ Diseño · ☒ Código (regla declarada en HU pero no implementada)                            |
| **Detection Activity**                    | ☒ Test sistema (E2E automatizado con Playwright)                                            |
| **Impacto** (Customer Impact)             | ☒ Significativo (debilita la seguridad de credenciales para todos los usuarios nuevos)      |
| **Repetibilidad**                         | ☒ Repetible                                                                                 |
| **Síntoma** (Symptom)                     | ☒ Operación incorrecta (acepta entrada que debe rechazar)                                   |

---

## 6. Característica de calidad afectada (ISO/IEC 25010:2011)

| Característica de calidad        | Sub-característica afectada                                                | Marcar |
| -------------------------------- | -------------------------------------------------------------------------- | ------ |
| **Functional Suitability**       | Functional Correctness (regla BR2 declarada pero no aplicada)              | ☒      |
| **Security**                     | Confidentiality (passwords débiles facilitan brute-force / credential stuffing) | ☒  |
| **Reliability**                  | Maturity (defecto sistemático en validación de entrada)                    | ☒      |
| **Usability**                    | Error Protection (la UI no impide ingresar datos inválidos)                | ☒      |

---

## 7. Evaluación del riesgo (ISO 31000:2018 + ISTQB v4.0)

| Atributo                                          | Valor                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Severidad** (Impacto técnico)                   | ☒ S2-Crítica (compromete seguridad de credenciales)                                         |
| **Prioridad** (Urgencia de negocio)               | ☒ P2-Alta                                                                                   |
| **Probabilidad de ocurrencia en producción**      | ☒ Alta (>70%) — cualquier registro nuevo puede ser afectado                                 |
| **Riesgo del producto** (Severidad × Probabilidad) | ☒ Alto                                                                                     |
| **Alcance / Usuarios afectados**                  | 100% de los usuarios que se registran en la plataforma                                      |
| **Workaround disponible**                         | ☐ No (depende de validación del lado servidor que no existe)                                |

---

## 8. Información de seguridad

| Campo                                 | Valor                                                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **OWASP Top 10:2021 — Categoría**     | A07:2021 — Identification and Authentication Failures                                                                       |
| **CWE (Common Weakness Enumeration)** | CWE-521: Weak Password Requirements                                                                                         |
| **CVSS v3.1 — Score base**            | 5.3 (Medio)                                                                                                                 |
| **CVSS v3.1 — Vector**                | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`                                                                              |
| **Vector de ataque**                  | ☒ Red (atacante remoto puede explotar passwords débiles vía credential stuffing o brute-force)                              |
| **Datos comprometidos**               | ☒ Credenciales (cuentas de usuario)                                                                                         |

---

## 9. Trazabilidad QASL (Shift-Left)

| Artefacto QASL                             | Identificador                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Épica (EPIC_ID)**                        | EPIC-AUTH-001                                                                                                          |
| **Historia de Usuario (HU_ID)**            | HU_REG_01 — Registro de Nuevo Usuario                                                                                  |
| **Test Suite (TS_ID)**                     | HU_REG_01_TS02 — Validaciones Negativas y Manejo de Errores                                                            |
| **Test Cases afectados (TC_ID)**           | TC-008 (5 chars) · TC-009 (1 char) · TC-015 (ausencia de confirmación con password inválido)                           |
| **Precondiciones (PRC_ID)**                | PRC-001, PRC-004, PRC-005, PRC-006, PRC-007                                                                            |
| **Criterio de aceptación afectado**        | E4 — *"Cuando se ingresa un password con menos de 6 caracteres, el sistema debe rechazar el registro"*                 |
| **Regla de negocio afectada (BR)**         | BR2 — *"La contraseña debe tener mínimo 6 caracteres alfanuméricos"*                                                   |
| **Técnica de prueba aplicada**             | Análisis de Valores Límite (5, 1) · Tabla de Decisión                                                                  |
| **Requisito / Especificación**             | `shift-left-testing/1_User_Storie.csv` → HU_REG_01                                                                     |
| **Build / Release pipeline**               | Local (CI/CD pendiente F10.7)                                                                                          |
| **Issue tracker (GitHub)**                 | (pendiente de crear)                                                                                                   |

---

## 10. Análisis técnico y recomendación

| Campo                                  | Detalle                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hipótesis de causa raíz (RCA)**      | El backend de `/api/createAccount` no implementa la validación de longitud mínima de password. La UI tampoco aplica `minlength="6"` en el `<input type="password">`. La regla BR2 está declarada en la HU pero no fue trasladada al diseño técnico. |
| **Acción correctiva sugerida**         | **(1) Backend:** Agregar validación en el endpoint `POST /api/createAccount` que rechace passwords con `len < 6` retornando HTTP 400 con mensaje descriptivo. **(2) Frontend:** Agregar `minlength="6"` y `pattern="[A-Za-z0-9]{6,}"` al input de password. **(3) Mensaje de error:** Mostrar texto claro: *"La contraseña debe tener mínimo 6 caracteres alfanuméricos"*. |
| **Acción preventiva**                  | **(1)** Agregar checklist en DoR (Definition of Ready) que valide trazabilidad BR → diseño técnico antes de iniciar desarrollo. **(2)** Incluir tests unitarios para validación de longitud mínima en la capa de servicio. **(3)** Sumar política de complejidad de password (mayúsculas, números, símbolos) alineada a NIST SP 800-63B. |
| **Pruebas de regresión sugeridas**     | TC-008, TC-009, TC-010 (vacío), TC-015 + nuevos TCs: `password de 6 chars exactos = válido`, `password de 7 chars = válido`, `password con caracteres especiales`, `password con espacios al inicio/final`. |

---

## 11. Estado y seguimiento (Lifecycle ISTQB)

| Campo                                  | Detalle                                              |
| -------------------------------------- | ---------------------------------------------------- |
| **Estado actual**                      | ☒ New                                                |
| **Asignado a**                         | Pendiente (equipo de desarrollo backend + frontend)  |
| **Fecha asignación**                   | —                                                    |
| **Fecha de fix**                       | —                                                    |
| **Build con el fix**                   | —                                                    |
| **Resultado del re-test**              | ☐ Pendiente                                          |
| **Verificado por**                     | —                                                    |
| **Fecha de cierre**                    | —                                                    |
| **Comentarios de cierre**              | —                                                    |

---

## 12. Historial de cambios del informe

| Fecha        | Versión | Autor                          | Cambio                                                                |
| ------------ | ------- | ------------------------------ | --------------------------------------------------------------------- |
| 2026-05-01   | 1.0     | QA Automation · QASL Framework | Creación inicial · Detectado por TC-008, TC-009, TC-015 en E2E suite. |

---

> **Aprobaciones:**
> QA Lead: `__________` · Tech Lead: `__________` · Product Owner: `__________`
