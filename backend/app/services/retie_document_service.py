"""
Servicio de generación de documento RETIE 2024 — El Inge Smart Grids.

Basado en:
- RETIE 2024 Título 3 — Diseño de las Instalaciones Eléctricas
- Artículo 3.3.1.1 — Diseño Detallado (items a-x)
- NTC 2050 Segunda Actualización

Genera una memoria de diseño/cálculo estructurada con:
- Clasificación de la instalación (simplificada vs compleja)
- Items requeridos según tipo de instalación
- Datos calculados desde los endpoints existentes
- Justificaciones normativas con citas de artículos
"""

from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


# =============================================================================
# CLASIFICACIÓN RETIE 2024 — Art. 10.1
# =============================================================================

class TipoDiseno(str, Enum):
    SIMPLIFICADO = "simplificado"
    DETALLADO = "detallado"


class TipoInstalacion(str, Enum):
    VIVIENDA_UNIFAMILIAR = "vivienda_unifamiliar"
    VIVIENDA_MULTIFAMILIAR = "vivienda_multifamiliar"
    COMERCIAL = "comercial"
    INDUSTRIAL = "industrial"
    INSTITUCIONAL = "institucional"
    GRANDES_SUPERFICIES = "grandes_superficies"
    URBANIZACION = "urbanizacion"
    GENERACION_FNCER = "generacion_fncer"
    SUBESTACION = "subestacion"
    PROVISIONAL = "provisional"
    OTRO = "otro"


# Límites para diseño simplificado (Art. 10.1.1)
LIMITE_SIMPLIFICADO_KVA = 10
LIMITE_CUENTAS_SIMPLIFICADO = 4

# Instalaciones que SIEMPRE requieren diseño detallado (Art. 3.3.1)
INSTALACIONES_DISENO_OBLIGATORIO = [
    "centrales_generacion",
    "lineas_transmision",
    "redes_distribucion",
    "subestacion",
    "equipos_paquetizados",
    "instalaciones_especiales",
    "generacion_fncer",
    "instituciones_ensenanza",
    "lugares_publico",
    "grandes_superficies",
    "urbanizacion",
]


def clasificar_instalacion(
    tipo: TipoInstalacion,
    kva_instalados: float,
    num_cuentas: int = 1,
    requiere_dictamen: bool = False,
) -> dict:
    """
    Determina si la instalación requiere diseño simplificado o detallado
    según RETIE 2024 Art. 10.1 y Art. 3.3.1.
    """
    tipo_str = tipo.value

    # Regla 1: Instalaciones de alto riesgo SIEMPRE detallado
    if tipo_str in INSTALACIONES_DISENO_OBLIGATORIO:
        return {
            "tipo_diseno": TipoDiseno.DETALLADO,
            "razon": f"Instalación clasificada como '{tipo_str}' — requiere diseño detallado obligatorio según RETIE Art. 3.3.1.",
            "articulo_aplicable": "Art. 3.3.1 / Art. 10.1.2",
        }

    # Regla 2: Más de 4 cuentas → detallado
    if num_cuentas > LIMITE_CUENTAS_SIMPLIFICADO:
        return {
            "tipo_diseno": TipoDiseno.DETALLADO,
            "razon": f"Más de {LIMITE_CUENTAS_SIMPLIFICADO} cuentas ({num_cuentas}) — requiere diseño detallado según RETIE Art. 3.3.1.",
            "articulo_aplicable": "Art. 3.3.1 / Art. 10.1.2",
        }

    # Regla 3: Más de 10 kVA → detallado
    if kva_instalados > LIMITE_SIMPLIFICADO_KVA:
        return {
            "tipo_diseno": TipoDiseno.DETALLADO,
            "razon": f"Carga instalada ({kva_instalados} kVA) > {LIMITE_SIMPLIFICADO_KVA} kVA — requiere diseño detallado según RETIE Art. 10.1.2.",
            "articulo_aplicable": "Art. 10.1.2",
        }

    # Regla 4: Requiere dictamen → detallado
    if requiere_dictamen:
        return {
            "tipo_diseno": TipoDiseno.DETALLADO,
            "razon": "Requiere dictamen de inspección — aplica diseño detallado según RETIE Art. 4.3.2 / Art. 3.3.1.",
            "articulo_aplicable": "Art. 4.3.2 / Art. 3.3.1",
        }

    # Regla 5: Caso base → simplificado
    return {
        "tipo_diseno": TipoDiseno.SIMPLIFICADO,
        "razon": f"Carga ≤ {LIMITE_SIMPLIFICADO_KVA} kVA, hasta {LIMITE_CUENTAS_SIMPLIFICADO} cuentas — aplica diseño simplificado según RETIE Art. 10.1.1.",
        "articulo_aplicable": "Art. 10.1.1",
    }


