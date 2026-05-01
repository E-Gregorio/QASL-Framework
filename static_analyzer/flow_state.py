# -*- coding: utf-8 -*-
"""
Flow State — Registro DoR/DoD por actor (QASL Framework)

Cada actor del pipeline Shift-Left produce su propio "gap chart":
  - open_dor():  marca cuándo recibe input válido y qué criterios habilita
  - close_dod(): marca cuándo entrega artefactos verificables y qué métricas obtuvo

Los JSON resultantes en  QASL-Framework/flow-state/  alimentan el Master View.

Convención de nombres de archivo:
  flow-state/{NN}-{actor-slug}.json    (ej: 02-qa-pruebas-estaticas.json)

Regla del framework:
  El DoD de una fase ES el DoR de la siguiente. Sin DoD cerrado no hay avance.
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


# Raíz del repo (QASL-Framework/) — flow-state/ vive aquí
REPO_ROOT = Path(__file__).parent.parent
FLOW_STATE_DIR = REPO_ROOT / "flow-state"


# ----------------------------------------------------------------------
# Helpers internos
# ----------------------------------------------------------------------
def _slug(text: str) -> str:
    """Convierte 'QA — Pruebas Estáticas' en 'qa-pruebas-estaticas'."""
    text = text.lower().replace("—", "-").replace("/", "-")
    text = re.sub(r"[áàä]", "a", text)
    text = re.sub(r"[éèë]", "e", text)
    text = re.sub(r"[íìï]", "i", text)
    text = re.sub(r"[óòö]", "o", text)
    text = re.sub(r"[úùü]", "u", text)
    text = re.sub(r"ñ", "n", text)
    text = re.sub(r"[^a-z0-9-]+", "-", text)
    return text.strip("-")


def _path(fase: int, actor: str) -> Path:
    return FLOW_STATE_DIR / f"{fase:02d}-{_slug(actor)}.json"


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


# ----------------------------------------------------------------------
# API pública
# ----------------------------------------------------------------------
def open_dor(
    fase: int,
    actor: str,
    hu_id: str,
    input_doc: str,
    criterios: List[str],
    siguiente_actor: Optional[str] = None,
) -> Dict:
    """Abre el DoR de un actor. Crea el archivo JSON con la fase en estado 'en_progreso'."""
    FLOW_STATE_DIR.mkdir(parents=True, exist_ok=True)

    record = {
        "fase": fase,
        "actor": actor,
        "hu_id": hu_id,
        "estado": "en_progreso",
        "dor": {
            "abierto_en": _now_iso(),
            "input": input_doc,
            "criterios": criterios,
        },
        "dod": None,
        "siguiente_actor": siguiente_actor or "(por definir)",
    }

    _path(fase, actor).write_text(
        json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return record


def close_dod(
    fase: int,
    actor: str,
    artefactos: List[str],
    criterios: List[str],
    metricas: Optional[Dict] = None,
) -> Dict:
    """Cierra el DoD del actor. Calcula duración respecto del DoR abierto."""
    path = _path(fase, actor)
    if not path.exists():
        raise RuntimeError(
            f"No se puede cerrar DoD: la fase {fase:02d} ({actor}) no tiene DoR abierto.\n"
            f"  Llamá primero a flow_state.open_dor(...)"
        )

    record = json.loads(path.read_text(encoding="utf-8"))
    abierto = datetime.fromisoformat(record["dor"]["abierto_en"])
    cerrado = datetime.now()
    duracion = int((cerrado - abierto).total_seconds())

    record["estado"] = "completado"
    record["dod"] = {
        "cerrado_en": cerrado.isoformat(timespec="seconds"),
        "duracion_segundos": duracion,
        "artefactos": artefactos,
        "criterios": criterios,
        "metricas": metricas or {},
    }

    path.write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    return record


def listar_estado() -> List[Dict]:
    """Lista todos los gap charts ordenados por fase (útil para el master view)."""
    if not FLOW_STATE_DIR.exists():
        return []
    records = []
    for path in sorted(FLOW_STATE_DIR.glob("*.json")):
        records.append(json.loads(path.read_text(encoding="utf-8")))
    return records
