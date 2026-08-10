# -*- coding: utf-8 -*-
"""Native Word DrawingML diagram builder.

Emits one inline drawing containing a WordprocessingGroup (wpg) of shapes
(wps). The result is a real Word drawing: every box, ellipse, arrow and label
can be selected, moved, resized and re-texted in Microsoft Word or
LibreOffice Writer."""
from docx.oxml import parse_xml

EMU_IN = 914400

NSDECL = ('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
          'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
          'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
          'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" '
          'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"')

_id = [1000]
def nid():
    _id[0] += 1
    return _id[0]

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))

class Draw:
    """Coordinates in inches; (0,0) is the top-left of the drawing canvas."""
    def __init__(self, width, height):
        self.w = int(width * EMU_IN)
        self.h = int(height * EMU_IN)
        self.parts = []

    def _txbx(self, lines, size=9, bold_first=False, color="000000", align="ctr"):
        jc = {"ctr": "center", "l": "left"}[align]
        ps = []
        for i, ln in enumerate(lines):
            b = "<w:b/>" if (bold_first and i == 0) else ""
            ps.append(
                f'<w:p><w:pPr><w:jc w:val="{jc}"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
                f'<w:r><w:rPr>{b}<w:color w:val="{color}"/><w:sz w:val="{int(size*2)}"/>'
                f'<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr>'
                f'<w:t xml:space="preserve">{esc(ln)}</w:t></w:r></w:p>')
        return ("<wps:txbx><w:txbxContent>" + "".join(ps) + "</w:txbxContent></wps:txbx>"
                '<wps:bodyPr rot="0" vert="horz" wrap="square" lIns="27432" tIns="18288" '
                'rIns="27432" bIns="18288" anchor="ctr" anchorCtr="0"><a:noAutofit/></wps:bodyPr>')

    def _sp(self, x, y, w, h, geom, fill, line_color, line_w, lines, size, bold_first,
            dash=None, text_color="000000", align="ctr"):
        i = nid()
        fill_xml = (f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>'
                    if fill else "<a:noFill/>")
        dash_xml = f'<a:prstDash val="{dash}"/>' if dash else ""
        ln_xml = (f'<a:ln w="{line_w}"><a:solidFill><a:srgbClr val="{line_color}"/></a:solidFill>{dash_xml}</a:ln>'
                  if line_color else "<a:ln><a:noFill/></a:ln>")
        self.parts.append(
            f'<wps:wsp><wps:cNvPr id="{i}" name="Shape {i}"/><wps:cNvSpPr/>'
            f'<wps:spPr><a:xfrm><a:off x="{int(x*EMU_IN)}" y="{int(y*EMU_IN)}"/>'
            f'<a:ext cx="{max(1,int(w*EMU_IN))}" cy="{max(1,int(h*EMU_IN))}"/></a:xfrm>'
            f'<a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>{fill_xml}{ln_xml}</wps:spPr>'
            + self._txbx(lines, size, bold_first, text_color, align)
            + "</wps:wsp>")

    def box(self, x, y, w, h, text, fill="FDF2F6", line="B0316B", size=9,
            geom="roundRect", bold_first=True, dash=None):
        lines = text.split("\n") if isinstance(text, str) else list(text)
        self._sp(x, y, w, h, geom, fill, line, 19050, lines, size, bold_first, dash)

    def ellipse(self, x, y, w, h, text, fill="F2FBF4", line="1E7E3E", size=9):
        self.box(x, y, w, h, text, fill, line, size, geom="ellipse", bold_first=False)

    def label(self, x, y, w, h, text, size=8, color="595959", align="ctr", bold=False):
        lines = text.split("\n") if isinstance(text, str) else list(text)
        self._sp(x, y, w, h, "rect", None, None, 0, lines, size, bold, None, color, align)

    def line(self, x1, y1, x2, y2, color="404040", width_pt=1.5, arrow=True,
             dash=None, arrow_start=False):
        i = nid()
        x, y = min(x1, x2), min(y1, y2)
        w, h = abs(x2 - x1), abs(y2 - y1)
        flipH = ' flipH="1"' if x2 < x1 else ""
        flipV = ' flipV="1"' if y2 < y1 else ""
        dash_xml = f'<a:prstDash val="{dash}"/>' if dash else ""
        tail = '<a:tailEnd type="triangle" w="med" len="med"/>' if arrow else ""
        head = '<a:headEnd type="triangle" w="med" len="med"/>' if arrow_start else ""
        self.parts.append(
            f'<wps:wsp><wps:cNvPr id="{i}" name="Connector {i}"/><wps:cNvSpPr/>'
            f'<wps:spPr><a:xfrm{flipH}{flipV}><a:off x="{int(x*EMU_IN)}" y="{int(y*EMU_IN)}"/>'
            f'<a:ext cx="{max(1,int(w*EMU_IN))}" cy="{max(1,int(h*EMU_IN))}"/></a:xfrm>'
            f'<a:prstGeom prst="line"><a:avLst/></a:prstGeom>'
            f'<a:ln w="{int(width_pt*12700)}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
            f'{dash_xml}{head}{tail}</a:ln></wps:spPr>'
            '<wps:bodyPr/></wps:wsp>')

    def actor(self, x, y, name, color="333333"):
        """UML stick figure ~0.55in wide × 0.95in tall, name label below."""
        cx = x + 0.275
        self._sp(x + 0.175, y, 0.2, 0.2, "ellipse", None, color, 19050, [""], 8, False)
        self.line(cx, y + 0.2, cx, y + 0.55, color, 1.5, arrow=False)
        self.line(x + 0.05, y + 0.3, x + 0.5, y + 0.3, color, 1.5, arrow=False)
        self.line(cx, y + 0.55, x + 0.08, y + 0.85, color, 1.5, arrow=False)
        self.line(cx, y + 0.55, x + 0.47, y + 0.85, color, 1.5, arrow=False)
        self.label(x - 0.35, y + 0.9, 1.25, 0.25, name, size=9, color="000000", bold=True)

    def xml(self):
        i = nid()
        return parse_xml(
            f'<w:drawing {NSDECL}>'
            f'<wp:inline distT="0" distB="0" distL="0" distR="0">'
            f'<wp:extent cx="{self.w}" cy="{self.h}"/>'
            f'<wp:effectExtent l="0" t="0" r="0" b="0"/>'
            f'<wp:docPr id="{i}" name="Diagram {i}"/>'
            f'<wp:cNvGraphicFramePr/>'
            f'<a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup">'
            f'<wpg:wgp><wpg:cNvGrpSpPr/><wpg:grpSpPr>'
            f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="{self.w}" cy="{self.h}"/>'
            f'<a:chOff x="0" y="0"/><a:chExt cx="{self.w}" cy="{self.h}"/></a:xfrm>'
            f'</wpg:grpSpPr>' + "".join(self.parts) + "</wpg:wgp>"
            f'</a:graphicData></a:graphic></wp:inline></w:drawing>')

    def add_to(self, doc):
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        par = doc.add_paragraph()
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.add_run()._r.append(self.xml())
        return par