# =============================================================================
# ITEMS DEL DISEÑO DETALLADO — Art. 3.3.1.1 (a-x)
# =============================================================================

ITEMS_DISENO_DETALLADO = {
    "a": {
        "id": "a",
        "titulo": "Análisis de riesgos de origen eléctrico y mitigación",
        "descripcion": "Identificación de peligros eléctricos (choque, arco, incendio, explosión) y medidas de control aplicables según RETIE Capítulo 4.",
        "norma_ref": "RETIE Art. 3.3.1.1(a) / Art. 4.1",
        "calculable_por_app": False,
        "requerido_para": "todas",
    },
    "b": {
        "id": "b",
        "titulo": "Análisis de riesgos por descargas atmosféricas y protección",
        "descripcion": "Evaluación del nivel de riesgo por rayos (NTC 4552) y especificación de sistema de protección contra descargas atmosféricas (SPDA).",
        "norma_ref": "RETIE Art. 3.3.1.1(b) / NTC 4552",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "generacion_fncer", "grandes_superficies", "industrial", "institucional", "urbanizacion"],
    },
    "c": {
        "id": "c",
        "titulo": "Análisis y cálculo de cargas",
        "descripcion": "Cuadro de cargas detallado: potencia instalada, demanda máxima, factor de potencia, armónicos y proyección futura.",
        "norma_ref": "RETIE Art. 3.3.1.1(c) / NTC 2050 Art. 220",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/potencia",
        "requerido_para": "todas",
    },
    "d": {
        "id": "d",
        "titulo": "Coordinación de aislamiento eléctrico",
        "descripcion": "Selección de niveles de aislamiento según tensión nominal, categoría de sobretensión y grado de polución (NTC-IEC 60664).",
        "norma_ref": "RETIE Art. 3.3.1.1(d) / NTC-IEC 60664",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "industrial", "generacion_fncer"],
    },
    "e": {
        "id": "e",
        "titulo": "Análisis de cortocircuito, arco eléctrico y falla a tierra",
        "descripcion": "Cálculo de corrientes de falla trifásica, monofásica y de arco. Verificación de capacidad de interrupción de protecciones.",
        "norma_ref": "RETIE Art. 3.3.1.1(e) / IEC 60909",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "industrial", "generacion_fncer", "grandes_superficies", "urbanizacion"],
    },
    "f": {
        "id": "f",
        "titulo": "Análisis del nivel de tensión requerido",
        "descripcion": "Justificación del nivel de tensión seleccionado (BT, MT, AT) según carga, distancia y normativa del operador de red.",
        "norma_ref": "RETIE Art. 3.3.1.1(f)",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/seccion",
        "requerido_para": "todas",
    },
    "g": {
        "id": "g",
        "titulo": "Cálculos de campos electromagnéticos",
        "descripcion": "Estimación de campos eléctricos y magnéticos en zonas de permanencia. Cumplimiento límites ICNIRP / RETIE.",
        "norma_ref": "RETIE Art. 3.3.1.1(g) / ICNIRP 2010",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "lineas_transmision", "centrales_generacion"],
    },
    "h": {
        "id": "h",
        "titulo": "Cálculo de transformadores",
        "descripcion": "Dimensionamiento considerando demanda, armónicos (factor K), factor de potencia, ventilación y protecciones.",
        "norma_ref": "RETIE Art. 3.3.1.1(h) / NTC 2050 Art. 450",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "industrial", "generacion_fncer", "grandes_superficies", "urbanizacion"],
    },
    "i": {
        "id": "i",
        "titulo": "Sistema de puesta a tierra (SPT)",
        "descripcion": "Cálculo de resistencia de puesta a tierra, dimensionamiento de electrodos y conductor de tierra según IEEE 142 / NTC 2050 Art. 250.",
        "norma_ref": "RETIE Art. 3.3.1.1(i) / NTC 2050 Art. 250 / IEEE 142",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/puesta_tierra",
        "requerido_para": "todas",
    },
    "j": {
        "id": "j",
        "titulo": "Cálculo económico de conductores",
        "descripcion": "Selección óptima considerando costo inicial, pérdidas I²R, costo de energía y vida útil (IEC 60287).",
        "norma_ref": "RETIE Art. 3.3.1.1(j) / IEC 60287",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/seccion",
        "requerido_para": ["industrial", "subestacion", "generacion_fncer", "grandes_superficies"],
    },
    "k": {
        "id": "k",
        "titulo": "Especificación de conductores",
        "descripcion": "Selección por ampacidad (Tabla 310-16), derating por temperatura y agrupamiento, verificación de cortocircuito (IEC 60909).",
        "norma_ref": "RETIE Art. 3.3.1.1(k) / NTC 2050 Art. 310 / IEC 60909",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/seccion",
        "requerido_para": "todas",
    },
    "l": {
        "id": "l",
        "titulo": "Cálculo mecánico de estructuras",
        "descripcion": "Análisis estructural de soportes, bandejas, postes y herrajes según cargas de viento, sismo y peso propio (NTC 5943 / NSR-10).",
        "norma_ref": "RETIE Art. 3.3.1.1(l) / NSR-10 / NTC 5943",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "lineas_transmision", "redes_distribucion", "centrales_generacion", "generacion_fncer"],
    },
    "m": {
        "id": "m",
        "titulo": "Cálculo y coordinación de protecciones contra sobrecorrientes",
        "descripcion": "Coordinación selectiva de breakers y fusibles. En BT se permite coordinación por limitación de corriente (IEC 60947-2).",
        "norma_ref": "RETIE Art. 3.3.1.1(m) / NTC 2050 Art. 240 / IEC 60947-2",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/protecciones",
        "requerido_para": "todas",
    },
    "n": {
        "id": "n",
        "titulo": "Cálculos de canalizaciones",
        "descripcion": "Dimensionamiento de tuberías, ductos, bandejas portacables y encerramientos según ocupación máxima (Capítulo 9 NTC 2050).",
        "norma_ref": "RETIE Art. 3.3.1.1(n) / NTC 2050 Capítulo 9",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/seccion",
        "requerido_para": "todas",
    },
    "o": {
        "id": "o",
        "titulo": "Cálculo de pérdidas de energía",
        "descripcion": "Estimación de pérdidas por efecto Joule, armónicos y bajo factor de potencia. Verificación de eficiencia energética.",
        "norma_ref": "RETIE Art. 3.3.1.1(o) / NTC 2050 Art. 220",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/reactiva",
        "requerido_para": ["industrial", "subestacion", "grandes_superficies", "generacion_fncer"],
    },
    "p": {
        "id": "p",
        "titulo": "Cálculos de regulación de tensión",
        "descripcion": "Verificación de caída de tensión desde la fuente hasta la carga más lejana. Cumplimiento límites NTC 2050 Art. 210-19 (3% ramales, 5% total).",
        "norma_ref": "RETIE Art. 3.3.1.1(p) / NTC 2050 Art. 210-19",
        "calculable_por_app": True,
        "endpoint_relacionado": "/api/calculos/seccion",
        "requerido_para": "todas",
    },
    "q": {
        "id": "q",
        "titulo": "Áreas clasificadas como peligrosas",
        "descripcion": "Identificación de atmósferas explosivas (Clase I/II/III, División 1/2) y especificación de equipos a prueba de explosión (NTC 2050 Cap. 5).",
        "norma_ref": "RETIE Art. 3.3.1.1(q) / NTC 2050 Capítulo 5",
        "calculable_por_app": False,
        "requerido_para": ["industrial", "subestacion", "generacion_fncer"],
    },
    "r": {
        "id": "r",
        "titulo": "Diagramas unifilares",
        "descripcion": "Representación simplificada de la instalación: tableros, protecciones, calibres, cargas y punto de conexión.",
        "norma_ref": "RETIE Art. 3.3.1.1(r) / NTC 2050 Art. 215",
        "calculable_por_app": True,
        "requerido_para": "todas",
    },
    "s": {
        "id": "s",
        "titulo": "Planos eléctricos para construcción",
        "descripcion": "Planos de planta con ubicación de salidas, tableros, canalizaciones, detalles de montaje y simbología NTC.",
        "norma_ref": "RETIE Art. 3.3.1.1(s)",
        "calculable_por_app": False,
        "requerido_para": "todas",
    },
    "t": {
        "id": "t",
        "titulo": "Especificaciones técnicas de construcción",
        "descripcion": "Ficha técnica de equipos, materiales y condiciones particulares de instalación.",
        "norma_ref": "RETIE Art. 3.3.1.1(t)",
        "calculable_por_app": False,
        "requerido_para": "todas",
    },
    "u": {
        "id": "u",
        "titulo": "Distancias de seguridad o servidumbre",
        "descripcion": "Cumplimiento de distancias mínimas de seguridad según niveles de tensión (RETIE Tabla 13.1 a 13.8).",
        "norma_ref": "RETIE Art. 3.3.1.1(u) / RETIE Cap. 13",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "lineas_transmision", "redes_distribucion", "generacion_fncer", "centrales_generacion"],
    },
    "v": {
        "id": "v",
        "titulo": "Justificación de desviaciones técnicas",
        "descripcion": "Documentación de cualquier desviación respecto a los requisitos, con justificación de seguridad equivalente.",
        "norma_ref": "RETIE Art. 3.3.1.1(v)",
        "calculable_por_app": False,
        "requerido_para": "todas",
    },
    "w": {
        "id": "w",
        "titulo": "Otros estudios requeridos",
        "descripcion": "Estudios sísmicos (NSR-10), acústicos, mecánicos y térmicos según aplique.",
        "norma_ref": "RETIE Art. 3.3.1.1(w) / NSR-10",
        "calculable_por_app": False,
        "requerido_para": ["subestacion", "centrales_generacion", "generacion_fncer", "industrial"],
    },
    "x": {
        "id": "x",
        "titulo": "Selección y especificación de equipos de generación",
        "descripcion": "Dimensionamiento de plantas de emergencia, UPS, sistemas FNCER, incluyendo conmutación automática.",
        "norma_ref": "RETIE Art. 3.3.1.1(x) / NTC 2050 Art. 700, 701, 702",
        "calculable_por_app": False,
        "requerido_para": ["generacion_fncer", "centrales_generacion", "industrial", "grandes_superficies", "institucional"],
    },
}


