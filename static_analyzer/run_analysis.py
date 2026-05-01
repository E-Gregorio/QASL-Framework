# -*- coding: utf-8 -*-
"""
Static Analyzer — Pruebas Estáticas (QASL Framework)

EJECUCIÓN 1 de 2 del flujo Shift-Left Testing.

Pipeline:
  1. Lee la HU original en HTML  (static_analyzer/hu-originales/HU_*.html)
  2. Analiza con Claude AI       (rtm_analyzer_ai.py)
  3. Genera reporte .md          (static_analyzer/reportes/)
  4. Genera HU IDEAL .html       (static_analyzer/hu-actualizadas/)
  5. Actualiza métricas globales (static_analyzer/metricas_globales.json)

Después de esta ejecución, la HU IDEAL vuelve al Analista Funcional para
refinarla con el cliente y actualizar Jira. Una vez aprobada, se ejecuta
el segundo script para generar los CSVs de trazabilidad:

    $ python generate_traceability.py HU_REG_01

Uso:
    python run_analysis.py HU_REG_01
    python run_analysis.py HU_REG_01 HU_REG_02
"""
import sys
import json
from pathlib import Path
from datetime import datetime

# UTF-8 en consola Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from parser import parse_hu
from rtm_analyzer_ai import RTMAnalyzerAI
from report_generator import ReportGenerator
from hu_ideal_html_generator import HUIdealHTMLGenerator
import flow_state


# ----------------------------------------------------------------------
# Rutas
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
HU_ORIGINALES_DIR = BASE_DIR / "hu-originales"
HU_ACTUALIZADAS_DIR = BASE_DIR / "hu-actualizadas"
REPORTES_DIR = BASE_DIR / "reportes"
METRICAS_FILE = BASE_DIR / "metricas_globales.json"


# ----------------------------------------------------------------------
# Búsqueda de HUs
# ----------------------------------------------------------------------
def find_hu_files(hu_ids: list) -> list:
    """Busca {hu_id}.html dentro de hu-originales/."""
    found = []
    for hu_id in hu_ids:
        candidates = list(HU_ORIGINALES_DIR.glob(f"{hu_id}*.html"))
        if candidates:
            found.append((hu_id, candidates[0]))
        else:
            print(f"   [WARN] No se encontró {hu_id}.html en {HU_ORIGINALES_DIR}")
    return found


# ----------------------------------------------------------------------
# Métricas globales
# ----------------------------------------------------------------------
def cargar_metricas() -> dict:
    if METRICAS_FILE.exists():
        with open(METRICAS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "ultima_actualizacion": "",
        "total_hus_analizadas": 0,
        "total_gaps_encontrados": 0,
        "total_gaps_criticos": 0,
        "cobertura_promedio": 0,
        "hus": {},
    }


