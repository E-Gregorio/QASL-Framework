# -*- coding: utf-8 -*-
"""
Render Dashboard — Lámina Editorial QASL Master View

Genera una lámina única HTML/SVG estilo editorial corporativo
(paleta papel + tierra + colores por actor) que comunica el flujo
completo DoR/DoD encadenado.

Lee los 10 JSONs de flow-state/ y rellena dinámicamente:
  - Métricas (cobertura, gaps, test cases, VCR, duración)
  - HU ID, fecha
  - Detalles por fase

Uso:
    python render_dashboard.py

Output:
    QASL-Framework/flow-state-dashboard.html
"""
from __future__ import annotations

import html
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = Path(__file__).parent.parent
FLOW_STATE_DIR = REPO_ROOT / "flow-state"
OUTPUT_HTML = REPO_ROOT / "flow-state-dashboard.html"

HERO_PHASES = {2, 5}


# ----------------------------------------------------------------------
# Metadata por fase: color del actor + role label + acción/detalle
# ----------------------------------------------------------------------
FASE_META = {
    0: {"actor": "Cliente",          "role": "NEGOCIO",                   "color": "#B8860B", "soft": "#FBF4E3", "header": "#B8860B", "f_pill": "#B8860B"},
    1: {"actor": "Analista",         "role": "FUNCIONAL",                 "color": "#6B3FA0", "soft": "#F1EBF7", "header": "#6B3FA0", "f_pill": "#6B3FA0"},
    2: {"actor": "QA · Estático",    "role": "CLAUDE AI",                 "color": "#1F3A5F", "soft": "#E5ECF4", "header": "#B8860B", "f_pill": "#1F3A5F"},
    3: {"actor": "Analista",         "role": "REFINA",                    "color": "#6B3FA0", "soft": "#F1EBF7", "header": "#6B3FA0", "f_pill": "#6B3FA0"},
    4: {"actor": "Cliente",          "role": "SIGN-OFF",                  "color": "#B8860B", "soft": "#FBF4E3", "header": "#B8860B", "f_pill": "#B8860B"},
    5: {"actor": "QA · Trazab.",     "role": "CLAUDE AI",                 "color": "#1F3A5F", "soft": "#E5ECF4", "header": "#B8860B", "f_pill": "#1F3A5F"},
    6: {"actor": "DevOps",           "role": "PRIMER DEPLOY EN QA",       "color": "#2D5F3F", "soft": "#E8F0E9", "header": "#2D5F3F", "f_pill": "#2D5F3F"},
    7: {"actor": "QA · Smoke",       "role": "VALIDACIÓN TEMPRANA",       "color": "#1F3A5F", "soft": "#E5ECF4", "header": "#1F3A5F", "f_pill": "#1F3A5F"},
    8: {"actor": "PM · Scrum",       "role": "BACKLOG JIRA",              "color": "#B33A1F", "soft": "#FBEEE7", "header": "#B33A1F", "f_pill": "#B33A1F"},
    9: {"actor": "Equipo completo",  "role": "PLANNING POKER · VCR",      "color": "#0E6B7C", "soft": "#E0F4F7", "header": "#0E6B7C", "f_pill": "#0E6B7C"},
}

FASE_ACTION = {
    0: ("Comunica negocio",      "brief · sesiones"),
    1: ("Redacta la HU",         "INVEST · borrador"),
    2: ("Detecta gaps",          ""),  # dinámico
    3: ("Refina con cliente",    "HU IDEAL refinada"),
    4: ("Aprobación formal",     "HU aprobada · sign-off"),
    5: ("Genera 4 CSVs",         "US → TS → PRC → TC"),
    6: ("Primer deploy en QA",   "build deployado · 1s"),
    7: ("Validación temprana",   "HU ↔ TC alineadas · 0s"),
    8: ("Backlog Jira",          "ticket priorizado · 1s"),
    9: ("Planning Poker · VCR",  ""),  # dinámico
}

# Artefactos cortos de los 5 puentes entre cápsulas principales
HANDOFF_LABELS = {
    (0, 1): "brief.cliente",
    (1, 2): "HU_REG_01.html",
    (2, 3): "REPORT.md",
    (3, 4): "HU IDEAL ref.",
    (4, 5): "sign-off",
}


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
def cargar_fases() -> List[Dict]:
    if not FLOW_STATE_DIR.exists():
        print(f"[ERROR] No existe {FLOW_STATE_DIR}")
        sys.exit(1)
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(FLOW_STATE_DIR.glob("*.json"))]


def get_phase(fases: List[Dict], n: int) -> Optional[Dict]:
    return next((f for f in fases if f.get("fase") == n), None)