# =============================================================================
# MODELOS Pydantic
# =============================================================================

class RetieSolicitud(BaseModel):
    """Solicitud de generación de documento RETIE."""
    tipo_instalacion: TipoInstalacion = Field(..., description="Tipo de instalación eléctrica")
    kva_instalados: float = Field(..., gt=0, description="Carga instalada en kVA")
    num_cuentas: int = Field(1, ge=1, description="Número de cuentas o medidores")
    requiere_dictamen: bool = Field(False, description="¿Requiere dictamen de inspección RETIE?")
    nombre_proyecto: str = Field(..., description="Nombre del proyecto")
    direccion_proyecto: Optional[str] = Field(None, description="Dirección del proyecto")
    nombre_disenador: str = Field(..., description="Nombre del ingeniero diseñador")
    matricula_profesional: str = Field(..., description="Matrícula profesional del diseñador")
    datos_calculo_puesta_tierra: Optional[dict] = Field(None, description="Resultados de /api/calculos/puesta_tierra")
    datos_calculo_seccion: Optional[dict] = Field(None, description="Resultados de /api/calculos/seccion")
    datos_calculo_protecciones: Optional[dict] = Field(None, description="Resultados de /api/calculos/protecciones")
    datos_calculo_reactiva: Optional[dict] = Field(None, description="Resultados de /api/calculos/reactiva")
    fecha_emision: Optional[str] = Field(None, description="Fecha de emisión (YYYY-MM-DD)")


