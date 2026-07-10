"""
Cálculo de corrientes de cortocircuitito (método simplificado por impedancia).
NTC 2050 — Capítulo 10, Art. 110-9, 110-10.
"""

import math

# Resistividad (ohm·cmil/ft)
RESISTIVIDAD = {"cu": 12.9, "al": 21.2}
REACTANCIA_POR_1000FT = 0.05

AWG_CMIL = {
    "14 AWG": 4107, "12 AWG": 6530, "10 AWG": 10380, "8 AWG": 16510,
    "6 AWG": 26240, "4 AWG": 41740, "3 AWG": 52620, "2 AWG": 66360,
    "1 AWG": 83690, "1/0 AWG": 105600, "2/0 AWG": 133100, "3/0 AWG": 167800,
    "4/0 AWG": 211600, "250 kcmil": 250000, "350 kcmil": 350000,
    "500 kcmil": 500000,
}

# Capacidades interruptiva estándar (AIC)
AIC_ESTANDAR = [10000, 14000, 18000, 22000, 25000, 35000, 50000, 65000, 100000]


def calcular_cortocircuito(
    potencia_trafo_kva: float,
    impedancia_z_pct: float,
    longitud_alimentador_m: float,
    calibre_alimentador: str,
    material: str = "cu",
    sistema: str = "trifasico",
    tension: float = 208,
) -> dict:
    """
    Cálculo simplificado de Icc por método de impedancia.
    """
    # Paso 1: Icc en bornes del transformador
    if sistema == "trifasico":
        icc_trafo = (potencia_trafo_kva * 1000) / (math.sqrt(3) * tension * (impedancia_z_pct / 100))
    else:
        icc_trafo = (potencia_trafo_kva * 1000) / (tension * (impedancia_z_pct / 100))

    # Paso 2: Impedancia del alimentador
    rho = RESISTIVIDAD.get(material, 12.9)
    cmil = AWG_CMIL.get(calibre_alimentador, 66360)
    longitud_ft = longitud_alimentador_m * 3.28084

    r = rho * longitud_ft / cmil
    x = REACTANCIA_POR_1000FT * longitud_ft / 1000.0
    z_alimentador = math.sqrt(r**2 + x**2)

    # Paso 3: Icc en punto de carga (divisor de impedancia)
    # Z_trafo = V / (sqrt(3) * Icc_trafo) para trifásico
    if sistema == "trifasico":
        z_trafo = tension / (math.sqrt(3) * icc_trafo)
    else:
        z_trafo = tension / icc_trafo

    z_total = z_trafo + z_alimentador

    if sistema == "trifasico":
        icc_punto = tension / (math.sqrt(3) * z_total)
    else:
        icc_punto = tension / z_total

    # Paso 4: AIC requerido
    aic_requerido = AIC_ESTANDAR[-1]
    for aic in AIC_ESTANDAR:
        if aic >= icc_punto:
            aic_requerido = aic
            break

    # Nivel de cortocircuito
    if icc_punto < 10000:
        nivel = "Bajo"
        riesgo_color = "verde"
    elif icc_punto < 25000:
        nivel = "Medio"
        riesgo_color = "amarillo"
    elif icc_punto < 50000:
        nivel = "Alto"
        riesgo_color = "naranja"
    else:
        nivel = "Muy Alto"
        riesgo_color = "rojo"

    justificacion = (
        f"Potencia del transformador: {potencia_trafo_kva} kVA, "
        f"Impedancia: {impedancia_z_pct}%. "
        f"Icc en bornes del transformador: {icc_trafo:.0f} A. "
        f"Alimentador: {calibre_alimentador} ({material}), {longitud_alimentador_m} m. "
        f"Impedancia del alimentador: {z_alimentador:.4f} Ω. "
        f"Icc en punto de carga: {icc_punto:.0f} A. "
        f"AIC mínimo requerido: {aic_requerido:,} A. "
        f"Nivel de cortocircuito: {nivel}. "
        f"NTC 2050 Art. 110-9 requiere que todos los equipos tengan "
        f"una capacidad interruptiva igual o superior a la Icc disponible."
    )

    return {
        "icc_trafo": round(icc_trafo, 0),
        "icc_punto_carga": round(icc_punto, 0),
        "z_trafo": round(z_trafo, 4),
        "z_alimentador": round(z_alimentador, 4),
        "r_alimentador": round(r, 4),
        "x_alimentador": round(x, 4),
        "aic_requerido": aic_requerido,
        "nivel_cortocircuito": nivel,
        "riesgo": riesgo_color,
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Art. 110-9, Art. 110-10, Cap. 10",
    }