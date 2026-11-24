from pathlib import Path
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "Informe_Corporativo_Vigente.pdf"
IMG = ROOT / "assets" / "report"
W, H = A4

GREEN = HexColor("#0F2D25")
GREEN_2 = HexColor("#174B3B")
INK = HexColor("#10251F")
MUTED = HexColor("#60736C")
PAPER = HexColor("#F7F8F3")
LINE = HexColor("#D7DFD8")
MINT = HexColor("#B7F1CF")
MINT_SOFT = HexColor("#E8F8EE")
BLUE = HexColor("#3157E4")
BLUE_SOFT = HexColor("#E5EBFF")
PEACH = HexColor("#F4D8CA")
SAND = HexColor("#EFE9DC")
AMBER_SOFT = HexColor("#FFF1D5")
RED_SOFT = HexColor("#FAE7E4")


def register_fonts():
    normal = Path("C:/Windows/Fonts/segoeui.ttf")
    bold = Path("C:/Windows/Fonts/segoeuib.ttf")
    semi = Path("C:/Windows/Fonts/seguisb.ttf")
    if normal.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("Vigente", str(normal)))
        pdfmetrics.registerFont(TTFont("Vigente-Bold", str(bold)))
        pdfmetrics.registerFont(TTFont("Vigente-Semibold", str(semi if semi.exists() else bold)))
    else:
        pdfmetrics.registerFont(TTFont("Vigente", "C:/Windows/Fonts/arial.ttf"))
        pdfmetrics.registerFont(TTFont("Vigente-Bold", "C:/Windows/Fonts/arialbd.ttf"))
        pdfmetrics.registerFont(TTFont("Vigente-Semibold", "C:/Windows/Fonts/arialbd.ttf"))


def words(text):
    return text.replace("\n", " \n ").split()