def get_metric(fase: Optional[Dict], key: str, default=""):
    if fase is None:
        return default
    return ((fase.get("dod") or {}).get("metricas") or {}).get(key, default)


def fmt_duration(seconds: int) -> str:
    if seconds < 60:
        return f"{seconds}s"
    m, s = divmod(seconds, 60)
    if m < 60:
        return f"{m}m {s:02d}s"
    h, m = divmod(m, 60)
    return f"{h}h {m}m"


# ----------------------------------------------------------------------
# Iconos SVG por fase
# ----------------------------------------------------------------------
def _render_icon(n: int, color: str, soft: str) -> str:
    if n == 0:  # Cliente persona
        return (
            f'<circle cx="70" cy="80" r="24" fill="{soft}" stroke="{color}" stroke-width="2"/>'
            f'<circle cx="70" cy="74" r="6" fill="{color}"/>'
            f'<path d="M 56 96 C 56 84, 84 84, 84 96 L 84 99 L 56 99 Z" fill="{color}"/>'
        )
    if n == 4:  # Cliente sign-off (check)
        return (
            f'<circle cx="70" cy="80" r="24" fill="{soft}" stroke="{color}" stroke-width="2"/>'
            f'<circle cx="70" cy="80" r="11" fill="{color}"/>'
            f'<path d="M 64 80 L 68 84 L 76 75" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
        )
    if n in (1, 3):  # Analista doc
        extra = '<circle cx="80" cy="71" r="4" fill="#B8860B"/>' if n == 3 else ""
        return (
            f'<circle cx="70" cy="80" r="24" fill="{soft}" stroke="{color}" stroke-width="2"/>'
            f'<path d="M 62 70 L 78 70 L 78 92 L 62 92 Z" fill="{color}"/>'
            f'<line x1="65" y1="76" x2="75" y2="76" stroke="#FFFFFF" stroke-width="1.4"/>'
            f'<line x1="65" y1="81" x2="75" y2="81" stroke="#FFFFFF" stroke-width="1.4"/>'
            f'<line x1="65" y1="86" x2="72" y2="86" stroke="#FFFFFF" stroke-width="1.4"/>'
            f"{extra}"
        )
    if n == 2:  # QA Estático lupa
        return (
            f'<circle cx="70" cy="80" r="24" fill="{soft}" stroke="{color}" stroke-width="2"/>'
            f'<circle cx="67" cy="77" r="8" fill="none" stroke="{color}" stroke-width="2.2"/>'
            f'<line x1="74" y1="84" x2="80" y2="90" stroke="{color}" stroke-width="2.5" stroke-linecap="round"/>'
        )
    if n == 5:  # QA Trazabilidad stack 4 CSVs
        return (
            f'<circle cx="70" cy="80" r="24" fill="{soft}" stroke="{color}" stroke-width="2"/>'
            f'<rect x="58" y="68" width="24" height="4" fill="{color}"/>'
            f'<rect x="58" y="74" width="24" height="4" fill="{color}" opacity="0.78"/>'
            f'<rect x="58" y="80" width="24" height="4" fill="{color}" opacity="0.55"/>'
            f'<rect x="58" y="86" width="24" height="4" fill="{color}" opacity="0.32"/>'
        )
    return ""


def _detalle_dinamico(n: int, fase: Optional[Dict]) -> str:
    """Genera el detalle (línea inferior de cada cápsula) leyendo del JSON real."""
    if n == 2 and fase:
        gaps = int(get_metric(fase, "gaps_detectados", 5) or 5)
        cob_i = int(float(get_metric(fase, "cobertura_inicial", 25) or 25))
        cob_f = int(float(get_metric(fase, "cobertura_final", 100) or 100))
        return f"{cob_i} % → {cob_f} % · {gaps} gaps"
    if n == 9 and fase:
        vcr = get_metric(fase, "vcr_total", 11) or 11
        return f"VCR={vcr} → automatizar"
    return FASE_ACTION[n][1]