class ItemRetieDocumento(BaseModel):
    id: str
    titulo: str
    norma_ref: str
    calculable_por_app: bool
    aplica: bool
    estado: str  # "calculado", "pendiente", "no_aplica", "requiere_profesional"
    contenido: Optional[str] = None  # Texto del cálculo o justificación


class RetieDocumentoOutput(BaseModel):
    """Documento RETIE completo generado."""
    tipo_documento: str = "MEMORIA DE DISEÑO ELÉCTRICO RETIE 2024"
    clasificacion: dict
    datos_proyecto: dict
    items_diseno: list[ItemRetieDocumento]
    resumen_cumplimiento: dict
    declaracion_responsabilidad: str
    firma_digital: dict


# =============================================================================
# SERVICIO PRINCIPAL
# =============================================================================

def _item_aplica(item_id: str, tipo_instalacion: str, tipo_diseno: TipoDiseno) -> bool:
    """Determina si un item del diseño aplica para esta instalación."""
    item = ITEMS_DISENO_DETALLADO[item_id]
    requerido = item["requerido_para"]

    if requerido == "todas":
        return tipo_diseno == TipoDiseno.DETALLADO

    return tipo_instalacion in requerido


def generar_documento_retie(solicitud: RetieSolicitud) -> RetieDocumentoOutput:
    """
    Genera el documento de memoria de diseño RETIE 2024 completo.

    Incluye:
    - Clasificación automática (simplificado vs detallado)
    - Lista de items a-x con estado de cumplimiento
    - Datos calculados desde los endpoints del backend
    - Declaración de responsabilidad profesional
    """
    # 1. Clasificar instalación
    clasificacion = clasificar_instalacion(
        tipo=solicitud.tipo_instalacion,
        kva_instalados=solicitud.kva_instalados,
        num_cuentas=solicitud.num_cuentas,
        requiere_dictamen=solicitud.requiere_dictamen,
    )

    # 2. Procesar items del diseño detallado
    items_procesados = []
    for item_id, item_data in ITEMS_DISENO_DETALLADO.items():
        aplica = _item_aplica(
            item_id,
            solicitud.tipo_instalacion.value,
            clasificacion["tipo_diseno"],
        )

        if not aplica:
            if clasificacion["tipo_diseno"] == TipoDiseno.SIMPLIFICADO:
                estado = "no_aplica_diseno_simplificado"
                contenido = "No requerido para diseño simplificado según RETIE Art. 10.1.1."
            else:
                estado = "no_aplica_tipo_instalacion"
                contenido = f"No aplica para instalación tipo '{solicitud.tipo_instalacion.value}'."
        elif item_data["calculable_por_app"]:
            estado = "calculado_por_app"
            contenido = _generar_contenido_calculado(item_id, solicitud)
        else:
            estado = "requiere_profesional"
            contenido = _generar_guia_profesional(item_id, solicitud)

        items_procesados.append(ItemRetieDocumento(
            id=item_id,
            titulo=item_data["titulo"],
            norma_ref=item_data["norma_ref"],
            calculable_por_app=item_data["calculable_por_app"],
            aplica=aplica,
            estado=estado,
            contenido=contenido,
        ))

    # 3. Resumen de cumplimiento
    total_items = len(items_procesados)
    items_aplican = sum(1 for i in items_procesados if i.aplica)
    items_calculados = sum(1 for i in items_procesados if i.estado == "calculado_por_app")
    items_pendientes = items_aplican - items_calculados

    resumen = {
        "total_items_retie": total_items,
        "items_aplican": items_aplican,
        "items_calculados_por_app": items_calculados,
        "items_requieren_profesional": items_pendientes,
        "porcentaje_automatizado": round(items_calculados / items_aplican * 100, 1) if items_aplican > 0 else 0,
    }

    # 4. Declaración de responsabilidad
    declaracion = (
        f"El suscrito {solicitud.nombre_disenador}, identificado con matrícula profesional "
        f"No. {solicitud.matricula_profesional}, en mi calidad de ingeniero competente "
        f"según lo establecido en las Leyes 51 de 1986 y 842 de 2003, certifico que "
        f"la presente memoria de diseño eléctrico para el proyecto "
        f"'{solicitud.nombre_proyecto}' cumple con los requisitos establecidos en el "
        f"Reglamento Técnico de Instalaciones Eléctricas RETIE 2024, la NTC 2050 "
        f"Segunda Actualización y demás normas técnicas aplicables. "
        f"La instalación clasifica como diseño {clasificacion['tipo_diseno'].value} "
        f"según {clasificacion['articulo_aplicable']}. "
        f"Los cálculos aquí presentados son responsabilidad del diseñador y deben ser "
        f"verificados en campo durante la construcción. "
        f"Este documento no exime al constructor de cumplir con las buenas prácticas "
        f"de ingeniería y las disposiciones de seguridad del RETIE durante la ejecución."
    )

    return RetieDocumentoOutput(
        clasificacion=clasificacion,
        datos_proyecto={
            "nombre": solicitud.nombre_proyecto,
            "direccion": solicitud.direccion_proyecto or "No especificada",
            "tipo_instalacion": solicitud.tipo_instalacion.value,
            "kva_instalados": solicitud.kva_instalados,
            "num_cuentas": solicitud.num_cuentas,
            "fecha_emision": solicitud.fecha_emision or "Por definir",
        },
        items_diseno=items_procesados,
        resumen_cumplimiento=resumen,
        declaracion_responsabilidad=declaracion,
        firma_digital={
            "nombre_disenador": solicitud.nombre_disenador,
            "matricula_profesional": solicitud.matricula_profesional,
            "tipo_documento": "Memoria de Diseño Eléctrico RETIE 2024",
            "requiere_firma": True,
        },
    )


