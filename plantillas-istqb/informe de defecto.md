# Informe de Defecto · QASL Framework

> **Plantilla profesional alineada a estándares internacionales vigentes para gestión de defectos en pruebas de software.**

---

## Marco normativo de referencia

| Norma / Marco                                | Aplicación en este informe                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **ISTQB CTFL v4.0** (Capítulo 5.5)           | Proceso de gestión de defectos: detección, registro, clasificación, análisis, comunicación y cierre.  |
| **ISO/IEC/IEEE 29119-3:2021**                | *Test Documentation* — Plantilla de **Incident / Defect Report** (sustituye IEEE 829-2008).           |
| **IEEE 1044-2009 (R2017)**                   | *Standard Classification for Software Anomalies* — Taxonomía de clasificación (Type, Source, Impact). |
| **ISO/IEC 25010:2011**                       | *SQuaRE — Product Quality Model* — Característica de calidad afectada por el defecto.                 |
| **ISO/IEC/IEEE 24765:2017**                  | *Systems and Software Engineering — Vocabulary* — Terminología normalizada (defect, failure, fault).  |
| **OWASP Top 10:2021 / CWE**                  | Solo para defectos de **Seguridad**: clasificación del riesgo y debilidad.                            |
| **ISO 31000:2018**                           | *Risk Management* — Evaluación de probabilidad × impacto para Severidad.                              |

> **Nota terminológica (ISO/IEC/IEEE 24765):**
> - **Error / Mistake** — Acción humana que produce un resultado incorrecto.
> - **Defect / Fault / Bug** — Imperfección en el componente que puede causar una *failure*.
> - **Failure** — Comportamiento observable del sistema que se desvía de lo esperado.
> Este informe documenta un **defecto** detectado a partir de una **falla** observada durante la ejecución de pruebas.

---

# BUG-`<id>` · `<Título descriptivo>`

| Metadato                        | Valor                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **ID del defecto**              | BUG-`____`                                                                     |
| **Título**                      | `<verbo + componente + condición>` (≤ 100 caracteres)                          |
| **Resumen ejecutivo**           | Descripción técnica concisa (1–3 líneas)                                       |
| **Fecha de detección**          | `YYYY-MM-DD`                                                                   |
| **Fecha de informe**            | `YYYY-MM-DD`                                                                   |
| **Reportado por (Autor)**       | `<Rol · Nombre>`                                                               |
| **Organización emisora**        | `<Equipo / Célula / Empresa>`                                                  |
| **Estado inicial**              | New                                                                            |

---

## 1. Contexto del defecto

| Campo                            | Detalle                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **Producto / Sistema bajo prueba (SUT)** | `<Nombre del producto>`                                              |
| **Componente / Módulo afectado** | `<Módulo, microservicio, página, endpoint>`                                   |
| **Versión / Build / Commit**     | `vX.Y.Z` / build `#____` / commit `<sha>`                                     |
| **URL / Endpoint**               | `<https://...>` o `POST /api/...`                                             |
| **Entorno de ejecución**         | SO: `<Win/Linux/Mac>` · Browser: `<Chromium/Firefox/Safari + versión>`        |
| **Datos de prueba**              | `<Set de datos / fixture / referencia>`                                       |
| **Fase de detección (ISTQB)**    | ☐ Revisión estática · ☐ Componente · ☐ Integración · **☐ Sistema** · ☐ Aceptación · ☐ Producción |
| **Tipo de prueba (origen)**      | ☐ Funcional · ☐ Seguridad · ☐ Rendimiento · ☐ Usabilidad · ☐ Compatibilidad · ☐ Integración API |

---

## 2. Pasos para reproducir

**Precondiciones:**
- `<Estado del sistema, datos requeridos, sesión, etc.>`

**Datos de entrada:**
```
<JSON / payload / parámetros>
```

**Pasos:**
1. ...
2. ...
3. ...
4. ...

**Frecuencia de reproducción:** ☐ Siempre (100%) · ☐ Frecuente (≥80%) · ☐ Intermitente · ☐ Rara

---

## 3. Resultados

| Tipo                | Descripción                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| **Esperado**        | `<Comportamiento conforme al criterio de aceptación / regla de negocio>`     |
| **Obtenido (Real)** | `<Comportamiento observado durante la ejecución>`                            |
| **Diferencia**      | `<Brecha técnica entre esperado y real>`                                     |

---