# ----------------------------------------------------------------------
# Renderers SVG
# ----------------------------------------------------------------------
def render_main_cap(n: int, x_offset: int, fases: List[Dict]) -> str:
    """Cápsula principal (140x300) para F00-F05."""
    fase = get_phase(fases, n)
    meta = FASE_META[n]
    is_hero = n in HERO_PHASES
    action, _ = FASE_ACTION[n]
    detalle = _detalle_dinamico(n, fase)

    color = meta["color"]
    soft = meta["soft"]
    actor = meta["actor"]
    role = meta["role"]
    header_color = meta["header"]
    f_pill = meta["f_pill"]

    halo = ""
    star = ""
    main_stroke = "#E5DCCB"
    main_stroke_w = 1
    role_color = "#8B8170"
    cycle_label = "CICLO INTERNO"
    arrow_color = "#14110F"

    if is_hero:
        halo = '<rect x="-3" y="-3" width="146" height="306" rx="12" fill="#FBF4E3" opacity="0.6"/>'
        star = (
            '<g transform="translate(120, 14)">'
            '<circle r="11" fill="#B8860B" filter="url(#tag-shadow)"/>'
            '<text y="4" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">★</text>'
            '</g>'
        )
        main_stroke = "#B8860B"
        main_stroke_w = 2
        role_color = "#B8860B"
        cycle_label = "CICLO INTERNO ★"
        arrow_color = "#B8860B"

    icon = _render_icon(n, color, soft)

    return (
        f'<g transform="translate({x_offset}, 70)">'
        f'{halo}'
        f'<rect width="140" height="300" rx="10" fill="#FFFFFF" stroke="{main_stroke}" stroke-width="{main_stroke_w}" filter="url(#cap-shadow)"/>'
        f'<rect width="140" height="6" fill="{header_color}"/>'
        f'<g transform="translate(70, 30)">'
        f'<rect x="-22" y="-12" width="44" height="22" rx="4" fill="{f_pill}"/>'
        f'<text x="0" y="3" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#FFFFFF" letter-spacing="0.06em">F{n:02d}</text>'
        f'</g>'
        f'{star}'
        f'{icon}'
        f'<text x="70" y="135" text-anchor="middle" font-family="Newsreader, serif" font-size="17" font-weight="600" font-style="italic" fill="#14110F">{html.escape(actor)}</text>'
        f'<text x="70" y="151" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="700" fill="{role_color}" letter-spacing="0.14em">{html.escape(role)}</text>'
        f'<line x1="20" y1="170" x2="120" y2="170" stroke="#E5DCCB"/>'
        f'<text x="70" y="185" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" font-weight="700" fill="{role_color}" letter-spacing="0.16em">{cycle_label}</text>'
        f'<g transform="translate(0, 200)">'
        f'<rect x="14" y="0" width="32" height="18" rx="9" fill="#1F3A5F"/>'
        f'<text x="30" y="12" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#FFFFFF" letter-spacing="0.04em">DoR</text>'
        f'<line x1="50" y1="9" x2="60" y2="9" stroke="{arrow_color}" stroke-width="1.5" marker-end="url(#arrow-dark)"/>'
        f'<circle cx="70" cy="9" r="9" fill="{soft}" stroke="{arrow_color}" stroke-width="1.5"/>'
        f'<path d="M 65 9 L 69 13 L 76 5" fill="none" stroke="{arrow_color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
        f'<line x1="80" y1="9" x2="90" y2="9" stroke="{arrow_color}" stroke-width="1.5" marker-end="url(#arrow-dark)"/>'
        f'<rect x="94" y="0" width="32" height="18" rx="9" fill="#2D5F3F"/>'
        f'<text x="110" y="12" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#FFFFFF" letter-spacing="0.04em">DoD</text>'
        f'</g>'
        f'<text x="70" y="252" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#14110F">{html.escape(action)}</text>'
        f'<text x="70" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8B8170">{html.escape(detalle)}</text>'
        f'</g>'
    )


def render_bridge(n_origen: int, x_d: int, x_r: int) -> str:
    """Puente entre cápsulas: D port + R port + tag artefacto + 'PASA →'."""
    artefacto = HANDOFF_LABELS.get((n_origen, n_origen + 1), "—")
    x_tag = (x_d + x_r) // 2

    return (
        f'<g transform="translate({x_d}, 220)">'
        f'<circle cx="0" cy="0" r="14" fill="#2D5F3F" stroke="#FFFFFF" stroke-width="2.5" filter="url(#port-shadow)"/>'
        f'<text y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.02em">D</text>'
        f'</g>'
        f'<g transform="translate({x_r}, 220)">'
        f'<circle cx="0" cy="0" r="14" fill="#1F3A5F" stroke="#FFFFFF" stroke-width="2.5" filter="url(#port-shadow)"/>'
        f'<text y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.02em">R</text>'
        f'</g>'
        f'<g transform="translate({x_tag}, 200)" filter="url(#tag-shadow)">'
        f'<rect x="-46" y="-9" width="92" height="18" rx="3" fill="#14110F"/>'
        f'<text y="4" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="600" fill="#FFFFFF">{html.escape(artefacto)}</text>'
        f'</g>'
        f'<text x="{x_tag}" y="184" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" font-weight="700" fill="#B33A1F" letter-spacing="0.16em">PASA →</text>'
    )


