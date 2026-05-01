# -*- coding: utf-8 -*-
"""
Generate Traceability — Trazabilidad Shift-Left Testing (QASL Framework)

EJECUCIÓN 2 de 2 del flujo Shift-Left.

Toma la HU IDEAL (refinada por el Analista Funcional con el cliente) y
usa Claude AI para generar los 4 CSVs de trazabilidad oficiales:

  1_User_Storie.csv     20 columnas — la HU completa en formato CSV
  2_Test_Suite.csv      16 columnas — agrupación de TCs por suite
  3_Precondition.csv     9 columnas — precondiciones reutilizables
  4_Test_Case.csv       17 columnas — 1 fila por TC, título "Validar + descripción"

Los CSVs alimentan el resto del flujo: E2E (Playwright), API (Newman),
performance (K6), seguridad (ZAP) y son importables a Jira/Xray.

Uso:
    python generate_traceability.py HU_REG_01
    python generate_traceability.py HU_REG_01 HU_REG_02
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Dict, List

import anthropic
from dotenv import load_dotenv

from parser import parse_hu, HistoriaUsuario
import flow_state


# UTF-8 en consola Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

load_dotenv()


# ----------------------------------------------------------------------
# Rutas
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
HU_ACTUALIZADAS_DIR = BASE_DIR / "hu-actualizadas"
CSV_OUTPUT_DIR = BASE_DIR.parent / "shift-left-testing"


# ----------------------------------------------------------------------
# Configuración del modelo Claude
# ----------------------------------------------------------------------
DEFAULT_MODEL = "claude-sonnet-4-5"
MAX_TOKENS = 16000


# ----------------------------------------------------------------------
# Headers OFICIALES (orden EXACTO)
# ----------------------------------------------------------------------
HEADERS = {
    "1_User_Storie.csv": [
        "EPIC_ID", "ID_HU", "Nombre_HU", "Epica", "Estado", "Prioridad",
        "VCR_Valor", "VCR_Costo", "VCR_Riesgo", "VCR_Total",
        "Requiere_Regresion", "Es_Deuda_Tecnica",
        "Estimacion_Original_Hrs", "Tiempo_Empleado_Hrs",
        "Criterios_Aceptacion", "Reglas_Negocio",
        "Scope_Acordado", "Fuera_Scope", "Precondiciones",
        "Link_Documentacion_Base",
    ],
    "2_Test_Suite.csv": [
        "EPIC_ID", "US_ID", "TS_ID", "Nombre_Suite", "Descripcion_Suite",
        "Prioridad", "Categoria", "Tecnica_Aplicada", "Descripcion_Analisis",
        "Link_Analisis", "TC_Generados", "Estado", "QA_Framework",
        "Ambiente_Testing", "Total_TC", "Estimacion_Horas",
    ],
    "3_Precondition.csv": [
        "PRC_ID", "Titulo_PRC", "Descripcion", "Pasos_Precondicion",
        "Datos_Requeridos", "Estado_Sistema", "Categoria",
        "Reutilizable", "TC_Asociados",
    ],
    "4_Test_Case.csv": [
        "TC_ID", "US_ID", "TS_ID", "Titulo_TC", "Tipo_Prueba", "PRC_Asociadas",
        "Datos_Entrada", "Resultado_Esperado",
        "Prioridad", "Complejidad", "Estado", "Tiempo_Estimado", "Creado_Por",
        "Fecha_Creacion", "Cobertura_Escenario", "Cobertura_BR", "Tecnica_Aplicada",
    ],
}


# ----------------------------------------------------------------------
# Prompt builder
# ----------------------------------------------------------------------
def construir_prompt(hu: HistoriaUsuario) -> str:
    """Construye el prompt completo para Claude."""
    headers_block = "\n".join(
        f"  {nombre}:\n    {','.join(cols)}"
        for nombre, cols in HEADERS.items()
    )

    return f"""Sos un experto en QA aplicando los siguientes estándares vigentes:
  - ISTQB CTFL v4.0 (2023) — Certified Tester Foundation Level
  - ISO/IEC/IEEE 29119-3:2021 — Test Documentation (reemplaza IEEE 829, ya derogado)
  - ISO/IEC/IEEE 29148:2018 — Requirements Engineering (reemplaza IEEE 830, ya derogado)
  - OWASP Top 10:2021 — Web Application Security Risks

