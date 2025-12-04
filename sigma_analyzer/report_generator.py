# -*- coding: utf-8 -*-
"""
Generador de Reportes de Pruebas Estaticas - Formato Profesional v3.0
CON emojis de semaforo y brechas para claridad visual
Basado en: IEEE 1028, SonarQube, Allure Report
"""
from datetime import datetime
from typing import Dict, List
from parser import HistoriaUsuario


class ReportGenerator:
    """Generador de reportes profesionales estilo SonarQube/Allure"""

    def __init__(self, hu: HistoriaUsuario, resultado_analisis: Dict):
        self.hu = hu
        self.resultado = resultado_analisis
        self.metricas = resultado_analisis['metricas']
        self.coberturas = resultado_analisis['coberturas']
        self.gaps = resultado_analisis['gaps']

    def generar_reporte(self) -> str:
        """Genera reporte ejecutivo de resultados"""
        secciones = [
            self._header(),
            self._semaforo_status(),
            self._dashboard(),
            self._resumen_brechas(),
            self._coverage_matrix(),
            self._issues_detalle(),
            self._escenarios_sugeridos(),
            self._footer()
        ]
        return '\n'.join(secciones)

    def _header(self) -> str:
        """Header del reporte con emojis"""
        estado = self._calcular_estado()
        if estado == "PASSED":
            emoji_estado = "✅"
        elif estado == "WARNING":
            emoji_estado = "⚠️"
        else:
            emoji_estado = "❌"

        return f"""# 📊 Reporte de Análisis Estático

| Campo | Valor |
|-------|-------|
| **Proyecto** | SIGMA |
| **HU Analizada** | {self.hu.id} - {self.hu.nombre} |
| **Épica** | {self.hu.epica} |
| **Fecha** | {datetime.now().strftime("%Y-%m-%d %H:%M")} |
| **Estado** | {emoji_estado} **{estado}** |
| **Analizador** | SIGMA Static Analyzer v3.0 AI |

---
"""

    def _semaforo_status(self) -> str:
        """Semáforo visual de estado con emojis"""
        criticos = sum(1 for g in self.gaps if g.tipo == "CRITICO")
        altos = sum(1 for g in self.gaps if g.tipo == "ALTO")
        medios = sum(1 for g in self.gaps if g.tipo == "MEDIO")
        bajos = sum(1 for g in self.gaps if g.tipo == "BAJO")
        cobertura = self.metricas['cobertura_escenarios']

        # Determinar semáforo
        if criticos > 0:
            semaforo = "🔴 ROJO"
            descripcion = "BLOQUEADO - Gaps críticos detectados que requieren atención inmediata"
        elif altos > 0 or cobertura < 50:
            semaforo = "🟡 AMARILLO"
            descripcion = "ADVERTENCIA - Gaps altos detectados o cobertura insuficiente"
        elif len(self.gaps) == 0:
            semaforo = "🟢 VERDE"
            descripcion = "APROBADO - Cobertura completa sin gaps"
        else:
            semaforo = "🟡 AMARILLO"
            descripcion = "ADVERTENCIA - Gaps menores detectados"

        # Barra de progreso visual
        filled = int(cobertura / 5)
        bar = "█" * filled + "░" * (20 - filled)

        return f"""## 🚦 SEMÁFORO DE ESTADO

| Indicador | Valor |
|-----------|-------|
| **Estado** | {semaforo} |
| **Cobertura** | `[{bar}]` **{cobertura:.1f}%** |
| **Descripción** | {descripcion} |

### 📈 Resumen de Gaps por Severidad

| Severidad | Emoji | Cantidad |
|-----------|-------|----------|
| 🔴 CRÍTICO | Bloqueante | **{criticos}** |
| 🟠 ALTO | Importante | **{altos}** |
| 🟡 MEDIO | Moderado | **{medios}** |
| 🟢 BAJO | Menor | **{bajos}** |
| **TOTAL** | | **{len(self.gaps)}** |

---
"""

    def _dashboard(self) -> str:
        """Dashboard con métricas - Formula: 1 BR = 2 Escenarios"""
        escenarios_necesarios = self.metricas.get('escenarios_necesarios', self.metricas['total_brs'] * 2)

        return f"""## 📊 DASHBOARD DE MÉTRICAS

| Métrica | Valor | Fórmula |
|---------|-------|---------|
| 📋 Reglas de Negocio (BRs) | {self.metricas['total_brs']} | - |
| 📝 Escenarios Necesarios | {escenarios_necesarios} | BRs × 2 (1 positivo + 1 negativo) |
| 🧪 Escenarios Documentados | {self.metricas['total_escenarios_documentados']} | - |
| ✅ Escenarios Positivos | {self.metricas.get('escenarios_positivos_encontrados', 'N/A')} | - |
| ❌ Escenarios Negativos | {self.metricas.get('escenarios_negativos_encontrados', 'N/A')} | - |
| ⚠️ Gaps (Escenarios Faltantes) | {len(self.gaps)} | Necesarios - Documentados |
| ✅ BRs con 100% Cobertura | {self.metricas.get('brs_100_cobertura', 0)} | Tiene positivo Y negativo |
| 🟡 BRs con 50% Cobertura | {self.metricas.get('brs_cobertura_parcial', 0)} | Solo positivo O solo negativo |
| 🔴 BRs sin Cobertura | {self.metricas.get('brs_sin_cobertura', 0)} | Sin escenarios |

---
"""

    def _resumen_brechas(self) -> str:
        """Resumen visual de brechas encontradas"""
        if not self.gaps:
            return """## ✅ BRECHAS IDENTIFICADAS

No se identificaron brechas. Todas las reglas de negocio tienen cobertura completa.

---
"""

        lines = ["## 🔍 BRECHAS IDENTIFICADAS\n"]
        lines.append("| # | BR | Tipo | Severidad | Descripción |")
        lines.append("|---|-----|------|-----------|-------------|")

        for i, gap in enumerate(self.gaps, 1):
            emoji_sev = {"CRITICO": "🔴", "ALTO": "🟠", "MEDIO": "🟡", "BAJO": "🟢"}.get(gap.tipo, "⚪")
            razon = ""
            if hasattr(gap, 'razon_gap') and gap.razon_gap:
                razon = {
                    "sin_escenarios": "Sin escenarios de prueba",
                    "solo_positivo": "Falta caso negativo",
                    "solo_negativo": "Falta caso positivo"
                }.get(gap.razon_gap, gap.razon_gap)

            titulo_corto = gap.titulo[:40] + "..." if len(gap.titulo) > 40 else gap.titulo
            lines.append(f"| {i} | {gap.br_afectada} | {razon} | {emoji_sev} {gap.tipo} | {titulo_corto} |")

        lines.append("\n---\n")
        return '\n'.join(lines)

    def _coverage_matrix(self) -> str:
        """Matriz de cobertura por BR"""
        lines = ["## 📋 MATRIZ DE COBERTURA POR BR\n"]
        lines.append("| BR | Descripción | Positivo | Negativo | Cobertura |")
        lines.append("|-----|-------------|:--------:|:--------:|-----------|")

        for cob in self.coberturas:
            # Emojis para cobertura
            if cob.cobertura_porcentaje >= 100:
                status = "✅ 100%"
            elif cob.cobertura_porcentaje >= 50:
                status = "🟡 50%"
            else:
                status = "🔴 0%"

            pos = "✅" if cob.tiene_caso_positivo else "❌"
            neg = "✅" if cob.tiene_caso_negativo else "❌"

            # Texto de BR truncado
            desc = cob.br.descripcion[:50] + "..." if len(cob.br.descripcion) > 50 else cob.br.descripcion

            lines.append(f"| **{cob.br.id}** | {desc} | {pos} | {neg} | {status} |")

        lines.append("\n---\n")
        return '\n'.join(lines)

    def _issues_detalle(self) -> str:
        """Detalle de cada issue/gap encontrado"""
        if not self.gaps:
            return ""

        lines = ["## 📝 DETALLE DE GAPS\n"]

        for i, gap in enumerate(self.gaps, 1):
            emoji_sev = {"CRITICO": "🔴", "ALTO": "🟠", "MEDIO": "🟡", "BAJO": "🟢"}.get(gap.tipo, "⚪")

            # Obtener texto completo de BR
            br_texto = gap.br_texto_completo if hasattr(gap, 'br_texto_completo') and gap.br_texto_completo else "N/A"

            lines.append(f"### GAP-{i:03d} {emoji_sev} {gap.tipo}\n")
            lines.append(f"**{gap.titulo}**\n")
            lines.append(f"| Campo | Valor |")
            lines.append(f"|-------|-------|")
            lines.append(f"| BR Afectada | **{gap.br_afectada}** |")
            lines.append(f"| Texto BR | {br_texto} |")

            if hasattr(gap, 'razon_gap') and gap.razon_gap:
                razon = {
                    "sin_escenarios": "❌ No tiene escenarios de prueba",
                    "solo_positivo": "⚠️ Falta caso negativo",
                    "solo_negativo": "⚠️ Falta caso positivo"
                }.get(gap.razon_gap, gap.razon_gap)
                lines.append(f"| Razón | {razon} |")

            if hasattr(gap, 'owasp') and gap.owasp:
                lines.append(f"| OWASP | 🔒 {gap.owasp} |")

            lines.append("")

        lines.append("---\n")
        return '\n'.join(lines)

    def _escenarios_sugeridos(self) -> str:
        """Escenarios sugeridos para cerrar gaps"""
        if not self.gaps:
            return ""

        lines = ["## 💡 ESCENARIOS SUGERIDOS\n"]
        lines.append("Los siguientes escenarios se sugieren para cerrar las brechas identificadas:\n")

        for i, gap in enumerate(self.gaps, 1):
            if gap.escenario_sugerido:
                emoji_sev = {"CRITICO": "🔴", "ALTO": "🟠", "MEDIO": "🟡", "BAJO": "🟢"}.get(gap.tipo, "⚪")
                lines.append(f"### {emoji_sev} GAP-{i:03d}: {gap.titulo}\n")
                lines.append(f"**BR Afectada:** {gap.br_afectada}\n")
                lines.append(f"```gherkin\n{gap.escenario_sugerido}\n```\n")

                if hasattr(gap, 'owasp') and gap.owasp:
                    lines.append(f"🔒 **Referencia OWASP:** {gap.owasp}\n")

                lines.append("")

        lines.append("---\n")
        return '\n'.join(lines)

    def _footer(self) -> str:
        """Footer del reporte"""
        return f"""## 📚 REFERENCIAS

- IEEE 1028: Software Reviews and Audits
- IEEE 829: Software Test Documentation
- OWASP Top 10 2021
- ISTQB Foundation Level Syllabus

---

🤖 **SIGMA Static Analyzer v3.0 AI** | {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

*Análisis potenciado por Google Gemini AI para precisión semántica.*
"""

    def _calcular_estado(self) -> str:
        """Calcula estado general"""
        criticos = sum(1 for g in self.gaps if g.tipo == "CRITICO")
        altos = sum(1 for g in self.gaps if g.tipo == "ALTO")

        if criticos > 0:
            return "FAILED"
        elif altos > 0:
            return "WARNING"
        elif len(self.gaps) == 0:
            return "PASSED"
        return "WARNING"