def render_mini_cap(n: int, x_offset: int, fases: List[Dict]) -> str:
    """Cápsula chica (240x72) para F06-F09."""
    fase = get_phase(fases, n)
    meta = FASE_META[n]
    actor = meta["actor"]
    role = meta["role"]
    color = meta["color"]
    detalle = _detalle_dinamico(n, fase)

    return (
        f'<g transform="translate({x_offset}, 0)">'
        f'<rect width="240" height="72" rx="6" fill="#FFFFFF" stroke="#E5DCCB" stroke-width="1" filter="url(#cap-shadow)"/>'
        f'<rect width="240" height="4" fill="{color}"/>'
        f'<g transform="translate(20, 30)">'
        f'<rect x="-16" y="-11" width="40" height="20" rx="3" fill="{color}"/>'
        f'<text x="4" y="3" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.06em">F{n:02d}</text>'
        f'</g>'
        f'<text x="52" y="32" font-family="Newsreader, serif" font-size="15" font-weight="600" font-style="italic" fill="#14110F">{html.escape(actor)}</text>'
        f'<text x="52" y="50" font-family="JetBrains Mono, monospace" font-size="9" font-weight="700" fill="#8B8170" letter-spacing="0.1em">{html.escape(role)}</text>'
        f'<text x="52" y="63" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#8B8170">{html.escape(detalle)}</text>'
        f'<g transform="translate(192, 36)">'
        f'<circle cx="-14" cy="0" r="9" fill="#1F3A5F"/>'
        f'<text x="-14" y="3" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="800" fill="#FFFFFF">R</text>'
        f'<text x="0" y="3" text-anchor="middle" font-size="11" font-weight="700" fill="#B33A1F">→</text>'
        f'<circle cx="14" cy="0" r="9" fill="#2D5F3F"/>'
        f'<text x="14" y="3" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="800" fill="#FFFFFF">D</text>'
        f'</g>'
        f'</g>'
    )


# ----------------------------------------------------------------------
# CSS embebido (paleta papel + tierra + colores por actor)
# ----------------------------------------------------------------------
CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:           #14110F;
  --ink-2:         #2A2520;
  --paper:         #FAF6F0;
  --paper-2:       #FFFFFF;
  --paper-3:       #F3ECE0;
  --rule:          #E5DCCB;
  --rule-strong:   #C9BBA8;
  --text-1:        #14110F;
  --text-2:        #524A40;
  --text-3:        #8B8170;
  --accent:        #B33A1F;
  --accent-2:      #8E2A12;
  --accent-soft:   #FBEEE7;
  --gold:          #B8860B;
  --gold-soft:     #FBF4E3;
  --c-cliente:     #B8860B;
  --c-analista:    #6B3FA0;
  --c-qa:          #1F3A5F;
  --c-devops:      #2D5F3F;
  --c-pm:          #B33A1F;
  --c-equipo:      #0E6B7C;
  --c-dor:         #1F3A5F;
  --c-dor-soft:    #E5ECF4;
  --c-dod:         #2D5F3F;
  --c-dod-soft:    #E8F0E9;
  --serif: 'Newsreader', Georgia, serif;
  --sans:  'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mono:  'JetBrains Mono', 'SF Mono', Consolas, monospace;
  --shadow-sm: 0 1px 2px rgba(20,17,15,.04), 0 0 0 1px rgba(20,17,15,.04);
  --shadow-md: 0 8px 20px -4px rgba(20,17,15,.10), 0 0 0 1px rgba(20,17,15,.05);
  --shadow-lg: 0 24px 60px -12px rgba(20,17,15,.20), 0 0 0 1px rgba(20,17,15,.06);
}

html, body {
  background: var(--paper);
  color: var(--text-1);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.serif { font-family: var(--serif); }
.mono  { font-family: var(--mono); }

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, rgba(20,17,15,.045) 1px, transparent 0);
  background-size: 24px 24px;
  z-index: 0;
}