def wrapped_lines(text, font, size, width):
    lines, current = [], ""
    for word in words(text):
        if word == "\n":
            lines.append(current)
            current = ""
            continue
        trial = word if not current else f"{current} {word}"
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def text(c, value, x, y, width, size=9.2, leading=None, font="Vigente", color=INK, max_lines=None):
    leading = leading or size * 1.38
    lines = wrapped_lines(value, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def brand(c, x, y, dark=False):
    fg = white if dark else GREEN
    c.setStrokeColor(Color(1, 1, 1, .25) if dark else LINE)
    c.roundRect(x, y - 18, 28, 28, 7, stroke=1, fill=0)
    bars = [(7, 8, MINT), (13, 15, HexColor("#FF9C73")), (19, 12, HexColor("#7390FF"))]
    for bx, bh, color in bars:
        c.setFillColor(color)
        c.roundRect(x + bx, y - 13, 3.5, bh, 1.5, stroke=0, fill=1)
    c.setFillColor(fg)
    c.setFont("Vigente-Bold", 10)
    c.drawString(x + 38, y - 1, "VIGENTE")
    c.setFont("Vigente", 6.8)
    c.drawString(x + 38, y - 12, "Dashboard integrador")


def header(c, page, section):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    brand(c, 36, H - 38)
    c.setFillColor(MUTED)
    c.setFont("Vigente-Semibold", 7.2)
    c.drawRightString(W - 36, H - 39, section.upper())
    c.setStrokeColor(LINE)
    c.line(36, H - 61, W - 36, H - 61)
    footer(c, page)


def footer(c, page):
    c.setStrokeColor(LINE)
    c.line(36, 30, W - 36, 30)
    c.setFillColor(MUTED)
    c.setFont("Vigente", 6.8)
    c.drawString(36, 18, "Informe corporativo de integración · 24 de noviembre de 2026")
    c.drawRightString(W - 36, 18, f"Página {page} de 8")


def title(c, heading, subtitle, y=H - 100):
    y = text(c, heading, 36, y, W - 72, 27, 29, "Vigente-Bold", INK)
    return text(c, subtitle, 36, y - 8, W - 72, 9.6, 14, "Vigente", MUTED)


def panel(c, x, y, w, h, fill=white, stroke=LINE, radius=12):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def metric(c, x, y, w, h, label, value, note="", fill=white, value_color=INK):
    panel(c, x, y, w, h, fill)
    c.setFillColor(MUTED)
    c.setFont("Vigente-Semibold", 7)
    c.drawString(x + 14, y + h - 19, label)
    c.setFillColor(value_color)
    c.setFont("Vigente-Bold", 18)
    c.drawString(x + 14, y + h - 47, value)
    if note:
        text(c, note, x + 14, y + 17, w - 28, 6.8, 9, "Vigente", MUTED, 2)


def screenshot(c, path, x, y, w, h, border=True):
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx, dy = x + (w - dw) / 2, y + (h - dh) / 2
    if border:
        panel(c, x, y, w, h, white)
    c.drawImage(image, dx, dy, dw, dh, preserveAspectRatio=True, mask="auto")


def bullet(c, value, x, y, width, color=INK, dot=BLUE, size=8.4):
    c.setFillColor(dot)
    c.circle(x + 3, y + 2, 2.4, stroke=0, fill=1)
    return text(c, value, x + 13, y + 6, width - 13, size, size * 1.42, "Vigente", color) - 4


def section_label(c, label, x, y, color=GREEN):
    c.setFillColor(color)
    c.setFont("Vigente-Bold", 10)
    c.drawString(x, y, label)


def page_1(c):
    c.setFillColor(GREEN)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    brand(c, 42, H - 48, dark=True)
    c.setFillColor(MINT)
    c.roundRect(W - 176, H - 72, 132, 26, 13, stroke=0, fill=1)
    c.setFillColor(GREEN)
    c.setFont("Vigente-Bold", 7.5)
    c.drawCentredString(W - 110, H - 62, "INFORME CORPORATIVO 2026")

    text(c, "Integración del dashboard Vigente", 42, H - 150, 400, 38, 39, "Vigente-Bold", white)
    text(c, "Una plataforma modular para reunir el emprendimiento, sus obligaciones, la nómina y la liquidación laboral.", 42, H - 247, 430, 13, 19, "Vigente", HexColor("#C8DBD3"))

    boxes = [
        ("EMPRENDIMIENTO", "Idea, mercado y viabilidad", BLUE),
        ("TRIBUTARIAS", "RUC, CIIU e IVA", MINT),
        ("NÓMINA", "Cinco trabajadores", PEACH),
        ("LIQUIDACIÓN", "Finiquito y paz y salvo", SAND),
    ]
    bx, by, bw, bh = 42, 360, 245, 78
    for i, (name, copy, fill) in enumerate(boxes):
        x = bx + (i % 2) * (bw + 12)
        y = by - (i // 2) * (bh + 12)
        c.setFillColor(fill)
        c.roundRect(x, y, bw, bh, 12, stroke=0, fill=1)
        c.setFillColor(white if fill == BLUE else GREEN)
        c.setFont("Vigente-Bold", 8)
        c.drawString(x + 15, y + 52, name)
        c.setFont("Vigente", 8.3)
        c.drawString(x + 15, y + 28, copy)

    c.setFillColor(Color(1, 1, 1, .14))
    c.roundRect(42, 88, W - 84, 100, 12, stroke=0, fill=1)
    c.setFillColor(MINT)
    c.setFont("Vigente-Semibold", 7.5)
    c.drawString(58, 166, "AUTORES")
    c.setFillColor(white)
    c.setFont("Vigente-Bold", 11)
    c.drawString(58, 140, "Kevin Alexander Peñafiel SanMartin")
    c.drawString(58, 116, "Adrián Estefano Romero Alarcón")
    c.setFont("Vigente", 7.5)
    c.setFillColor(HexColor("#B8CDC4"))
    c.drawRightString(W - 58, 116, "Ambato, Ecuador · Noviembre 2026")


def page_2(c):
    header(c, 2, "Resumen ejecutivo")
    title(c, "Una plataforma para leer el proyecto completo", "El dashboard organiza trabajos dispersos en cuatro recorridos conectados y verificables.")

    y = H - 185
    section_label(c, "Objetivo", 36, y)
    y = text(c, "Integrar la información empresarial, tributaria y laboral de Vigente en un sitio estático que pueda consultarse sin instalación ni conexión, manteniendo visibles las fuentes y distinguiendo datos históricos, proyecciones y simulaciones.", 36, y - 20, W - 72, 9.3, 14, "Vigente", INK)

    # Keep both card rows below the objective copy. Fixed coordinates make the
    # hierarchy stable even when the title wraps onto two lines.
    cards_y = 505
    labels = [
        ("1", "Emprendimiento", "Valida el problema, el mercado y el modelo SaaS.", BLUE_SOFT),
        ("2", "Obligaciones", "Expone la identidad y un flujo ilustrativo de IVA.", MINT_SOFT),
        ("3", "Remuneraciones", "Consolida cinco roles de pago ya calculados.", PEACH),
        ("4", "Liquidación", "Relaciona finiquito, evidencias y paz y salvo.", SAND),
    ]
    cw = (W - 84) / 2
    for i, (num, name, copy, fill) in enumerate(labels):
        x = 36 + (i % 2) * (cw + 12)
        yy = cards_y - (i // 2) * 88
        panel(c, x, yy, cw, 76, fill, fill)
        c.setFillColor(GREEN)
        c.setFont("Vigente-Bold", 15)
        c.drawString(x + 15, yy + 43, num)
        c.setFont("Vigente-Bold", 9)
        c.drawString(x + 46, yy + 47, name)
        text(c, copy, x + 46, yy + 30, cw - 60, 7.2, 9.4, "Vigente", MUTED, 2)

    bottom_y = 205
    panel(c, 36, bottom_y, W - 72, 170, white)
    section_label(c, "Resultados centrales", 54, bottom_y + 145)
    metrics = [
        ("94,1 %", "reporta pérdidas por caducidad"),
        ("5", "trabajadores visibles"),
        ("$10.932,98", "costo devengado"),
        ("4", "documentos vinculados"),
    ]
    mw = (W - 108) / 4
    for i, (value, copy) in enumerate(metrics):
        x = 54 + i * mw
        c.setFillColor(INK)
        c.setFont("Vigente-Bold", 16)
        c.drawString(x, bottom_y + 95, value)
        text(c, copy, x, bottom_y + 73, mw - 12, 7, 9, "Vigente", MUTED, 2)
    c.setStrokeColor(LINE)
    c.line(54, bottom_y + 48, W - 54, bottom_y + 48)
    text(c, "Alcance: visualización, navegación, filtros, documentos y vistas imprimibles. No incluye backend, autenticación ni presentación de trámites oficiales.", 54, bottom_y + 32, W - 108, 7.6, 10, "Vigente", MUTED, 2)


def page_3(c):
    header(c, 3, "Arquitectura y experiencia")
    title(c, "Construcción simple, lectura inmediata", "HTML, CSS y JavaScript mantienen el proyecto portable; la interfaz prioriza evidencia y navegación.")

    screenshot(c, IMG / "01-portada.png", 36, 392, 350, 236)
    screenshot(c, IMG / "06-movil.png", 407, 392, 152, 236)

    y = 360
    section_label(c, "Decisiones de implementación", 36, y)
    y -= 22
    decisions = [
        "Sitio estático que abre directamente desde index.html y funciona sin conexión.",
        "Rutas hash para conservar historial, navegación directa y botones Atrás/Adelante.",
        "Datos centralizados en un objeto JavaScript inmutable y sin almacenamiento local.",
        "Diseño responsive con portada modular, tablas desplazables y controles táctiles.",
    ]
    for item in decisions:
        y = bullet(c, item, 36, y, 250)

    section_label(c, "Accesibilidad y control", 320, 360)
    yy = 338
    checks = [
        "Navegación por teclado y foco visible.",
        "Pestañas con roles y estados ARIA.",
        "Contraste AA y estados no dependientes del color.",
        "Movimiento reducido y contenido imprimible.",
    ]
    for item in checks:
        yy = bullet(c, item, 320, yy, 240, dot=GREEN_2)

    panel(c, 36, 106, W - 72, 86, GREEN, GREEN)
    c.setFillColor(MINT)
    c.setFont("Vigente-Bold", 10)
    c.drawString(54, 166, "Flujo de datos")
    c.setFillColor(white)
    c.setFont("Vigente", 8)
    c.drawString(54, 137, "Documentos y resultados previos  →  data.js  →  vistas por módulo  →  consulta, filtro e impresión")
    c.setFillColor(HexColor("#B8CDC4"))
    c.setFont("Vigente", 7)
    c.drawString(54, 119, "La fuente de verdad permanece separada de la presentación; los casos nuevos se etiquetan como simulación académica.")


def page_4(c):
    header(c, 4, "Módulo de emprendimiento")
    title(c, "El problema y la oportunidad comercial", "Vigente convierte el control de caducidades en una propuesta SaaS accesible para pequeños negocios.")

    metric(c, 36, 620, 122, 76, "PÉRDIDAS RECIENTES", "94,1 %", "16 de 17 encuestados", MINT)
    metric(c, 170, 620, 122, 76, "INTENCIÓN DE USO", "88,2 %", "máxima calificación", BLUE_SOFT)
    metric(c, 304, 620, 122, 76, "INVERSIÓN INICIAL", "$755", "capital preoperativo", PEACH)
    metric(c, 438, 620, 121, 76, "EQUILIBRIO", "30", "clientes anuales", SAND)

    panel(c, 36, 482, 250, 118, GREEN, GREEN)
    section_label(c, "Propuesta de valor", 52, 573, MINT)
    text(c, "Alertas a 90, 60, 30 y 7 días, rotación FEFO y generación de actas para devolver mercadería antes de perderla.", 52, 552, 218, 8.4, 12.4, "Vigente", white)
    panel(c, 298, 482, 261, 118, white)
    section_label(c, "Mercado objetivo", 314, 573)
    text(c, "Farmacias independientes, minimarkets y tiendas de abarrotes que manejan entre 800 y 3.000 productos activos.", 314, 552, 229, 8.4, 12.4, "Vigente", MUTED)

    screenshot(c, IMG / "02-emprendimiento.png", 36, 160, W - 72, 292)
    text(c, "Resultado: la propuesta combina una necesidad comprobada, un producto técnicamente viable y un modelo recurrente con costos operativos mensuales estimados en USD 170.", 36, 132, W - 72, 7.8, 10.5, "Vigente", MUTED, 2)


def page_5(c):
    header(c, 5, "Módulo de obligaciones tributarias")
    title(c, "Identificación y caso ilustrativo de IVA", "El módulo separa la información registral simulada del ejercicio tributario creado para la demostración.")

    panel(c, 36, 590, 250, 88, GREEN, GREEN)
    c.setFillColor(MINT)
    c.setFont("Vigente-Bold", 8)
    c.drawString(52, 653, "RUC SIMULADO")
    c.setFillColor(white)
    c.setFont("Vigente-Bold", 18)
    c.drawString(52, 623, "1851383992001")
    c.setFillColor(HexColor("#B8CDC4"))
    c.setFont("Vigente", 7)
    c.drawString(52, 605, "Vigente S.A.S. · La Matriz, Ambato")

    panel(c, 298, 590, 261, 88, white)
    section_label(c, "Actividades CIIU", 314, 653)
    text(c, "J62010101 Programación informática\nJ62021001 Consultoría de sistemas\nJ63110101 Hospedaje y procesamiento", 314, 631, 229, 7.5, 11, "Vigente", MUTED)

    metric(c, 36, 496, 122, 76, "VENTAS GRAVADAS", "$700,00", "10 suscripciones", white)
    metric(c, 170, 496, 122, 76, "IVA GENERADO", "$91,00", "13 % aplicado", MINT_SOFT)
    metric(c, 304, 496, 122, 76, "CRÉDITO", "$16,90", "compras con respaldo", BLUE_SOFT)
    metric(c, 438, 496, 121, 76, "SALDO", "$74,10", "resultado ilustrativo", AMBER_SOFT)

    screenshot(c, IMG / "03-tributarias.png", 36, 180, W - 72, 290)
    c.setFillColor(AMBER_SOFT)
    c.roundRect(36, 102, W - 72, 64, 10, stroke=0, fill=1)
    c.setFillColor(HexColor("#6A460F"))
    c.setFont("Vigente-Bold", 7.8)
    c.drawString(52, 145, "ALCANCE ACADÉMICO")
    text(c, "Las transacciones y el saldo fueron creados para explicar el flujo del IVA. No constituyen declaración, comprobante ni asesoría tributaria.", 52, 128, W - 104, 7.4, 9.6, "Vigente", HexColor("#6A460F"), 2)


def page_6(c):
    header(c, 6, "Módulo de remuneraciones y nómina")
    title(c, "Cinco trabajadores y un costo explicable", "La vista conserva resultados ya calculados y diferencia la nómina operativa de la estructura objetivo de 22 personas.")

    metrics = [
        ("BRUTA", "$8.941,68", white),
        ("DESCUENTOS", "$826,79", PEACH),
        ("NETO", "$8.114,90", MINT),
        ("COSTO DEVENGADO", "$10.932,98", BLUE_SOFT),
    ]
    for i, (label, value, fill) in enumerate(metrics):
        metric(c, 36 + i * 134, 590, 122 if i < 3 else 121, 76, label, value, "Octubre 2026", fill)

    screenshot(c, IMG / "04-nomina.png", 36, 303, W - 72, 263)

    section_label(c, "Resumen individual", 36, 283)
    rows = [
        ("Camila Torres", "Jefa de Desarrollo", "$2.400,00", "$2.173,20", "$3.207,69"),
        ("Andrés Molina", "Supervisor", "$1.800,00", "$1.978,09", "$2.475,20"),
        ("Daniela Ruiz", "Backend", "$1.500,00", "$1.647,03", "$2.184,84"),
        ("Mateo Salazar", "Frontend", "$1.300,00", "$1.307,87", "$1.771,27"),
        ("Valeria Paredes", "QA y Pruebas", "$950,00", "$1.008,71", "$1.293,98"),
    ]
    x, y = 36, 256
    widths = [155, 90, 90, 90, 98]
    headers = ["TRABAJADOR", "CARGO", "SUELDO", "NETO", "COSTO"]
    c.setFillColor(GREEN)
    c.roundRect(x, y, sum(widths), 24, 8, stroke=0, fill=1)
    cx = x
    c.setFillColor(white)
    c.setFont("Vigente-Bold", 6.4)
    for head, width in zip(headers, widths):
        c.drawString(cx + 8, y + 9, head)
        cx += width
    for row_index, row in enumerate(rows):
        yy = y - 27 - row_index * 27
        c.setFillColor(white if row_index % 2 == 0 else PAPER)
        c.rect(x, yy, sum(widths), 27, stroke=0, fill=1)
        cx = x
        for col, (value, width) in enumerate(zip(row, widths)):
            c.setFillColor(INK if col == 0 else MUTED)
            c.setFont("Vigente-Semibold" if col == 0 else "Vigente", 6.8)
            c.drawString(cx + 8, yy + 10, value)
            cx += width
    text(c, "La dotación de 22 personas permanece como escenario de crecimiento organizacional, no como nómina vigente.", 36, 92, W - 72, 7.4, 10, "Vigente", MUTED)


def page_7(c):
    header(c, 7, "Módulo de liquidación laboral")
    title(c, "Finiquito simulado y evidencias de salida", "El caso conecta los rubros económicos con un paz y salvo interno que no renuncia derechos ni reemplaza al SUT.")

    screenshot(c, IMG / "05-liquidacion.png", 36, 365, W - 72, 300)

    panel(c, 36, 172, 314, 174, GREEN, GREEN)
    section_label(c, "Desglose del caso", 52, 320, MINT)
    entries = [
        ("Indemnización", "$3.900,00"),
        ("Décimo tercero", "$658,33"),
        ("Vacaciones", "$329,17"),
        ("Total ilustrativo", "$4.887,50"),
    ]
    yy = 294
    for i, (name, value) in enumerate(entries):
        c.setFillColor(white if i < 3 else MINT)
        c.setFont("Vigente-Bold" if i == 3 else "Vigente", 8.5)
        c.drawString(52, yy, name)
        c.drawRightString(332, yy, value)
        yy -= 30

    panel(c, 362, 172, 197, 174, white)
    section_label(c, "Paz y salvo", 378, 320)
    yy = 292
    for name, state, color in [
        ("Equipos", "Recibido", MINT_SOFT),
        ("Accesos", "Completado", MINT_SOFT),
        ("Entrega", "Completado", MINT_SOFT),
        ("Acta SUT", "Pendiente", RED_SOFT),
        ("Comprobante", "Pendiente", RED_SOFT),
    ]:
        c.setFillColor(color)
        c.roundRect(378, yy - 5, 181, 23, 7, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Vigente-Semibold", 7)
        c.drawString(387, yy + 3, name)
        c.drawRightString(549, yy + 3, state)
        yy -= 28

    text(c, "Supuesto: Mateo Salazar, sueldo fijo USD 1.300, ingreso 1 de mayo de 2026 y salida 31 de octubre de 2026. El valor real debe verificarse con la historia laboral y el sistema oficial.", 36, 132, W - 72, 7.5, 10.2, "Vigente", MUTED, 3)


def page_8(c):
    header(c, 8, "Conclusiones y referencias")
    title(c, "La integración convierte archivos en una historia verificable", "El valor principal no está en repetir cálculos, sino en conectar sus resultados, supuestos y evidencias.")

    section_label(c, "Conclusiones", 36, 652)
    y = 628
    conclusions = [
        "La portada modular permite comprender el proyecto completo y entrar directamente al nivel de detalle necesario.",
        "La separación entre datos previos, estructura proyectada y simulaciones evita presentar supuestos como hechos empresariales.",
        "La nómina de cinco personas conserva resultados trazables, mientras que IVA y liquidación permanecen bloqueados como ejercicios educativos.",
        "La solución estática reduce dependencias y facilita la exposición, consulta documental y entrega del proyecto.",
    ]
    for item in conclusions:
        y = bullet(c, item, 36, y, W - 72)

    section_label(c, "Recomendaciones", 36, y - 5)
    y -= 30
    recommendations = [
        "Sustituir los casos simulados por trabajos reales cuando existan evidencias aprobadas por la asignatura.",
        "Actualizar tasas, parámetros y enlaces oficiales antes de reutilizar el dashboard en otro período.",
        "Mantener los documentos fuente junto al sitio para conservar la consulta sin conexión.",
    ]
    for item in recommendations:
        y = bullet(c, item, 36, y, W - 72, dot=GREEN_2)

    panel(c, 36, 170, W - 72, 210, white)
    section_label(c, "Referencias consultadas", 52, 353)
    refs = [
        "[1] Vigente. Plan de negocio, estudio de mercado y proyección económica, 2026.",
        "[2] Vigente. Estructura organizacional propuesta, 2026.",
        "[3] Vigente. Escalas y remuneraciones, modelo mensual editable, 2026.",
        "[4] Matriz resuelta de regímenes laborales, normativa revisada al 7 de octubre de 2026.",
        "[5] Servicio de Rentas Internas. Impuesto al Valor Agregado IVA. https://www.sri.gob.ec/impuesto-al-valor-agregado-iva",
        "[6] Ministerio del Trabajo. Rubros aplicables al despido intempestivo y calculadoras oficiales. https://calculadoras.trabajo.gob.ec/",
    ]
    yy = 328
    for ref in refs:
        yy = text(c, ref, 52, yy, W - 104, 6.8, 9.2, "Vigente", MUTED, 2) - 3

    c.setFillColor(GREEN)
    c.roundRect(36, 82, W - 72, 64, 10, stroke=0, fill=1)
    c.setFillColor(MINT)
    c.setFont("Vigente-Bold", 9)
    c.drawString(52, 123, "ENTREGA FINAL")
    c.setFillColor(white)
    c.setFont("Vigente", 7.6)
    c.drawString(52, 102, "Dashboard HTML/CSS/JS + documentos de respaldo + informe corporativo de ocho páginas.")


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("Informe corporativo del dashboard Vigente")
    c.setAuthor("Kevin Alexander Peñafiel SanMartin y Adrián Estefano Romero Alarcón")
    c.setSubject("Integración modular de trabajos de Emprendimiento y Legislación Laboral")
    pages = [page_1, page_2, page_3, page_4, page_5, page_6, page_7, page_8]
    for index, draw in enumerate(pages):
        draw(c)
        if index < len(pages) - 1:
            c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
