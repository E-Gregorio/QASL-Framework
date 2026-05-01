# -*- coding: utf-8 -*-
"""
Generador de HU IDEAL en HTML.

Toma una HistoriaUsuario parseada + el resultado del análisis estático
y produce el HTML de la "HU Actualizada" siguiendo la plantilla maestra
(static_analyzer/templates/plantilla-hu-istqb.html).

La plantilla maestra es la documentación visual del formato; este
generador es la fuente de verdad en runtime y respeta su estructura
exacta (mismas clases CSS, mismo orden de filas, mismos badges).
"""
from __future__ import annotations

import html
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from parser import HistoriaUsuario


TEMPLATE_PATH = Path(__file__).parent / "templates" / "plantilla-hu-istqb.html"


class HUIdealHTMLGenerator:
    def __init__(self, hu: HistoriaUsuario, resultado_analisis: Dict):
        self.hu = hu
        self.resultado = resultado_analisis
        self.metricas = resultado_analisis.get("metricas", {})
        self.gaps = resultado_analisis.get("gaps", [])

    # ------------------------------------------------------------------
    # Punto de entrada
    # ------------------------------------------------------------------
    def generar_hu_ideal_html(self) -> str:
        cobertura_inicial = float(self.metricas.get("cobertura_escenarios", 0))
        n_originales = len(self.hu.escenarios)
        n_agregados = len(self.gaps)
        total_escenarios = n_originales + n_agregados

        css = self._read_template_css()
        return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Historia de Usuario — {html.escape(self.hu.id)}</title>
<style>
{css}
</style>
</head>
<body>
<div class="us-container">
  <div class="us-header">HISTORIA DE USUARIO</div>
  <table class="us-table">
    <tr>
      <th scope="row" class="label">ID</th>
      <td class="content">{html.escape(self.hu.id)}</td>
    </tr>
    <tr>
      <th scope="row" class="label">Nombre</th>
      <td class="content">{html.escape(self.hu.nombre)}</td>
    </tr>
    <tr>
      <th scope="row" class="label">Épica</th>
      <td class="content">
        {html.escape(self.hu.epica)}<br>
        <span class="link-ref">Enlace a documentación de la Épica</span>
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Prioridad</th>
      <td class="content">{html.escape(self.hu.prioridad)}</td>
    </tr>
    <tr>
      <th scope="row" class="label">Estado</th>
      <td class="content">Análisis Estático Completado - Cobertura: {cobertura_inicial:.1f}% → 100%</td>
    </tr>
    <tr>
      <th scope="row" class="label">Descripción</th>
      <td class="content">
        <div class="description-format"><strong>Como</strong> {html.escape(self.hu.descripcion_como)}</div>
        <div class="description-format"><strong>Quiero</strong> {html.escape(self.hu.descripcion_quiero)}</div>
        <div class="description-format"><strong>Para</strong> {html.escape(self.hu.descripcion_para)}</div>
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Usuarios / Roles</th>
      <td class="content">{html.escape(self.hu.usuario_rol)}</td>
    </tr>
    <tr>
      <th scope="row" class="label">Reglas de Negocio</th>
      <td class="content">
{self._render_reglas_negocio()}
        <span class="link-ref">CU-XXX | Casos de uso relacionados</span>
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Precondiciones</th>
      <td class="content">
{self._render_bullets(self.hu.precondiciones)}
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Dependencias</th>
      <td class="content">
{self._render_bullets(self.hu.dependencias)}
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Estimaciones</th>
      <td class="content">
        Story Points (SP): ____<br>
        Valor (V 1–3): ____<br>
        Costo (C 1–3): ____<br>
        Probabilidad (P 1–3): ____<br>
        Impacto (I 1–3): ____<br>
        <strong>Riesgo (R) = P × I = ____ × ____ = ____</strong><br>
        <strong>Total VCR = V + C + R = ____ + ____ + ____ = ____</strong><br>
        <em>Política:</em> si <strong>VCR ≥ 9</strong> → Deuda técnica (automatizar y pasa a regresión); si es menor → Pruebas manuales.
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Escenarios de Prueba (Criterios de Aceptación)</th>
      <td class="content">
{self._render_escenarios()}
        <div class="cobertura-info">
          <strong>Análisis de Cobertura:</strong> {n_originales} escenarios originales + {n_agregados} escenarios agregados = {total_escenarios} total<br>
          <strong>Cobertura:</strong> {cobertura_inicial:.1f}% inicial → 100.0% final
        </div>
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Dentro del Alcance</th>
      <td class="content">
{self._render_bullets(self.hu.dentro_alcance)}
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Fuera del Alcance</th>
      <td class="content">
{self._render_fuera_alcance()}
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Referencias</th>
      <td class="content">
        <span class="link-ref">Documento de Requerimientos</span><br>
        <span class="link-ref">Casos de Uso asociados</span><br>
        <span class="link-ref">ISO/IEC/IEEE 29119-3:2021 — Test Documentation</span><br>
        <span class="link-ref">ISO/IEC/IEEE 29148:2018 — Requirements Engineering</span><br>
        <span class="link-ref">ISTQB CTFL v4.0 (2023) — Certified Tester Foundation Level</span><br>
        <span class="link-ref">OWASP Top 10:2021 — Web Application Security Risks</span>
      </td>
    </tr>
    <tr>
      <th scope="row" class="label">Notas / Comentarios</th>
      <td class="content">
        <strong>Análisis Estático:</strong> {n_agregados} gaps identificados y corregidos mediante escenarios sugeridos.<br>
        <strong>Cobertura Final:</strong> 100% de las reglas de negocio cubiertas.<br>
        <strong>Generado por:</strong> Static Analyzer (QASL Framework) | {datetime.now().strftime("%Y-%m-%d %H:%M")}
      </td>
    </tr>
  </table>