.lamina {
  position: relative;
  z-index: 1;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bar {
  display: flex; align-items: center; gap: 18px;
  padding: 10px 18px;
  background: var(--paper-2); border: 1px solid var(--rule);
  border-radius: 8px; box-shadow: var(--shadow-sm);
}
.bar-brand {
  display: inline-flex; align-items: center; gap: 12px;
  font-family: var(--serif); font-size: 16px; font-weight: 600;
  letter-spacing: -0.01em; color: var(--ink);
}
.bar-mark {
  width: 28px; height: 28px;
  background: var(--accent); border-radius: 5px;
  color: #fff; display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 13px; font-weight: 800;
}
.bar-brand .sub {
  color: var(--text-2); font-weight: 500;
  font-family: var(--sans); font-size: 13.5px; margin-left: 4px;
}
.bar-meta {
  margin-left: auto; display: flex; gap: 22px;
  font-family: var(--mono); font-size: 11px;
  color: var(--text-3); letter-spacing: 0.04em; align-items: center;
}
.bar-meta strong { color: var(--ink); font-weight: 700; }
.bar-meta .ok { color: var(--c-dod); font-weight: 700; }
.bar-cta {
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #fff; background: var(--ink); padding: 7px 14px; border-radius: 999px;
}

.hero {
  display: grid; grid-template-columns: 1fr 420px;
  gap: 36px; align-items: stretch;
}
.hero-left { padding: 18px 4px 4px; }
.hero-eyebrow {
  font-family: var(--mono); font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 16px;
  display: inline-flex; align-items: center; gap: 12px;
}
.hero-eyebrow::before {
  content: ""; display: inline-block;
  width: 32px; height: 1.5px; background: var(--accent);
}
.hero-h1 {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(30px, 3.4vw, 46px);
  line-height: 1.04; letter-spacing: -0.025em; color: var(--ink);
}
.hero-h1 em { font-style: italic; color: var(--accent); }
.hero-h1 .underline {
  position: relative; display: inline-block; font-style: italic;
}
.hero-h1 .underline::after {
  content: ""; position: absolute;
  left: 0; right: 0; bottom: 4px; height: 8px;
  background: var(--gold-soft); z-index: -1;
}

.hero-card {
  background: var(--ink); color: #fff;
  padding: 22px 24px; border-radius: 8px;
  position: relative; box-shadow: var(--shadow-md);
  display: flex; flex-direction: column; justify-content: center;
}
.hero-card::before {
  content: ""; position: absolute;
  top: 0; left: 24px; right: 24px; height: 4px;
  background: linear-gradient(90deg, var(--c-dod) 0%, var(--accent) 50%, var(--c-dor) 100%);
  border-radius: 0 0 4px 4px;
}
.hero-card-eyebrow {
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,.5); margin-bottom: 10px;
}
.hero-quote {
  font-family: var(--serif); font-style: italic;
  font-size: 19px; line-height: 1.35; font-weight: 400;
  margin-bottom: 12px; letter-spacing: -0.012em;
}
.hero-quote .hi   { color: var(--c-dod-soft); font-style: normal; font-weight: 600; padding: 0 4px; background: rgba(45,95,63,.42); border-radius: 2px; }
.hero-quote .hi-2 { color: var(--c-dor-soft); font-style: normal; font-weight: 600; padding: 0 4px; background: rgba(31,58,95,.55); border-radius: 2px; }
.hero-attr {
  font-family: var(--mono); font-size: 10px;
  color: rgba(255,255,255,.55); letter-spacing: 0.06em;
  border-top: 1px solid rgba(255,255,255,.12); padding-top: 10px;
}

.diagram-card {
  background: var(--paper-2); border: 1px solid var(--rule);
  border-radius: 12px; box-shadow: var(--shadow-lg); overflow: hidden;
}
.diagram-band {
  background: var(--ink); color: #fff;
  padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; border-bottom: 4px solid var(--accent); flex-wrap: wrap;
}
.diagram-band-title {
  font-family: var(--serif); font-weight: 500;
  font-size: 17px; letter-spacing: -0.01em;
}
.diagram-band-title em { color: var(--accent); font-style: italic; }
.diagram-band-meta {
  display: flex; gap: 18px;
  font-family: var(--mono); font-size: 10.5px;
  color: rgba(255,255,255,.6); letter-spacing: 0.04em; flex-wrap: wrap;
}
.diagram-band-meta strong { color: #fff; font-weight: 700; }

.diagram-svg-wrap {
  padding: 18px 22px 6px; background: var(--paper-2);
}
.diagram-svg { display: block; width: 100%; height: auto; }

.diagram-legend {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 10px 22px; padding: 10px 24px 14px;
  background: var(--paper); border-top: 1px solid var(--rule);
  font-size: 12px; color: var(--text-2);
}
.diagram-legend .leg { display: inline-flex; align-items: center; gap: 8px; }
.leg-dot-r, .leg-dot-d {
  width: 18px; height: 18px; border-radius: 50%;
  color: #fff; display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 10px; font-weight: 800;
}
.leg-dot-r { background: var(--c-dor); }
.leg-dot-d { background: var(--c-dod); }
.leg-tag {
  display: inline-block; padding: 3px 8px;
  background: var(--ink); color: #fff; border-radius: 3px;
  font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.04em;
}
.leg-star {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--gold); color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}
.leg-divider { width: 1px; height: 18px; background: var(--rule-strong); }

.bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