def _generar_contenido_calculado(item_id: str, solicitud: RetieSolicitud) -> str:
    """Genera el contenido pre-calculado para un item usando los datos existentes."""

    if item_id == "c":  # Análisis de cargas
        return (
            f"CARGA INSTALADA: {solicitud.kva_instalados} kVA. "
            f"El cuadro de cargas detallado se presenta en anexo. "
            f"Factor de potencia objetivo: ≥ 0.90 según RETIE Art. 12.3. "
            f"Verifique el cumplimiento de la NTC 2050 Art. 220 para el "
            f"cálculo de circuitos ramales y alimentadores."
        )

    elif item_id == "f":  # Nivel de tensión
        # Inferir tensión de los datos de cálculo
        tension = "208V / 120V"
        if solicitud.datos_calculo_seccion:
            tension = f"{solicitud.datos_calculo_seccion.get('tension', '208')}V"
        return (
            f"NIVEL DE TENSIÓN SELECCIONADO: {tension}. "
            f"Baja tensión conforme a configuraciones estándar colombianas. "
            f"Justificación: carga total de {solicitud.kva_instalados} kVA "
            f"es adecuada para suministro en BT según límites del operador de red local."
        )

    elif item_id == "i":  # SPT
        if solicitud.datos_calculo_puesta_tierra:
            datos = solicitud.datos_calculo_puesta_tierra
            r_total = datos.get("r_total", "N/D")
            cumple = "✓ CUMPLE" if datos.get("cumple") else "⚠ NO CUMPLE"
            return (
                f"SISTEMA DE PUESTA A TIERRA: {datos.get('num_varillas', '?')} varilla(s) "
                f"de {datos.get('sugerencia', '').split('.')[0] if datos.get('sugerencia') else 'Cu 5/8 pulg x 2.4m'}. "
                f"Resistencia calculada: {r_total} Ω. {cumple} "
                f"límite NTC 2050 Art. 250-56 (25 Ω). "
                f"Conductor de tierra: {datos.get('conductor_tierra', 'Verificar')}. "
                f"Resistividad del terreno: {datos.get('rho_usado', 'N/D')} Ω-m."
            )
        return "SPT pendiente de cálculo. Ejecute /api/calculos/puesta_tierra con los datos del terreno."

    elif item_id == "j":  # Cálculo económico
        if solicitud.datos_calculo_seccion:
            datos = solicitud.datos_calculo_seccion
            return (
                f"CONDUCTOR SELECCIONADO: {datos.get('conductor', 'Verificar')} "
                f"({datos.get('seccion_mm2', '?')} mm²). "
                f"Caída de tensión: {datos.get('caida_tension', '?')}%. "
                f"Para cálculo económico completo (IEC 60287), considere: "
                f"costo del conductor, pérdidas I²R anuales, tarifa de energía "
                f"y factor de carga típico de la instalación."
            )
        return "Cálculo económico pendiente. Se requiere análisis de ciclo de vida del conductor."

    elif item_id == "k":  # Especificación de conductores
        if solicitud.datos_calculo_seccion:
            datos = solicitud.datos_calculo_seccion
            return (
                f"CONDUCTOR: {datos.get('conductor', 'Verificar')} "
                f"{datos.get('seccion_mm2', '?')} mm² "
                f"({datos.get('configuracion', '')}). "
                f"Corriente nominal: {datos.get('corriente_nom', '?')} A. "
                f"Corriente de diseño: {datos.get('corriente_design', '?')} A. "
                f"Columna selección: {datos.get('columna_terminales', '60°C')} "
                f"según Art. 110-14(c). "
                f"Factor temperatura: {datos.get('factor_temp', '1.0')}. "
                f"Factor agrupamiento: {datos.get('factor_agrup', '1.0')}. "
                f"Criterio gobernante: {datos.get('criterio_seleccion', 'Terminales')}."
            )
        return "Especificación de conductores pendiente. Ejecute /api/calculos/seccion."

    elif item_id == "m":  # Protecciones
        if solicitud.datos_calculo_protecciones:
            datos = solicitud.datos_calculo_protecciones
            return (
                f"PROTECCIÓN PRINCIPAL: Breaker {datos.get('breaker', '?')}A, "
                f"{datos.get('num_polos', '3')} polos, "
                f"tensión {datos.get('tension', '208')}V. "
                f"Corriente de carga: {datos.get('corriente_carga', '?')} A. "
                f"Corriente de diseño: {datos.get('corriente_design', '?')} A "
                f"({datos.get('factor_usado', '125%')}). "
                f"Potencia máxima soportada: {datos.get('potencia_max', '?')} VA. "
                f"Coordinación selectiva requiere análisis completo aguas abajo."
            )
        return "Coordinación de protecciones pendiente. Ejecute /api/calculos/protecciones."

    elif item_id == "n":  # Canalizaciones
        if solicitud.datos_calculo_seccion:
            datos = solicitud.datos_calculo_seccion
            return (
                f"CANALIZACIÓN: Tubería PVC {datos.get('diametro_canalizacion', 'Verificar')}, "
                f"{datos.get('total_conductores_tuberia', '?')} conductores. "
                f"Fill calculado según NTC 2050 Capítulo 9, Tabla 5. "
                f"Conductor de tierra: {datos.get('calibre_tierra', 'Verificar')} "
                f"({datos.get('seccion_tierra_mm2', '?')} mm²)."
            )
        return "Cálculo de canalizaciones pendiente. Ejecute /api/calculos/seccion."

    elif item_id == "o":  # Pérdidas
        if solicitud.datos_calculo_reactiva:
            datos = solicitud.datos_calculo_reactiva
            return (
                f"FACTOR DE POTENCIA: {datos.get('fp_actual', '?')} → "
                f"objetivo {datos.get('fp_objetivo', '0.95')}. "
                f"kVAR requeridos: {datos.get('qc', '?')}. "
                f"Ahorro: {datos.get('ahorro_kva', '?')} kVA. "
                f"{'⚠ APLICA PENALIZACIÓN CREG 108/1997' if datos.get('penalizacion') else '✓ Cumple RETIE Art. 12.3'}. "
                f"Las pérdidas I²R deben calcularse con la resistencia del conductor "
                f"y el perfil de carga de la instalación."
            )
        return "Cálculo de pérdidas pendiente. Ejecute /api/calculos/reactiva."

    elif item_id == "p":  # Regulación
        if solicitud.datos_calculo_seccion:
            datos = solicitud.datos_calculo_seccion
            caida = datos.get("caida_tension", "?")
            cumple = "✓ CUMPLE" if datos.get("caida_cumple") else "⚠ EXCEDE"
            return (
                f"REGULACIÓN DE TENSIÓN: Caída calculada = {caida}%. {cumple} "
                f"límites NTC 2050 Art. 210-19 (ramales ≤ 3%, alimentador + ramal ≤ 5%). "
                f"{datos.get('alerta_caida', '') if datos.get('alerta_caida') else ''}"
            )
        return "Cálculo de regulación pendiente. Ejecute /api/calculos/seccion."

    elif item_id == "r":  # Diagrama unifilar
        return (
            f"DIAGRAMA UNIFILAR: Se requiere representación gráfica con: "
            f"acometida → medidor → tablero principal → protecciones → "
            f"circuitos ramales. Incluir calibres de conductores, "
            f"capacidad de breakers y cargas conectadas. "
            f"Este diagrama se genera en la sección de planos del proyecto."
        )

    return f"Item {item_id}: Pendiente de documentación detallada por el profesional responsable."


def _generar_guia_profesional(item_id: str, solicitud: RetieSolicitud) -> str:
    """Genera una guía para que el profesional complete el item manualmente."""
    item = ITEMS_DISENO_DETALLADO[item_id]
    return (
        f"[REQUIERE ELABORACIÓN PROFESIONAL] "
        f"Este ítem debe ser desarrollado por {solicitud.nombre_disenador}, "
        f"ingeniero con matrícula {solicitud.matricula_profesional}. "
        f"Referencia normativa: {item['norma_ref']}. "
        f"Descripción: {item['descripcion']}"
    )