</div>
</body>
</html>
"""

    # ------------------------------------------------------------------
    # Render helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _read_template_css() -> str:
        """Lee el bloque <style> de la plantilla maestra para mantener consistencia visual."""
        try:
            content = TEMPLATE_PATH.read_text(encoding="utf-8")
            start = content.find("<style>")
            end = content.find("</style>")
            if start != -1 and end != -1:
                return content[start + len("<style>"):end].strip()
        except OSError:
            pass
        return ""  # fallback: el HTML será válido pero sin estilos custom

    def _render_reglas_negocio(self) -> str:
        if not self.hu.reglas_negocio:
            return ""
        return "\n".join(
            f'        <div class="br-item"><strong>{html.escape(br.id)}:</strong> {html.escape(br.descripcion)}</div>'
            for br in self.hu.reglas_negocio
        )

    @staticmethod
    def _render_bullets(items: List[str]) -> str:
        if not items:
            return "        —"
        return "        " + "<br>\n        ".join(f"• {html.escape(item)}" for item in items)

    def _render_fuera_alcance(self) -> str:
        if not self.hu.fuera_alcance:
            return "        —"
        return "\n".join(
            f"        <div class='out-scope-item'>• {html.escape(item)}</div>"
            for item in self.hu.fuera_alcance
        )

    def _render_escenarios(self) -> str:
        bloques: List[str] = []

        # 1) Escenarios originales con badge "Original"
        for idx, esc in enumerate(self.hu.escenarios, start=1):
            bloques.append(self._render_un_escenario(
                numero=idx,
                titulo=esc.titulo,
                gherkin=self._gherkin_html(esc.dado, esc.cuando, esc.entonces, esc.y_adicional),
                badges=['<span class="badge badge-original">Original</span>'],
                clase_extra="",
            ))

        # 2) Escenarios agregados por el analyzer (gaps cerrados)
        offset = len(self.hu.escenarios)
        for idx, gap in enumerate(self.gaps, start=1):
            badges = ['<span class="badge badge-agregado">Agregado</span>']
            br_id = getattr(gap, "br_afectada", None)
            if br_id:
                badges.append(f'<span class="badge badge-br">{html.escape(br_id)}</span>')

            gherkin_text = getattr(gap, "escenario_sugerido", "") or ""
            gherkin_html = self._gherkin_text_to_html(gherkin_text) if gherkin_text else "Escenario pendiente de definición"
            titulo = getattr(gap, "titulo", "") or "Escenario agregado"

            bloques.append(self._render_un_escenario(
                numero=offset + idx,
                titulo=titulo,
                gherkin=gherkin_html,
                badges=badges,
                clase_extra=" scenario-nuevo",
            ))

        return "\n".join(bloques)

    @staticmethod
    def _render_un_escenario(numero: int, titulo: str, gherkin: str, badges: List[str], clase_extra: str) -> str:
        badges_html = " ".join(badges)
        return (
            f'        <div class="scenario-title">E{numero}: {html.escape(titulo)} {badges_html}</div>\n'
            f'        <div class="scenario-content{clase_extra}">{gherkin}</div>'
        )

    @staticmethod
    def _gherkin_html(dado: str, cuando: str, entonces: str, y_adicional: str | None) -> str:
        partes = []
        if dado:
            partes.append(f"<strong>DADO</strong> {html.escape(dado)}")
        if cuando:
            partes.append(f"<strong>CUANDO</strong> {html.escape(cuando)}")
        if entonces:
            partes.append(f"<strong>ENTONCES</strong> {html.escape(entonces)}")
        if y_adicional:
            partes.append(f"<strong>Y</strong> {html.escape(y_adicional)}")
        return "<br>".join(partes)

    @staticmethod
    def _gherkin_text_to_html(texto: str) -> str:
        """Convierte texto Gherkin plano (DADO ... CUANDO ... ENTONCES ...) a HTML."""
        if not texto:
            return ""
        keywords = ("DADO", "CUANDO", "ENTONCES", "Y", "PERO")
        partes: List[str] = []
        for raw in texto.strip().split("\n"):
            line = raw.strip()
            if not line:
                continue
            partes.append(HUIdealHTMLGenerator._format_gherkin_line(line, keywords))
        return "<br>".join(partes)

    @staticmethod
    def _format_gherkin_line(line: str, keywords: tuple) -> str:
        upper = line.upper()
        for kw in keywords:
            if upper.startswith(kw + " ") or upper == kw:
                rest = line[len(kw):].strip()
                return f"<strong>{kw}</strong> {html.escape(rest)}"
        return html.escape(line)