def guardar_metricas(metricas: dict):
    metricas["ultima_actualizacion"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(METRICAS_FILE, "w", encoding="utf-8") as f:
        json.dump(metricas, f, indent=2, ensure_ascii=False)


def actualizar_metricas_globales(metricas: dict):
    if not metricas["hus"]:
        return
    total_hus = len(metricas["hus"])
    metricas["total_hus_analizadas"] = total_hus
    metricas["total_gaps_encontrados"] = sum(h["gaps"] for h in metricas["hus"].values())
    metricas["total_gaps_criticos"] = sum(h["gaps_criticos"] for h in metricas["hus"].values())
    metricas["cobertura_promedio"] = round(
        sum(h["cobertura"] for h in metricas["hus"].values()) / total_hus, 1
    )


# ----------------------------------------------------------------------
# Pipeline por HU
# ----------------------------------------------------------------------
def analizar_hu(hu_id: str, hu_path: Path, metricas: dict) -> dict:
    print(f"\n{'='*60}")
    print(f"Analizando: {hu_id}")
    print(f"{'='*60}")

    # ─── DoR Fase 02 — QA Pruebas Estáticas ───────────────────────────
    flow_state.open_dor(
        fase=2,
        actor="QA - Pruebas Estaticas",
        hu_id=hu_id,
        input_doc=str(hu_path.relative_to(hu_path.parents[2])).replace("\\", "/"),
        criterios=[
            "HU original recibida del Analista Funcional",
            "Plantilla ISTQB / ISO 29148 validada",
            "API Key de Claude AI disponible (.env)",
            "Dependencias Python instaladas (anthropic, beautifulsoup4)",
        ],
        siguiente_actor="Analista Funcional - Refinamiento",
    )
    print("  [DoR] Fase 02 abierto: QA - Pruebas Estaticas")

    # 1. Parsear HU original (HTML)
    print("[1/4] Parseando HU original...")
    hu = parse_hu(str(hu_path))

    # 2. Análisis estático con Claude AI
    print("[2/4] Ejecutando análisis RTM con Claude AI...")
    analyzer = RTMAnalyzerAI(hu)
    resultado = analyzer.analizar()

    # 3. Generar reporte .md
    print("[3/4] Generando reporte de análisis estático...")
    REPORTES_DIR.mkdir(exist_ok=True)
    reporte = ReportGenerator(hu, resultado).generar_reporte()
    report_path = REPORTES_DIR / f"{hu.id}_REPORT.md"
    report_path.write_text(reporte, encoding="utf-8")

    # 4. Generar HU IDEAL .html
    print("[4/4] Generando HU IDEAL...")
    HU_ACTUALIZADAS_DIR.mkdir(exist_ok=True)
    html = HUIdealHTMLGenerator(hu, resultado).generar_hu_ideal_html()
    html_path = HU_ACTUALIZADAS_DIR / f"{hu.id}_ACTUALIZADA.html"
    html_path.write_text(html, encoding="utf-8")

    # Métricas
    cobertura = resultado.get("metricas", {}).get("cobertura_escenarios", 0)
    gaps = len(resultado.get("gaps", []))
    criticos = sum(1 for g in resultado.get("gaps", []) if getattr(g, "tipo", "") == "CRITICO")

    metricas["hus"][hu.id] = {
        "nombre": hu.nombre,
        "epica": hu.epica,
        "cobertura": cobertura,
        "gaps": gaps,
        "gaps_criticos": criticos,
        "brs": resultado.get("metricas", {}).get("total_brs", 0),
        "escenarios_originales": resultado.get("metricas", {}).get("total_escenarios_documentados", 0),
        "fecha_analisis": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "reporte": report_path.name,
        "hu_actualizada": html_path.name,
    }

    # ─── DoD Fase 02 — cerrar gap chart ───────────────────────────────
    flow_state.close_dod(
        fase=2,
        actor="QA - Pruebas Estaticas",
        artefactos=[
            f"static_analyzer/reportes/{report_path.name}",
            f"static_analyzer/hu-actualizadas/{html_path.name}",
        ],
        criterios=[
            "Análisis estático completado con Claude AI",
            f"{gaps} gaps detectados ({criticos} críticos)",
            f"Cobertura {cobertura:.1f}% → 100%",
            "HU IDEAL generada con escenarios Original + Agregado",
            "Reporte de gaps disponible para sustento ante el cliente",
        ],
        metricas={
            "cobertura_inicial": cobertura,
            "cobertura_final": 100.0,
            "gaps_detectados": gaps,
            "gaps_criticos": criticos,
            "brs_analizadas": resultado.get("metricas", {}).get("total_brs", 0),
            "escenarios_originales": resultado.get("metricas", {}).get("total_escenarios_documentados", 0),
        },
    )
    print("  [DoD] Fase 02 cerrado: QA - Pruebas Estaticas ✅")

    # Resumen
    print("\n[RESULTADOS]")
    print(f"   Cobertura inicial: {cobertura:.1f}%")
    print(f"   Gaps identificados: {gaps}")
    print(f"   Gaps críticos: {criticos}")
    print(f"   Reporte:        {report_path}")
    print(f"   HU Actualizada: {html_path}")

    return resultado


# ----------------------------------------------------------------------
# Resumen agregado
# ----------------------------------------------------------------------
def generar_resumen_metricas(metricas: dict):
    resumen_path = BASE_DIR / "METRICAS_RESUMEN.md"
    with open(resumen_path, "w", encoding="utf-8") as f:
        f.write("# Métricas de Análisis Estático\n\n")
        f.write(f"**Última actualización:** {metricas['ultima_actualizacion']}\n\n")
        f.write("---\n\n## Dashboard Global\n\n")
        f.write("| Métrica | Valor |\n|---------|-------|\n")
        f.write(f"| HUs Analizadas | {metricas['total_hus_analizadas']} |\n")
        f.write(f"| Cobertura Promedio | {metricas['cobertura_promedio']}% |\n")
        f.write(f"| Total Gaps | {metricas['total_gaps_encontrados']} |\n")
        f.write(f"| Gaps Críticos | {metricas['total_gaps_criticos']} |\n\n")
        f.write("---\n\n## Detalle por HU\n\n")
        f.write("| HU | Épica | Cobertura | Gaps | Críticos | Reporte |\n")
        f.write("|----|-------|-----------|------|----------|---------|\n")
        for hu_id, data in metricas["hus"].items():
            status = "[OK]" if data["cobertura"] >= 80 else ("[WARN]" if data["cobertura"] >= 50 else "[FAIL]")
            f.write(
                f"| {hu_id} | {data['epica'][:30]} | {status} {data['cobertura']}% "
                f"| {data['gaps']} | {data['gaps_criticos']} "
                f"| [{data['reporte']}](reportes/{data['reporte']}) |\n"
            )
        f.write("\n---\n\n*Generado por Static Analyzer (QASL Framework)*\n")
    print(f"\n[INFO] Resumen de métricas: {resumen_path.name}")


# ----------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------
def main():
    print("\n" + "=" * 60)
    print("STATIC ANALYZER — Pruebas Estáticas (QASL Framework)")
    print("Powered by Claude AI for semantic precision")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\nUso:")
        print("  python run_analysis.py HU_REG_01")
        print("  python run_analysis.py HU_REG_01 HU_REG_02")
        print("\nDespués del análisis, refiná la HU IDEAL con el cliente y luego:")
        print("  python generate_traceability.py HU_REG_01")
        sys.exit(0)

    hu_ids = [a for a in sys.argv[1:] if not a.startswith("--")]

    if not hu_ids:
        print("[ERROR] No se especificaron HUs para analizar")
        sys.exit(1)

    if not HU_ORIGINALES_DIR.exists():
        print(f"[ERROR] No existe el directorio {HU_ORIGINALES_DIR}")
        sys.exit(1)

    hu_files = find_hu_files(hu_ids)
    if not hu_files:
        print(f"[ERROR] Ninguna HU encontrada: {hu_ids}")
        sys.exit(1)

    print(f"\nHUs a analizar: {len(hu_files)}")

    metricas = cargar_metricas()
    for hu_id, hu_path in hu_files:
        analizar_hu(hu_id, hu_path, metricas)

    actualizar_metricas_globales(metricas)
    guardar_metricas(metricas)
    generar_resumen_metricas(metricas)

    print("\n" + "=" * 60)
    print("[OK] PRUEBAS ESTÁTICAS COMPLETADAS")
    print("=" * 60)
    print("\nArtefactos generados:")
    print(f"   Reportes:         {REPORTES_DIR}")
    print(f"   HUs Actualizadas: {HU_ACTUALIZADAS_DIR}")
    print(f"   Métricas:         {METRICAS_FILE.name}")
    print("\nPróximo paso:")
    print("   1. Entregá la HU IDEAL al Analista Funcional para refinarla con el cliente")
    print("   2. Una vez aprobada, ejecutá:")
    print(f"      python generate_traceability.py {' '.join(h[0] for h in hu_files)}")


if __name__ == "__main__":
    main()
