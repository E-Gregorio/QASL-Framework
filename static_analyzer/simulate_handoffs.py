# -*- coding: utf-8 -*-
"""
Simulador de handoffs DoR/DoD para roles que NO son scripts Python.

Este módulo "imagina" las etapas del flujo Shift-Left que corresponden
a otros actores (Cliente, Analista Funcional, DevOps, PM, Equipo) y
escribe sus respectivos gap charts en flow-state/.

Junto con run_analysis.py (fase 02) y generate_traceability.py (fase 05),
permite recorrer el flujo completo de 11 etapas para el demo en vivo.

Uso:
    python simulate_handoffs.py 00 01           # cliente + analista (HU original)
    python simulate_handoffs.py 03 04           # analista refina + cliente aprueba
    python simulate_handoffs.py 06 07 08 09     # devops + smoke + PM + planning poker
"""
from __future__ import annotations

import sys
import time

import flow_state


HU_ID = "HU_REG_01"


# ----------------------------------------------------------------------
# Definición de cada handoff simulado
# ----------------------------------------------------------------------
HANDOFFS = {
    0: {
        "actor": "Cliente",
        "input": "Necesidad de negocio: módulo de Registro de Nuevo Usuario para el e-commerce",
        "criterios_dor": [
            "Visión de negocio definida",
            "Stakeholders identificados",
            "Restricciones técnicas conocidas",
        ],
        "artefactos": ["Brief del cliente", "Sesiones de descubrimiento"],
        "criterios_dod": [
            "Requerimientos funcionales comunicados",
            "Requerimientos no funcionales mínimos definidos",
            "Reglas de negocio iniciales identificadas (BR1-BR4)",
        ],
        "siguiente_actor": "Analista Funcional",
    },
    1: {
        "actor": "Analista Funcional - HU Original",
        "input": "Requerimientos del cliente recibidos",
        "criterios_dor": [
            "Brief del cliente revisado",
            "Plantilla ISTQB / ISO 29148 disponible",
            "Conocimiento del dominio confirmado",
        ],
        "artefactos": ["static_analyzer/hu-originales/HU_REG_01.html"],
        "criterios_dod": [
            "HU escrita en formato Como/Quiero/Para",
            "BR1-BR4 documentadas",
            "Mínimo 2 escenarios iniciales (positivos del happy path)",
            "Estado: Borrador - Pendiente de Análisis Estático",
        ],
        "siguiente_actor": "QA - Pruebas Estáticas",
    },
    3: {
        "actor": "Analista Funcional - Refinamiento",
        "input": "static_analyzer/hu-actualizadas/HU_REG_01_ACTUALIZADA.html",
        "criterios_dor": [
            "HU IDEAL recibida del QA con cobertura 100%",
            "Reporte de gaps disponible para sustento ante el cliente",
            "Disponibilidad del cliente para sesión de revisión",
        ],
        "artefactos": ["HU IDEAL refinada con feedback del cliente"],
        "criterios_dod": [
            "Escenarios validados con el cliente",
            "Ajustes finales incorporados",
            "Sin bloqueos pendientes",
        ],
        "siguiente_actor": "Cliente",
    },
    4: {
        "actor": "Cliente - Aprobación",
        "input": "HU IDEAL refinada por el Analista Funcional",
        "criterios_dor": [
            "HU IDEAL revisada en sesión de refinamiento",
            "BRs y escenarios alineados al modelo de negocio",
            "Sin observaciones críticas pendientes",
        ],
        "artefactos": ["Aprobación formal (sign-off)"],
        "criterios_dod": [
            "Cliente firma la HU IDEAL como aprobada",
            "Acta de aprobación registrada",
        ],
        "siguiente_actor": "QA - Trazabilidad Shift-Left",
    },
    6: {
        "actor": "DevOps - Primer Deploy",
        "input": "Trazabilidad lista (4 CSVs en shift-left-testing/)",
        "criterios_dor": [
            "Pipeline CI/CD operativo",
            "Ambiente QA disponible",
            "Build artefacto generado",
        ],
        "artefactos": ["Build deployado en ambiente QA"],
        "criterios_dod": [
            "Servicios up (smoke de infraestructura)",
            "URL del ambiente QA accesible",
            "Logs disponibles en Loki",
        ],
        "siguiente_actor": "QA - Validación Temprana",
        "metricas": {
            "ambiente": "QA",
            "url": "https://automationexercise.com",
            "build_status": "OK",
        },
    },
    7: {
        "actor": "QA - Validación Temprana",
        "input": "Build deployado + 4 CSVs trazables",
        "criterios_dor": [
            "Ambiente QA accesible",
            "Test Cases pre-código disponibles",
            "Datos de prueba sintéticos preparados",
        ],
        "artefactos": [
            "Pruebas exploratorias completadas",
            "Smoke tests OK",
            "Confirmación HU↔TC alineadas",
        ],
        "criterios_dod": [
            "Smoke tests pasados al 100%",
            "Sin discrepancias entre HU y Test Cases",
            "Gate de calidad pasado",
        ],
        "siguiente_actor": "PM / Scrum Master",
        "metricas": {
            "smoke_tests_pasados": 12,
            "smoke_tests_fallidos": 0,
            "alineacion_hu_tc": "100%",
        },
    },
    8: {
        "actor": "PM - Backlog Jira",
        "input": "HU validada por QA Validación Temprana",
        "criterios_dor": [
            "HU con gate de calidad pasado",
            "4 CSVs disponibles para importar a Jira/Xray",
            "Capacidad del sprint conocida",
        ],
        "artefactos": ["Ticket Jira con HU + Test Cases linkeados"],
        "criterios_dod": [
            "HU priorizada en el backlog del próximo sprint",
            "Test Cases importados a Xray",
            "Asignación tentativa al equipo confirmada",
        ],
        "siguiente_actor": "Equipo - Planning Poker",
    },
    9: {
        "actor": "Equipo - Planning Poker",
        "input": "HU priorizada en el backlog Jira",
        "criterios_dor": [
            "HU al tope del backlog",
            "Equipo presente en la ceremonia",
            "Framework VCR conocido por todos",
        ],
        "artefactos": [
            "Estimación VCR registrada",
            "Decisión automatizar/manual tomada",
            "Asignación al QA confirmada",
        ],
        "criterios_dod": [
            "VCR calculado: V=3 + C=2 + R=(P=2 × I=3)=6 → Total=11",
            "VCR ≥ 9 → Deuda técnica → AUTOMATIZAR + REGRESIÓN",
            "QA Senior asignado para ejecutar pruebas E2E/API/K6/ZAP",
        ],
        "siguiente_actor": "QA + Devs - Ejecución de Pruebas",
        "metricas": {
            "vcr_valor": 3,
            "vcr_costo": 2,
            "vcr_probabilidad": 2,
            "vcr_impacto": 3,
            "vcr_riesgo": 6,
            "vcr_total": 11,
            "decision": "DEUDA_TECNICA_AUTOMATIZAR",
        },
    },
}


