"""
Diseño de protección contra rayos según RETIE (2024) Art. 17.
Método del ángulo de protección (cónico).
"""

import math

# Niveles de protección RETIE — Tabla 17.1
NIVELES_PROTECCION = {
    "I": {
        "angulo_max": 30,  # grados para altura <= 20m
        "radio_efectivo": 20,  # m
        "descargas_esperadas": 0.01,  # por año
        "uso": "Estructuras críticas, explosivos, hospitales",
    },
    "II": {
        "angulo_max": 35,
        "radio_efectivo": 30,
        "descargas_esperadas": 0.05,
        "uso": "Industrias químicas, telecomunicaciones, edificios >50m",
    },
    "III": {
        "angulo_max": 40,
        "radio_efectivo": 45,
        "descargas_esperadas": 0.1,
        "uso": "Edificios comerciales, industriales, multivivienda",
    },
    "IV": {
        "angulo_max": 45,
        "radio_efectivo": 60,
        "descargas_esperadas": 0.2,
        "uso": "Residencias, estructuras comunes",
    },
}

# Separación mínima entre pararrayos (m) según nivel
SEPARACION_MAX = {"I": 10, "II": 15, "III": 20, "IV": 25}


def calcular_pararrayos(
    tipo_estructura: str = "residencial",
    altura_m: float = 10,
    area_m2: float = 200,
    nivel_proteccion: str = "IV",
) -> dict:
    """
    Calcula el diseño de protección contra rayos.
    """
    nivel = nivel_proteccion if nivel_proteccion in NIVELES_PROTECCION else "IV"
    config = NIVELES_PROTECCION[nivel]
    angulo = config["angulo_max"]
    radio_efectivo = config["radio_efectivo"]

    # Radio de protección a la altura h (método del ángulo)
    # r = h * tan(angulo) para la altura de la punta del pararrayos
    if altura_m <= 20:
        angulo_usado = angulo
    elif altura_m <= 30:
        # Reducir ángulo para alturas mayores
        proporcion = 1 - (altura_m - 20) / 100
        angulo_usado = angulo * max(proporcion, 0.5)
    else:
        angulo_usado = angulo * 0.5

    radio_proteccion = altura_m * math.tan(math.radians(angulo_usado))

    # Área cubierta por un pararrayos
    area_cobertura_uno = math.pi * radio_proteccion ** 2

    # Número de pararrayos necesarios
    if area_cobertura_uno >= area_m2:
        num_pararrayos = 1
    else:
        # Cobertura con solape del 15%
        area_efectiva = area_cobertura_uno * 0.85
        num_pararrayos = math.ceil(area_m2 / area_efectiva)
        num_pararrayos = max(num_pararrayos, 1)

    # Separación entre pararrayos
    sep_max = SEPARACION_MAX.get(nivel, 25)
    if num_pararrayos > 1:
        # Distribución aproximada: cuadrícula
        lado_aprox = math.sqrt(area_m2)
        num_por_lado = math.ceil(math.sqrt(num_pararrayos))
        separacion = lado_aprox / num_por_lado
        separacion = min(separacion, sep_max)
    else:
        separacion = 0

    # Cumple RETIE
    cumple_retie = True
    if altura_m > 50 and nivel in ["III", "IV"]:
        cumple_retie = False  # Estructuras >50m requieren mínimo nivel II

    estado_retie = "Cumple" if cumple_retie else "Requiere nivel superior (II o I)"

    justificacion = (
        f"Estructura tipo: {tipo_estructura}, altura: {altura_m} m, área: {area_m2} m². "
        f"Nivel de protección RETIE: {nivel}. "
        f"Ángulo de protección: {angulo_usado:.1f}°. "
        f"Radio de protección: {radio_proteccion:.1f} m. "
        f"Área cubierta por pararrayos: {area_cobertura_uno:.0f} m². "
        f"Número de pararrayos: {num_pararrayos}. "
        f"Separación entre pararrayos: {separacion:.1f} m. "
        f"Uso típico nivel {nivel}: {config['uso']}. "
        f"{'Cumple' if cumple_retie else 'NO cumple'} RETIE Art. 17. "
        f"RETIE requiere protección para estructuras >15m o con riesgo de rayos."
    )

    return {
        "nivel_proteccion": nivel,
        "angulo_proteccion_grados": round(angulo_usado, 1),
        "radio_proteccion_m": round(radio_proteccion, 1),
        "area_cobertura_uno_m2": round(area_cobertura_uno, 0),
        "num_pararrayos": num_pararrayos,
        "separacion_entre_m": round(separacion, 1),
        "cumple_retie": cumple_retie,
        "estado_retie": estado_retie,
        "descargas_esperadas_por_anio": config["descargas_esperadas"],
        "justificacion": justificacion,
        "tabla_referencia": "RETIE 2024 Art. 17, Tablas 17.1 y 17.2",
    }