"""
Parser de Historias de Usuario (HU) en formato HTML.

Lee la plantilla ISTQB oficial del QASL Framework
(static_analyzer/templates/plantilla-hu-istqb.html) y extrae los campos
estructurados a dataclasses para que el resto del pipeline (analyzer,
report_generator, hu_ideal_html_generator, csv_generator) opere sobre
objetos tipados y no sobre HTML crudo.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional, Dict

from bs4 import BeautifulSoup, Tag


@dataclass
class ReglaNegocio:
    """Una Regla de Negocio (BR1, BR2, ...)."""
    id: str
    descripcion: str


@dataclass
class Escenario:
    """Un escenario en formato Gherkin (DADO / CUANDO / ENTONCES / Y)."""
    id: str
    titulo: str
    dado: str
    cuando: str
    entonces: str
    y_adicional: Optional[str] = None
    es_agregado: bool = False  # True cuando proviene del analyzer (badge "Agregado")
    br_cubierta: Optional[str] = None  # Solo para escenarios agregados (BR1, BR2, ...)


@dataclass
class HistoriaUsuario:
    """Historia de Usuario completa."""
    id: str
    nombre: str
    epica: str
    prioridad: str
    estado: str
    descripcion: str            # texto plano "Como ... Quiero ... Para ..."
    descripcion_como: str
    descripcion_quiero: str
    descripcion_para: str
    usuario_rol: str
    reglas_negocio: List[ReglaNegocio] = field(default_factory=list)
    escenarios: List[Escenario] = field(default_factory=list)
    precondiciones: List[str] = field(default_factory=list)
    dependencias: List[str] = field(default_factory=list)
    dentro_alcance: List[str] = field(default_factory=list)
    fuera_alcance: List[str] = field(default_factory=list)
    notas: str = ""

    # Campos retro-compatibles (algunos módulos antiguos los esperan)
    validaciones: List[str] = field(default_factory=list)
    mensajes: List[str] = field(default_factory=list)
    permisos: List[str] = field(default_factory=list)


class HUParser:
    """Parser HTML basado en BeautifulSoup."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        with open(file_path, "r", encoding="utf-8") as f:
            self.soup = BeautifulSoup(f.read(), "html.parser")

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------
    def parse(self) -> HistoriaUsuario:
        rows = self._fields_dict()

        descripcion_como, descripcion_quiero, descripcion_para = self._parse_descripcion(rows.get("Descripción"))
        descripcion_plana = " ".join(filter(None, [
            f"Como {descripcion_como}" if descripcion_como else "",
            f"Quiero {descripcion_quiero}" if descripcion_quiero else "",
            f"Para {descripcion_para}" if descripcion_para else "",
        ])).strip()

        return HistoriaUsuario(
            id=self._text_of(rows.get("ID")),
            nombre=self._text_of(rows.get("Nombre")),
            epica=self._first_line(rows.get("Épica")),
            prioridad=self._text_of(rows.get("Prioridad")),
            estado=self._text_of(rows.get("Estado")),
            descripcion=descripcion_plana,
            descripcion_como=descripcion_como,
            descripcion_quiero=descripcion_quiero,
            descripcion_para=descripcion_para,
            usuario_rol=self._text_of(rows.get("Usuarios / Roles")),
            reglas_negocio=self._parse_reglas_negocio(rows.get("Reglas de Negocio")),
            escenarios=self._parse_escenarios(rows.get("Escenarios de Prueba (Criterios de Aceptación)")),
            precondiciones=self._bullet_list(rows.get("Precondiciones")),
            dependencias=self._bullet_list(rows.get("Dependencias")),
            dentro_alcance=self._bullet_list(rows.get("Dentro del Alcance")),
            fuera_alcance=self._out_scope_list(rows.get("Fuera del Alcance")),
            notas=self._text_of(rows.get("Notas / Comentarios")),
        )

    # ------------------------------------------------------------------
    # Indexado de filas <tr><td.label>...</td><td.content>...</td></tr>
    # ------------------------------------------------------------------
    def _fields_dict(self) -> Dict[str, Tag]:
        """Devuelve { label_text: <td.content> } para acceso O(1) por campo.

        Acepta tanto <th class="label"> (semánticamente correcto) como
        <td class="label"> (compatibilidad con HUs viejas).
        """
        result: Dict[str, Tag] = {}
        for row in self.soup.select("table.us-table tr"):
            label_cell = row.find(["th", "td"], class_="label")
            content_cell = row.find("td", class_="content")
            if label_cell and content_cell:
                key = label_cell.get_text(strip=True)
                result[key] = content_cell
        return result

    # ------------------------------------------------------------------
    # Helpers de extracción
    # ------------------------------------------------------------------
    @staticmethod
    def _text_of(cell: Optional[Tag]) -> str:
        if cell is None:
            return ""
        return cell.get_text(separator=" ", strip=True)

    @staticmethod
    def _first_line(cell: Optional[Tag]) -> str:
        """Toma solo la primera línea (útil para Épica que tiene un link debajo)."""
        if cell is None:
            return ""
        text = cell.get_text(separator="\n", strip=True)
        return text.split("\n", 1)[0].strip()

    @staticmethod
    def _bullet_list(cell: Optional[Tag]) -> List[str]:
        """Extrae items separados por <br> y prefijados con '•'."""
        if cell is None:
            return []
        raw = cell.get_text(separator="\n", strip=True)
        items = []
        for line in raw.split("\n"):
            cleaned = line.strip().lstrip("•").lstrip("*").strip()
            if cleaned:
                items.append(cleaned)
        return items

    @staticmethod
    def _out_scope_list(cell: Optional[Tag]) -> List[str]:
        """Extrae items de Fuera del Alcance.

        Cada item es un <div class="out-scope-item"> que puede contener
        múltiples líneas internas (item + nota "Cubierto por").
        """
        if cell is None:
            return []
        items = []
        for div in cell.select("div.out-scope-item"):
            text = div.get_text(separator=" ", strip=True)
            cleaned = text.lstrip("•").lstrip("*").strip()
            if cleaned:
                items.append(cleaned)
        return items

    @staticmethod
    def _parse_descripcion(cell: Optional[Tag]) -> tuple[str, str, str]:
        """Extrae los 3 fragmentos Como / Quiero / Para de la descripción."""
        if cell is None:
            return ("", "", "")

        como = quiero = para = ""
        for div in cell.select("div.description-format"):
            text = div.get_text(separator=" ", strip=True)
            if text.lower().startswith("como"):
                como = text[4:].strip()
            elif text.lower().startswith("quiero"):
                quiero = text[6:].strip()
            elif text.lower().startswith("para"):
                para = text[4:].strip()
        return (como, quiero, para)

    @staticmethod
    def _parse_reglas_negocio(cell: Optional[Tag]) -> List[ReglaNegocio]:
        if cell is None:
            return []
        result = []
        for div in cell.select("div.br-item"):
            text = div.get_text(separator=" ", strip=True)
            # Formato: "BR1: descripción..."
            match = re.match(r"^(BR\d+)\s*:\s*(.+)$", text, re.IGNORECASE)
            if match:
                result.append(ReglaNegocio(
                    id=match.group(1).upper(),
                    descripcion=match.group(2).strip(),
                ))
        return result

    @staticmethod
    def _parse_escenarios(cell: Optional[Tag]) -> List[Escenario]:
        """Parsea pares <div.scenario-title> + <div.scenario-content>."""
        if cell is None:
            return []

        titles = cell.select("div.scenario-title")
        contents = cell.select("div.scenario-content")
        result: List[Escenario] = []

        for idx, title_div in enumerate(titles):
            content_div = contents[idx] if idx < len(contents) else None
            if content_div is None:
                continue

            # ID y título: "E1: Acceso al formulario de registro"
            title_text = title_div.get_text(separator=" ", strip=True)
            id_match = re.match(r"^(E\d+|EN)\s*:\s*(.+?)(?:\s+(?:Original|Agregado|BR\d+))*\s*$", title_text)
            if id_match:
                escenario_id = id_match.group(1)
                titulo = id_match.group(2).strip()
                # Sacar palabras de badges si quedaron pegadas
                titulo = re.sub(r"\s*(Original|Agregado|BR\d+)\s*$", "", titulo).strip()
            else:
                escenario_id = f"E{idx + 1}"
                titulo = title_text

            # Detectar si es agregado por el analyzer
            badges = [b.get_text(strip=True) for b in title_div.select("span.badge")]
            es_agregado = "Agregado" in badges
            br_cubierta = next((b for b in badges if b.startswith("BR")), None)

            # Parsear DADO / CUANDO / ENTONCES / Y
            content_html = content_div.decode_contents()
            dado, cuando, entonces, y_adicional = HUParser._parse_gherkin(content_html)

            result.append(Escenario(
                id=escenario_id,
                titulo=titulo,
                dado=dado,
                cuando=cuando,
                entonces=entonces,
                y_adicional=y_adicional,
                es_agregado=es_agregado,
                br_cubierta=br_cubierta,
            ))
        return result

    @staticmethod
    def _parse_gherkin(html_content: str) -> tuple[str, str, str, Optional[str]]:
        """Extrae DADO / CUANDO / ENTONCES / Y de un bloque HTML con <strong> y <br>."""
        normalized = re.sub(r"<br\s*/?>", "\n", html_content, flags=re.IGNORECASE)
        text = BeautifulSoup(normalized, "html.parser").get_text(separator="\n", strip=False)

        sections = {"DADO": "", "CUANDO": "", "ENTONCES": "", "Y": ""}
        current: Optional[str] = None
        buffer: List[str] = []

        for raw_line in text.split("\n"):
            line = raw_line.strip()
            if line:
                current = HUParser._consume_gherkin_line(line, sections, current, buffer)

        if current and buffer:
            sections[current] = " ".join(buffer).strip()

        return (
            sections["DADO"],
            sections["CUANDO"],
            sections["ENTONCES"],
            sections["Y"] or None,
        )

    @staticmethod
    def _consume_gherkin_line(
        line: str,
        sections: Dict[str, str],
        current: Optional[str],
        buffer: List[str],
    ) -> Optional[str]:
        """Procesa una línea Gherkin; devuelve la sección activa después de procesarla."""
        upper = line.upper()
        keyword = next((k for k in sections if upper.startswith(k + " ") or upper == k), None)
        if keyword is None:
            buffer.append(line)
            return current

        # Cambio de sección: descargamos buffer en la sección anterior
        if current and buffer:
            sections[current] = " ".join(buffer).strip()
            buffer.clear()

        rest = line[len(keyword):].strip()
        if rest:
            buffer.append(rest)
        return keyword


# ----------------------------------------------------------------------
# Función de conveniencia (firma estable usada por run_analysis.py)
# ----------------------------------------------------------------------
def parse_hu(file_path: str) -> HistoriaUsuario:
    """Parsea un archivo HTML de HU y devuelve la dataclass HistoriaUsuario."""
    return HUParser(file_path).parse()