# ----------------------------------------------------------------------
# Simulación
# ----------------------------------------------------------------------
def simular_handoff(fase: int) -> None:
    handoff = HANDOFFS.get(fase)
    if handoff is None:
        print(f"   [WARN] Fase {fase:02d} no es simulable (¿es un script real?)")
        return

    actor = handoff["actor"]
    print(f"\n  [DoR] Fase {fase:02d}: {actor}")
    print(f"        Input: {handoff['input'][:75]}")

    flow_state.open_dor(
        fase=fase,
        actor=actor,
        hu_id=HU_ID,
        input_doc=handoff["input"],
        criterios=handoff["criterios_dor"],
        siguiente_actor=handoff.get("siguiente_actor"),
    )

    # Pausa simbólica (representa el tiempo del actor humano)
    time.sleep(0.5)

    flow_state.close_dod(
        fase=fase,
        actor=actor,
        artefactos=handoff["artefactos"],
        criterios=handoff["criterios_dod"],
        metricas=handoff.get("metricas"),
    )
    print(f"  [DoD] Fase {fase:02d}: {actor} ✅ cerrado")
    print(f"        Próximo actor: {handoff.get('siguiente_actor', '(fin)')}")


def main() -> None:
    print("\n" + "=" * 60)
    print("SIMULADOR DE HANDOFFS DoR/DoD (QASL Framework)")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\nUso:")
        print("  python simulate_handoffs.py FASE_NN [FASE_NN ...]")
        print("\nFases simulables:")
        for fase, h in sorted(HANDOFFS.items()):
            print(f"  {fase:02d}  {h['actor']}")
        print("\nFases reales (NO simular, ejecutar el script correspondiente):")
        print("  02  QA - Pruebas Estáticas         → python run_analysis.py")
        print("  05  QA - Trazabilidad Shift-Left   → python generate_traceability.py")
        print("  10  QA - Pruebas E2E/API/K6/ZAP    → npm run pipeline")
        sys.exit(0)

    for arg in sys.argv[1:]:
        try:
            fase = int(arg)
        except ValueError:
            print(f"   [ERROR] '{arg}' no es un número de fase válido")
            continue
        simular_handoff(fase)

    print("\n" + "=" * 60)
    print("[OK] Handoffs simulados")
    print("=" * 60)


if __name__ == "__main__":
    main()