## 4. Evidencia adjunta

| Tipo de evidencia                          | Ruta / Identificador                                              |
| ------------------------------------------ | ----------------------------------------------------------------- |
| **Captura de pantalla**                    | `reports/e2e/screenshots/<archivo>.png`                           |
| **Video de la ejecución**                  | `reports/e2e/videos/<archivo>.webm`                               |
| **Log de consola / aplicación**            | `reports/<...>.log`                                               |
| **HAR file (tráfico HTTP)**                | `.api-captures/<archivo>.har`                                     |
| **Trace de Playwright**                    | `reports/test-results/<...>/trace.zip`                            |
| **Reporte Allure (resultado del TC)**      | `reports/e2e/allure-report/index.html#testcase/<uid>`             |
| **Stack trace / dump**                     | `<archivo o snippet inline>`                                      |

---

## 5. Clasificación del defecto (IEEE 1044-2009)

| Dimensión IEEE 1044                              | Valor                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Tipo de anomalía** (Anomaly Type)              | ☐ Data · ☐ Interface · ☐ Logic · ☐ Description · ☐ Syntax · ☐ Standards · ☐ Other                    |
| **Source / Origen** (Insertion Activity)         | ☐ Requisitos · ☐ Diseño · ☐ Código · ☐ Configuración · ☐ Datos · ☐ Documentación                     |
| **Detection Activity**                           | ☐ Inspección · ☐ Test unitario · ☐ Test integración · ☐ Test sistema · ☐ Test aceptación · ☐ Producción |
| **Impacto** (Customer Impact)                    | ☐ Severo · ☐ Significativo · ☐ Moderado · ☐ Insignificante · ☐ Ninguno                              |
| **Repetibilidad**                                | ☐ Repetible · ☐ Recurrente · ☐ Único                                                                 |
| **Síntoma** (Symptom)                            | ☐ Operación incorrecta · ☐ Error en datos · ☐ Caída del sistema · ☐ Mensaje incorrecto · ☐ Otro     |

---

## 6. Característica de calidad afectada (ISO/IEC 25010:2011)

> Marcar la característica principal y, opcionalmente, sub-características.

| Característica de calidad      | Sub-característica afectada                                                       | Marcar |
| ------------------------------ | --------------------------------------------------------------------------------- | ------ |
| **Functional Suitability**     | Functional Completeness · Functional Correctness · Functional Appropriateness     | ☐      |
| **Performance Efficiency**     | Time Behaviour · Resource Utilization · Capacity                                  | ☐      |
| **Compatibility**              | Co-existence · Interoperability                                                   | ☐      |
| **Usability**                  | Learnability · Operability · UI Aesthetics · Accessibility · Error Protection     | ☐      |
| **Reliability**                | Maturity · Availability · Fault Tolerance · Recoverability                        | ☐      |
| **Security**                   | Confidentiality · Integrity · Non-repudiation · Accountability · Authenticity     | ☐      |
| **Maintainability**            | Modularity · Reusability · Analysability · Modifiability · Testability            | ☐      |
| **Portability**                | Adaptability · Installability · Replaceability                                    | ☐      |

---

## 7. Evaluación del riesgo (ISO 31000:2018 + ISTQB v4.0)

| Atributo                                          | Valor                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Severidad** (Impacto técnico)                   | ☐ S1-Bloqueante · ☐ S2-Crítica · ☐ S3-Mayor · ☐ S4-Menor · ☐ S5-Trivial         |
| **Prioridad** (Urgencia de negocio)               | ☐ P1-Inmediata · ☐ P2-Alta · ☐ P3-Media · ☐ P4-Baja                             |
| **Probabilidad de ocurrencia en producción**      | ☐ Alta (>70%) · ☐ Media (30–70%) · ☐ Baja (<30%)                                |
| **Riesgo del producto** (Severidad × Probabilidad)| ☐ Crítico · ☐ Alto · ☐ Medio · ☐ Bajo                                          |
| **Alcance / Usuarios afectados**                  | `<Estimación: % de usuarios, módulos, procesos>`                               |
| **Workaround disponible**                         | ☐ Sí — `<descripción>` · ☐ No                                                  |

> **Criterio de Severidad (alineado a ISTQB):**
> - **S1-Bloqueante:** El sistema o función crítica no puede operar; sin workaround.
> - **S2-Crítica:** Función principal no opera correctamente; workaround complejo o costoso.
> - **S3-Mayor:** Función secundaria afectada; workaround simple disponible.
> - **S4-Menor:** Defecto cosmético funcional; impacto bajo.
> - **S5-Trivial:** Texto, formato, mejora menor.