.stats-row {
  display: grid; grid-template-columns: repeat(5, 1fr);
  background: var(--paper-2); border: 1px solid var(--rule);
  border-radius: 8px; box-shadow: var(--shadow-sm); overflow: hidden;
}
.stat {
  padding: 14px 14px 12px;
  border-right: 1px solid var(--rule); position: relative;
}
.stat:last-child { border-right: none; }
.stat::before {
  content: ""; position: absolute;
  top: 0; left: 0; right: 0; height: 2px; background: var(--rule-strong);
}
.stat.green::before  { background: var(--c-dod); }
.stat.accent::before { background: var(--accent); }
.stat.gold::before   { background: var(--gold); }

.stat-tag {
  font-family: var(--mono); font-size: 9px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-3); margin-bottom: 6px;
}
.stat-val {
  font-family: var(--serif); font-weight: 500;
  font-size: 28px; line-height: 1;
  letter-spacing: -0.025em; color: var(--ink);
  font-feature-settings: "lnum", "tnum";
  display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;
}
.stat-val .from  { font-size: 16px; color: var(--text-3); font-style: italic; font-weight: 400; }
.stat-val .arrow { font-family: var(--sans); font-size: 13px; color: var(--accent); font-weight: 700; }
.stat.green  .stat-val { color: var(--c-dod); }
.stat.gold   .stat-val { color: var(--gold); }
.stat.accent .stat-val { color: var(--accent); }
.stat-cap {
  font-size: 11px; color: var(--text-2);
  line-height: 1.4; margin-top: 4px;
}
.stat-cap strong { color: var(--ink); font-weight: 600; }

.side-card {
  background: var(--paper-2); border: 1px solid var(--rule);
  border-radius: 8px; box-shadow: var(--shadow-sm);
  padding: 14px 18px 12px;
  display: flex; flex-direction: column; justify-content: space-between; gap: 10px;
}
.side-eyebrow {
  font-family: var(--mono); font-size: 9.5px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 4px;
}
.standards-row { display: flex; flex-wrap: wrap; gap: 6px; }
.std-pill {
  font-family: var(--mono); font-size: 10px; font-weight: 600;
  letter-spacing: 0.04em; padding: 5px 10px; border-radius: 999px;
  background: var(--paper); color: var(--text-2);
  border: 1px solid var(--rule); white-space: nowrap;
}
.std-pill strong { color: var(--ink); font-weight: 700; }

.side-footer {
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  padding-top: 10px; border-top: 1px solid var(--rule);
  font-family: var(--mono); font-size: 10px;
  color: var(--text-3); letter-spacing: 0.04em;
}
.side-footer strong { color: var(--ink); font-weight: 600; }
.side-footer .brand-tail {
  font-family: var(--serif); font-style: italic;
  font-size: 11.5px; font-weight: 500;
  color: var(--ink); letter-spacing: -0.01em;
}
.side-footer .brand-tail em { color: var(--accent); }