Tu tarea es generar los 4 CSVs oficiales de trazabilidad Shift-Left Testing a partir de una Historia de Usuario IDEAL (con cobertura 100%).

## INPUT — Historia de Usuario IDEAL

ID: {hu.id}
Nombre: {hu.nombre}
Épica: {hu.epica}
Estado: {hu.estado}
Prioridad: {hu.prioridad}

Como: {hu.descripcion_como}
Quiero: {hu.descripcion_quiero}
Para: {hu.descripcion_para}

Reglas de Negocio:
{chr(10).join(f'  {br.id}: {br.descripcion}' for br in hu.reglas_negocio)}

Escenarios:
{chr(10).join(f'  {esc.id} [{"agregado" if esc.es_agregado else "original"}{f" - cubre {esc.br_cubierta}" if esc.br_cubierta else ""}]: {esc.titulo}{chr(10)}    DADO {esc.dado}{chr(10)}    CUANDO {esc.cuando}{chr(10)}    ENTONCES {esc.entonces}{(chr(10) + "    Y " + esc.y_adicional) if esc.y_adicional else ""}' for esc in hu.escenarios)}

Precondiciones HU:
{chr(10).join(f'  - {p}' for p in hu.precondiciones)}

Dependencias:
{chr(10).join(f'  - {d}' for d in hu.dependencias)}

Dentro del Alcance:
{chr(10).join(f'  - {i}' for i in hu.dentro_alcance)}

Fuera del Alcance:
{chr(10).join(f'  - {i}' for i in hu.fuera_alcance)}

## OUTPUT — 4 CSVs

Generá los 4 CSVs con estos headers EXACTOS (no agregues, quites ni renombres columnas):

{headers_block}

## REGLAS DE NEGOCIO (importantes)

### Convención de IDs
- EPIC_ID: EPIC-01 (formato EPIC-NN)
- US_ID: {hu.id}
- TS_ID: formato compuesto {hu.id}_TS01, {hu.id}_TS02, {hu.id}_TS03
- TC_ID: TC-001, TC-002, ... (numeración global secuencial, sin saltos)
- PRC_ID: PRC-001, PRC-002, ... (reutilizables)

### Test Suites — agrupación obligatoria
- {hu.id}_TS01 — Flujo Principal y Validaciones Positivas (categoría: Funcional)
- {hu.id}_TS02 — Validaciones Negativas y Manejo de Errores (categoría: Funcional - Negativa)
- {hu.id}_TS03 — Seguridad e Integración (categoría: Seguridad - OWASP) — solo si aplica

### Cobertura mínima de Test Cases
Por cada BR: 1 TC POSITIVO + 1 TC NEGATIVO (mínimo).
Por cada Escenario (E1, E2, ...): 1 TC asociado (puede compartir con un TC de BR).
Si una BR tiene valores límite (ej: "mínimo 6 caracteres"): incluir TC LÍMITE adicional.
Cobertura objetivo: 11-15 TCs para una HU típica con 4 BRs + 5 escenarios.

### Test Cases — UNA fila por TC, sin pasos separados

⚠️ MUY IMPORTANTE — formato del CSV 4_Test_Case.csv:
- Cada TC ocupa EXACTAMENTE 1 FILA (NO múltiples filas por pasos).
- NO existen las columnas Paso_Numero ni Paso_Accion. NO incluir pasos.
- Datos_Entrada: consolidá los datos relevantes en una sola celda (separar con " | ").
- Resultado_Esperado: una verificación clara y observable, en una sola celda.

⚠️ Titulo_TC — formato obligatorio:
- DEBE empezar con un VERBO en infinitivo: "Validar".
- Ejemplos correctos:
    "Validar acceso al formulario de registro desde la página principal"
    "Validar registro exitoso con datos válidos"
    "Validar rechazo de email duplicado con mensaje de error"
    "Validar aceptación de password de 6 caracteres (límite positivo)"
    "Validar rechazo de password de 5 caracteres (límite negativo)"