---

## 8. Información de seguridad (solo para defectos de seguridad)

> Completar únicamente si el defecto fue clasificado como **Security** en la sección 6.

| Campo                                 | Valor                                                          |
| ------------------------------------- | -------------------------------------------------------------- |
| **OWASP Top 10:2021 — Categoría**     | `<Aej. A03:2021 — Injection>`                                  |
| **CWE (Common Weakness Enumeration)** | `<CWE-89: SQL Injection>`                                      |
| **CVSS v3.1 — Score base**            | `<0.0–10.0>`                                                   |
| **CVSS v3.1 — Vector**                | `<CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H>`               |
| **Vector de ataque**                  | ☐ Red · ☐ Adyacente · ☐ Local · ☐ Físico                       |
| **Datos comprometidos**               | ☐ PII · ☐ Credenciales · ☐ Financieros · ☐ PHI · ☐ Otros       |

---

## 9. Trazabilidad QASL (Shift-Left)

| Artefacto QASL                             | Identificador                                                       |
| ------------------------------------------ | ------------------------------------------------------------------- |
| **Épica (EPIC_ID)**                        | `EPIC-___`                                                          |
| **Historia de Usuario (HU_ID / US_ID)**    | `HU_REG_01`                                                         |
| **Test Suite (TS_ID)**                     | `HU_REG_01_TS__`                                                    |
| **Test Case (TC_ID)**                      | `TC-___`                                                            |
| **Precondiciones (PRC_ID)**                | `PRC-___, PRC-___`                                                  |
| **Criterio de aceptación afectado**        | `<E1, E2, ...>`                                                     |
| **Regla de negocio afectada (BR)**         | `BR1, BR2, ...`                                                     |
| **Técnica de prueba aplicada**             | `<Partición de Equivalencia, Valores Límite, Tabla de Decisión>`    |
| **Requisito / Especificación**             | `<URL Confluence / archivo / sección>`                              |
| **Build / Release pipeline**               | `<URL CI/CD>`                                                       |
| **Issue tracker (Jira / GitHub)**          | `<URL>`                                                             |

---

## 10. Análisis técnico y recomendación

| Campo                                  | Detalle                                                              |
| -------------------------------------- | -------------------------------------------------------------------- |
| **Hipótesis de causa raíz (RCA)**      | `<Análisis del posible origen — capa: UI/API/BD/Config>`             |
| **Acción correctiva sugerida**         | `<Recomendación técnica del equipo de QA>`                           |
| **Acción preventiva**                  | `<Mejora en proceso, agregar validación, control de cambios>`        |
| **Pruebas de regresión sugeridas**     | `<TCs adicionales a ejecutar tras el fix>`                           |

---

## 11. Estado y seguimiento (Lifecycle ISTQB)

| Campo                                  | Detalle                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Estado actual**                      | ☐ New · ☐ Open · ☐ Assigned · ☐ In Progress · ☐ Fixed · ☐ Retest · ☐ Verified · ☐ Closed · ☐ Rejected · ☐ Deferred · ☐ Duplicate |
| **Asignado a**                         | `<Desarrollador / Equipo>`                                                                                    |
| **Fecha asignación**                   | `YYYY-MM-DD`                                                                                                  |
| **Fecha de fix**                       | `YYYY-MM-DD`                                                                                                  |
| **Build con el fix**                   | `<vX.Y.Z>`                                                                                                    |
| **Resultado del re-test**              | ☐ Pass · ☐ Fail · ☐ Bloqueado                                                                                 |
| **Verificado por**                     | `<QA / Tester>`                                                                                               |
| **Fecha de cierre**                    | `YYYY-MM-DD`                                                                                                  |
| **Comentarios de cierre**              | `<Justificación si fue rechazado, deferido o duplicado>`                                                      |

---

## 12. Historial de cambios del informe

| Fecha        | Versión | Autor              | Cambio                                       |
| ------------ | ------- | ------------------ | -------------------------------------------- |
| `YYYY-MM-DD` | 1.0     | `<Reporter>`       | Creación inicial                             |

---

> **Aprobaciones:**
> QA Lead: `__________` · Tech Lead: `__________` · Product Owner: `__________`