@media (max-width: 1180px) {
  .hero { grid-template-columns: 1fr; }
  .bottom { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .lamina { padding: 16px 14px 24px; }
  .bar-meta { display: none; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .stat { border-right: none; border-bottom: 1px solid var(--rule); }
}
@media print {
  body::before { display: none; }
  body { background: #fff; }
  .lamina { padding: 8mm 8mm; }
  .diagram-card, .stats-row, .side-card, .hero-card, .bar { box-shadow: none; }
  @page { size: A3 landscape; margin: 8mm; }
}
"""


# ----------------------------------------------------------------------
# Render HTML completo
# ----------------------------------------------------------------------
def render_html(fases: List[Dict]) -> str:
    f02 = get_phase(fases, 2)
    f05 = get_phase(fases, 5)
    f09 = get_phase(fases, 9)

    cob_i = int(float(get_metric(f02, "cobertura_inicial", 25) or 25))
    cob_f = int(float(get_metric(f02, "cobertura_final", 100) or 100))
    gaps = int(get_metric(f02, "gaps_detectados", 5) or 5)
    tcs = int(get_metric(f05, "filas_test_case", 23) or 23)
    vcr = get_metric(f09, "vcr_total", 11) or 11

    duracion = sum(
        (f.get("dod") or {}).get("duracion_segundos", 0)
        for f in fases if f.get("estado") == "completado"
    )
    duracion_str = fmt_duration(duracion)

    hu_id = next((f.get("hu_id", "") for f in fases if f.get("hu_id")), "—")
    fecha = datetime.now().strftime("%Y-%m-%d")

    # Cápsulas principales F00-F05 (140px width, 100px gap → step = 240)
    caps_main = "".join(render_main_cap(n, n * 240, fases) for n in range(6))

    # Líneas conectoras entre cápsulas (5 puentes)
    bridge_lines = "".join(
        f'<line x1="{154 + n*240}" y1="220" x2="{226 + n*240}" y2="220" stroke-linecap="round"/>'
        for n in range(5)
    )

    # Puertos D/R + tag artefacto + "PASA →" para los 5 puentes
    bridges = "".join(
        render_bridge(n, 140 + n * 240, 240 + n * 240) for n in range(5)
    )

    # Mini-cápsulas F06-F09 (240px width, 84px gap → step = 324)
    mini_caps = "".join(
        render_mini_cap(n, (n - 6) * 324, fases) for n in range(6, 10)
    )

    # Flechas entre mini-cápsulas (3 flechas)
    mini_arrows = "".join(
        f'<text x="{262 + i*324}" y="42" font-size="20" fill="#B33A1F" font-weight="700">→</text>'
        for i in range(3)
    )

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QASL · Engranaje DoR/DoD entre 6 actores</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500;1,6..72,600&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>

<div class="lamina">

  <div class="bar">
    <span class="bar-brand">
      <span class="bar-mark">Q</span>
      QASL Framework
      <span class="sub">/ Master View · DoR/DoD encadenado</span>
    </span>
    <div class="bar-meta">
      <span><strong>{html.escape(hu_id)}</strong></span>
      <span class="ok">10 / 10 fases ✓</span>
      <span>{html.escape(duracion_str)}</span>
      <span>{fecha}</span>
    </div>
    <span class="bar-cta">Cobertura {cob_f}%</span>
  </div>

  <header class="hero">
    <div class="hero-left">
      <div class="hero-eyebrow">QASL · Quality Assurance Shift-Left</div>
      <h1 class="hero-h1 serif">
        Calidad no es una <em>herramienta</em>.<br>
        Es un <span class="underline">engranaje</span> entre <em>seis actores</em><br>
        donde nadie trabaja solo.
      </h1>
    </div>
    <aside class="hero-card">
      <div class="hero-card-eyebrow">La regla del framework</div>
      <p class="hero-quote serif">
        El <span class="hi">DoD</span> de un actor <em>es</em> el <span class="hi-2">DoR</span> del siguiente. Sin DoD cerrado, no hay avance.
      </p>
      <div class="hero-attr">
        — QASL · contrato blindado entre roles
      </div>
    </aside>
  </header>

  <section class="diagram-card">
    <div class="diagram-band">
      <div class="diagram-band-title serif">
        Engranaje DoR/DoD <em>—</em> 6 actores · 10 fases · 9 handoffs blindados
      </div>
      <div class="diagram-band-meta">
        <span>HU · <strong>{html.escape(hu_id)}</strong></span>
        <span>Cobertura · <strong>{cob_i} % → {cob_f} %</strong></span>
        <span>Decisión · <strong>VCR = {vcr} → Auto</strong></span>
      </div>
    </div>

    <div class="diagram-svg-wrap">
      <svg class="diagram-svg" viewBox="0 0 1340 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="cap-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.10"/>
          </filter>
          <filter id="port-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.20"/>
          </filter>
          <filter id="tag-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.16"/>
          </filter>
          <marker id="arrow-dark" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#14110F"/>
          </marker>
        </defs>

        <g transform="translate(0, 18)">
          <text x="0" y="14" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#B33A1F" letter-spacing="0.22em">SHIFT-LEFT  ←</text>
          <line x1="0" y1="34" x2="1340" y2="34" stroke="#C9BBA8" stroke-width="1" stroke-dasharray="3 4"/>
          <path d="M 122 26 L 122 34 L 1240 34 L 1240 26" fill="none" stroke="#14110F" stroke-width="1.5"/>
          <text x="681" y="20" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#14110F" letter-spacing="0.2em">PRE-CÓDIGO  ·  REQUERIMIENTOS Y CRITERIOS DE PRUEBA</text>
          <text x="1340" y="14" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#8B8170" letter-spacing="0.22em">→  CÓDIGO</text>
        </g>

        <g stroke="#B33A1F" stroke-width="2.5">{bridge_lines}</g>

        {caps_main}

        {bridges}

        <g transform="translate(0, 400)">
          <line x1="0" y1="0" x2="1340" y2="0" stroke="#E5DCCB" stroke-width="1"/>
          <text x="0" y="20" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#B33A1F" letter-spacing="0.18em">CONTINÚA EN POST-CÓDIGO  →</text>
          <text x="1340" y="20" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#8B8170" letter-spacing="0.18em">PREPARACIÓN AL DEV</text>
        </g>

        <g transform="translate(64, 440)">
          {mini_caps}
          {mini_arrows}
        </g>

        <g transform="translate(0, 530)">
          <text x="0" y="0" font-family="Newsreader, serif" font-style="italic" font-size="13" fill="#14110F">
            <tspan font-weight="700" fill="#B33A1F">10 fases</tspan> · <tspan font-weight="700">6 actores</tspan> · <tspan font-weight="700">9 handoffs DoD→DoR</tspan> · ejecutados en <tspan font-weight="700" font-family="JetBrains Mono, monospace" font-size="12">{html.escape(duracion_str)}</tspan>
          </text>
          <text x="1340" y="0" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#8B8170" letter-spacing="0.16em">QASL · MASTER VIEW</text>
        </g>

      </svg>
    </div>

    <div class="diagram-legend">
      <div class="leg"><span class="leg-dot-d">D</span><span><strong>DoD</strong> — Definition of Done · <em>se cierra al entregar el artefacto</em></span></div>
      <div class="leg-divider"></div>
      <div class="leg"><span class="leg-dot-r">R</span><span><strong>DoR</strong> — Definition of Ready · <em>se abre al recibir el artefacto válido</em></span></div>
      <div class="leg-divider"></div>
      <div class="leg"><span class="leg-tag">artefacto</span><span>lo que efectivamente <strong>cambia de manos</strong></span></div>
      <div class="leg-divider"></div>
      <div class="leg"><span class="leg-star">★</span><span>fase ejecutada por el <strong>QA con Claude AI</strong></span></div>
    </div>
  </section>

  <div class="bottom">
    <div class="stats-row">
      <div class="stat green">
        <div class="stat-tag">Cobertura BR</div>
        <div class="stat-val"><span class="from">{cob_i}%</span><span class="arrow">→</span>{cob_f}%</div>
        <div class="stat-cap"><strong>+{cob_f - cob_i} pts</strong> antes del primer commit</div>
      </div>
      <div class="stat accent">
        <div class="stat-tag">Gaps detectados</div>
        <div class="stat-val">{gaps}</div>
        <div class="stat-cap">Brechas <strong>invisibles al ojo humano</strong></div>
      </div>
      <div class="stat">
        <div class="stat-tag">Test Cases pre-código</div>
        <div class="stat-val">{tcs}</div>
        <div class="stat-cap">Trazables <strong>US → TS → PRC → TC</strong></div>
      </div>
      <div class="stat gold">
        <div class="stat-tag">VCR (ISO 31000)</div>
        <div class="stat-val">{html.escape(str(vcr))}</div>
        <div class="stat-cap"><strong>≥ 9 → Automatizar</strong></div>
      </div>
      <div class="stat">
        <div class="stat-tag">Actores · fases</div>
        <div class="stat-val">6 <span class="from">·</span> 10</div>
        <div class="stat-cap">Cada uno con <strong>su propio ciclo DoR/DoD</strong></div>
      </div>
    </div>

    <div class="side-card">
      <div>
        <div class="side-eyebrow">Alineado a estándares públicos vigentes</div>
        <div class="standards-row">
          <span class="std-pill"><strong>ISTQB</strong> CTFL v4.0</span>
          <span class="std-pill"><strong>ISO/IEC/IEEE</strong> 29119-3</span>
          <span class="std-pill"><strong>ISO/IEC/IEEE</strong> 29148</span>
          <span class="std-pill"><strong>OWASP</strong> Top 10</span>
          <span class="std-pill"><strong>ISO 31000</strong> Risk Mgmt</span>
          <span class="std-pill"><strong>IEEE</strong> 1028</span>
        </div>
      </div>
      <div class="side-footer">
        <span class="brand-tail">QASL · <em>Quality Assurance Shift-Left</em></span>
        <span><strong>{html.escape(hu_id)}</strong> · {fecha} · MIT</span>
      </div>
    </div>
  </div>

</div>

</body>
</html>
"""


# ----------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------
def main() -> None:
    print("\n" + "=" * 60)
    print("RENDER DASHBOARD — Lámina Editorial QASL")
    print("=" * 60)

    fases = cargar_fases()
    print(f"\n  Gap charts encontrados: {len(fases)}")
    for f in fases:
        n = f.get("fase", 0)
        actor = f.get("actor", "?")
        is_hero = n in HERO_PHASES
        marca = "★" if is_hero else "✓"
        print(f"   {marca} F{n:02d}  {actor}")

    OUTPUT_HTML.write_text(render_html(fases), encoding="utf-8")

    print("\n  Dashboard generado:")
    print(f"     {OUTPUT_HTML}")
    print("\n  Abrilo:")
    print(f"     start {OUTPUT_HTML}")
    print("\n" + "=" * 60)
    print("[OK] LÁMINA LISTA")
    print("=" * 60)


if __name__ == "__main__":
    main()