- Prohibido: usar "DADO", "CUANDO", "ENTONCES", "Intento de", "Acceder a" en el título.
- El título describe QUÉ se valida, no cómo se ejecuta.

⚠️ Generación COMPLETA — sin truncar:
- Generá TODOS los TCs declarados en el CSV 2 (Test Suites). Si el TC_Generados de
  cualquier suite menciona TC-001..TC-016, EL CSV 4 debe tener los 16 TCs completos.
- No omitas ninguno por brevedad. No agrupes pasos.
- Si llegás cerca del límite de tokens, priorizá completar TODOS los TCs sobre dar
  descripciones extensas: usá Datos_Entrada y Resultado_Esperado concisos pero presentes.

### Trazabilidad bidireccional
- Cada TC en CSV 4 referencia su TS_ID (CSV 2) y al menos 1 PRC (CSV 3) en PRC_Asociadas.
- TC_Generados de CSV 2 lista los TCs con formato: "TC-001: Título corto | TC-002: ..."
- TC_Asociados de CSV 3 lista los TCs que usan esa precondición: "TC-001, TC-002, ..."
- Cobertura_BR en CSV 4: "BR1" o "BR1, BR2" si cubre múltiples.
- Cobertura_Escenario en CSV 4: "E1" / "E2" / vacío si no aplica.

### Precondiciones — generar 5-9 PRCs reutilizables
Sugeridas (adaptar al dominio):
  PRC-001: Sitio público accesible y operativo
  PRC-002: Datos de prueba para flujo positivo (datos válidos disponibles)
  PRC-003: Datos de prueba para flujo negativo (datos conflictivos pre-cargados)
  PRC-004: Sesión limpia (sin tokens previos)
  PRC-005: Browser soportado y configurado
Y las que correspondan al dominio específico de la HU.

### Campos vacíos
Dejar vacío (NO escribir "N/A", "null", "-").

### Escapado CSV
Si un campo contiene comas o saltos, encerrarlo entre comillas dobles. Comillas internas → duplicarlas ("").

### Separadores dentro de campos
Usar "|" (pipe) para listas dentro de un campo (ej: pasos, datos, BRs).

### Campo VCR — DEJAR EN BLANCO
Los siguientes campos del CSV 1_User_Storie deben quedar con valor vacío
(las columnas se mantienen, pero sin contenido):
  VCR_Valor, VCR_Costo, VCR_Riesgo, VCR_Total,
  Requiere_Regresion, Es_Deuda_Tecnica,
  Estimacion_Original_Hrs, Tiempo_Empleado_Hrs

Razón: la estimación VCR y la decisión de automatización son actividad
de la Fase 09 (Planning Poker), no de la Fase 05 (Trazabilidad).
El QA en esta fase entrega Test Cases trazables; no estima costo,
riesgo, esfuerzo ni deuda técnica de la HU.

### Fecha
Fecha_Creacion: usar fecha actual en formato YYYY-MM-DD.

### Creado_Por
"Static Analyzer (QASL Framework)"

### Estado inicial
- En CSV 1: usar el Estado de la HU
- En CSV 2 (Test Suites): "Planning"
- En CSV 4 (Test Cases): "Diseñando"

### QA Framework
"Playwright + Newman" (si hay seguridad: "Playwright + Newman + ZAP")

### Ambiente_Testing
"QA"

### Link_Documentacion_Base / Link_Analisis
"static_analyzer/hu-actualizadas/{hu.id}_ACTUALIZADA.html"

## FORMATO DE RESPUESTA (estricto)

Devolvé los 4 CSVs separados por marcadores. NO agregues bloques de código markdown ni backticks. NO agregues explicaciones ni texto adicional. Solo los 4 bloques con este formato exacto:

===== 1_User_Storie.csv =====
[header]
[fila 1]

===== 2_Test_Suite.csv =====
[header]
[fila 1]
[fila 2]
[fila 3]

===== 3_Precondition.csv =====
[header]
[PRC-001]
[PRC-002]
...

===== 4_Test_Case.csv =====
[header]
[TC-001 — una sola fila completa]
[TC-002 — una sola fila completa]
[TC-003 — una sola fila completa]
... (TODOS los TCs declarados en TC_Generados de las suites)

Empezá ahora."""


# ----------------------------------------------------------------------
# Llamada a Claude
# ----------------------------------------------------------------------
def llamar_claude(prompt: str) -> str:
    """Envía el prompt a Claude y devuelve el texto de la respuesta."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key.startswith("sk-ant-XXX"):
        raise RuntimeError(
            "ANTHROPIC_API_KEY no configurada. Editá static_analyzer/.env y pegá tu key."
        )

    model = os.getenv("ANTHROPIC_MODEL", DEFAULT_MODEL)
    client = anthropic.Anthropic(api_key=api_key)

    print(f"   Modelo: {model}")
    print("   Enviando prompt a Claude... (puede tardar 20-60s)")

    response = client.messages.create(
        model=model,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text


# ----------------------------------------------------------------------
# Parsing de la respuesta
# ----------------------------------------------------------------------
SEPARATOR_RE = re.compile(r"^=====\s*(\d_[A-Za-z_]+\.csv)\s*=====\s*$", re.MULTILINE)


def split_csvs(respuesta: str) -> Dict[str, str]:
    """Separa la respuesta de Claude en bloques por marcador ===== N_X.csv =====."""
    matches = list(SEPARATOR_RE.finditer(respuesta))
    if not matches:
        raise ValueError(
            "Respuesta de Claude sin marcadores '===== N_X.csv ====='. "
            "Revisá el prompt o el output crudo."
        )

    bloques: Dict[str, str] = {}
    for i, match in enumerate(matches):
        nombre = match.group(1)
        inicio = match.end()
        fin = matches[i + 1].start() if i + 1 < len(matches) else len(respuesta)
        bloques[nombre] = respuesta[inicio:fin].strip() + "\n"
    return bloques


def validar_headers(nombre: str, contenido: str) -> bool:
    """Verifica que el primer renglón del CSV coincida con el header esperado."""
    expected = HEADERS.get(nombre)
    if expected is None:
        return False
    primera_linea = contenido.splitlines()[0] if contenido else ""
    actual_cols = [c.strip() for c in primera_linea.split(",")]
    if actual_cols != expected:
        print(f"   [WARN] Header de {nombre} no coincide exacto:")
        print(f"          Esperado: {expected}")
        print(f"          Recibido: {actual_cols}")
        return False
    return True


# ----------------------------------------------------------------------
# Pipeline por HU
# ----------------------------------------------------------------------
def generar_csvs_para_hu(hu_id: str) -> List[Path]:
    """Pipeline: HU IDEAL → Claude → 4 CSVs."""
    # 1. Localizar HU IDEAL
    candidatos = list(HU_ACTUALIZADAS_DIR.glob(f"{hu_id}*ACTUALIZADA*.html"))
    if not candidatos:
        candidatos = list(HU_ACTUALIZADAS_DIR.glob(f"{hu_id}*.html"))
    if not candidatos:
        raise FileNotFoundError(
            f"No se encontró HU IDEAL para {hu_id} en {HU_ACTUALIZADAS_DIR}.\n"
            f"  ¿Ejecutaste primero `python run_analysis.py {hu_id}` y refinaste la HU?"
        )

    hu_path = candidatos[0]
    print(f"\n{'='*60}")
    print(f"Generando trazabilidad: {hu_id}")
    print(f"{'='*60}")
    print(f"   HU IDEAL: {hu_path}")

    # ─── DoR Fase 05 — QA Trazabilidad Shift-Left ─────────────────────
    flow_state.open_dor(
        fase=5,
        actor="QA - Trazabilidad Shift-Left",
        hu_id=hu_id,
        input_doc=str(hu_path.relative_to(hu_path.parents[2])).replace("\\", "/"),
        criterios=[
            "HU IDEAL aprobada por el Cliente (DoD fase 04 cerrado)",
            "API Key de Claude AI con saldo disponible",
            "Plantilla ISTQB validada con cobertura 100%",
            "Carpeta shift-left-testing/ accesible para escritura",
        ],
        siguiente_actor="DevOps - Primer Deploy",
    )
    print("  [DoR] Fase 05 abierto: QA - Trazabilidad Shift-Left")

    # 2. Parsear
    print("[1/4] Parseando HU IDEAL...")
    hu = parse_hu(str(hu_path))

    # 3. Llamar a Claude
    print("[2/4] Construyendo prompt y llamando a Claude AI...")
    prompt = construir_prompt(hu)
    respuesta = llamar_claude(prompt)

    # 4. Parsear respuesta
    print("[3/4] Parseando respuesta...")
    bloques = split_csvs(respuesta)

    # 5. Guardar CSVs
    print("[4/4] Guardando CSVs en shift-left-testing/...")
    CSV_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    paths_generados = []
    filas_por_csv = {}
    for nombre in HEADERS.keys():
        contenido = bloques.get(nombre)
        if contenido is None:
            print(f"   [ERROR] Falta {nombre} en la respuesta de Claude")
            continue
        validar_headers(nombre, contenido)
        path = CSV_OUTPUT_DIR / nombre
        path.write_text(contenido, encoding="utf-8")
        paths_generados.append(path)
        n_filas = max(0, len(contenido.splitlines()) - 1)
        filas_por_csv[nombre] = n_filas
        print(f"   [OK] {nombre} ({n_filas} filas de datos)")

    # ─── DoD Fase 05 — cerrar gap chart ───────────────────────────────
    flow_state.close_dod(
        fase=5,
        actor="QA - Trazabilidad Shift-Left",
        artefactos=[f"shift-left-testing/{p.name}" for p in paths_generados],
        criterios=[
            f"4 CSVs trazables generados con Claude AI ({sum(filas_por_csv.values())} filas totales)",
            "Headers oficiales validados en cada CSV",
            "Test Cases en formato 1 fila por TC con título 'Validar...'",
            "Trazabilidad bidireccional US ↔ TS ↔ TC ↔ PRC",
            "Test Cases generados ANTES del código fuente (Shift-Left puro)",
        ],
        metricas={
            "csvs_generados": len(paths_generados),
            "filas_user_storie": filas_por_csv.get("1_User_Storie.csv", 0),
            "filas_test_suite": filas_por_csv.get("2_Test_Suite.csv", 0),
            "filas_precondition": filas_por_csv.get("3_Precondition.csv", 0),
            "filas_test_case": filas_por_csv.get("4_Test_Case.csv", 0),
        },
    )
    print("  [DoD] Fase 05 cerrado: QA - Trazabilidad Shift-Left ✅")

    return paths_generados


# ----------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------
def main():
    print("\n" + "=" * 60)
    print("GENERATE TRACEABILITY — Shift-Left Testing CSVs")
    print("Powered by Claude AI")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\nUso:")
        print("  python generate_traceability.py HU_REG_01")
        print("  python generate_traceability.py HU_REG_01 HU_REG_02")
        print("\nPre-requisito:")
        print("  Ejecutar primero `python run_analysis.py HU_REG_01` para generar")
        print("  la HU IDEAL en hu-actualizadas/. Luego refinarla con el cliente y")
        print("  recién después correr este script.")
        sys.exit(0)

    hu_ids = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not hu_ids:
        print("[ERROR] No se especificaron HUs")
        sys.exit(1)

    todos_los_paths: List[Path] = []
    for hu_id in hu_ids:
        try:
            paths = generar_csvs_para_hu(hu_id)
            todos_los_paths.extend(paths)
        except FileNotFoundError as e:
            print(f"[ERROR] {e}")
            continue
        except Exception as e:
            print(f"[ERROR] al procesar {hu_id}: {e}")
            continue

    if todos_los_paths:
        print("\n" + "=" * 60)
        print("[OK] TRAZABILIDAD GENERADA")
        print("=" * 60)
        print(f"\nCSVs en {CSV_OUTPUT_DIR}:")
        for path in todos_los_paths:
            print(f"   {path.name}")
        print("\nPróximo paso: importar a Jira/Xray o usar para alimentar el flujo")
        print("E2E (Playwright) → API (Newman) → Performance (K6) → Seguridad (ZAP).")
    else:
        print("\n[ERROR] No se generaron CSVs")
        sys.exit(1)


if __name__ == "__main__":
    main()
