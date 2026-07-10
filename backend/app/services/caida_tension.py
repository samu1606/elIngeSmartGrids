"""
Cálculo de caída de tensión para múltiples tramos en serie.
NTC 2050 — Art. 210-19, Nota informativa.
"""

import math

# Resistividad a 75°C (ohm·cmil/ft)
RESISTIVIDAD = {"cu": 12.9, "al": 21.2}

# Reactancia aproximada (ohm/1000 ft)
REACTANCIA_POR_1000FT = 0.05  # valor típico para conductores en tubería

# Áreas de conductores AWG en cmil
AWG_CMIL = {
    "14 AWG": 4107, "12 AWG": 6530, "10 AWG": 10380, "8 AWG": 16510,
    "6 AWG": 26240, "4 AWG": 41740, "3 AWG": 52620, "2 AWG": 66360,
    "1 AWG": 83690, "1/0 AWG": 105600, "2/0 AWG": 133100, "3/0 AWG": 167800,
    "4/0 AWG": 211600, "250 kcmil": 250000, "350 kcmil": 350000,
    "500 kcmil": 500000,
}


def calcular_caida_tension(
    tramos: list,
    tension_nominal: float = 208,
    sistema: str = "trifasico",
) -> dict:
    """
    Calcula la caída de tensión acumulada en múltiples tramos.

    Cada tramo: {longitud_m, corriente_a, calibre, material}
    """
    factor = math.sqrt(3) if sistema == "trifasico" else 2.0
    caida_total = 0.0
    detalle = []

    for i, t in enumerate(tramos):
        longitud_m = t.get("longitud_m", 10)
        corriente = t.get("corriente_a", 20)
        calibre = t.get("calibre", "12 AWG")
        material = t.get("material", "cu")

        rho = RESISTIVIDAD.get(material, 12.9)
        cmil = AWG_CMIL.get(calibre, 6530)

        # Resistencia: R = rho * L / cmil, L en pies
        longitud_ft = longitud_m * 3.28084
        r = rho * longitud_ft / cmil
        x = REACTANCIA_POR_1000FT * longitud_ft / 1000.0

        # Caída de tensión: V = I * (R*cosφ + X*sinφ) * factor
        # Simplificado sin FP: V = I * Z * factor
        z = math.sqrt(r**2 + x**2)
        caida_v = corriente * z * factor
        caida_pct = (caida_v / tension_nominal) * 100

        caida_total += caida_v
        detalle.append({
            "tramo": i + 1,
            "longitud_m": longitud_m,
            "corriente_a": corriente,
            "calibre": calibre,
            "material": material,
            "resistencia_r": round(r, 4),
            "reactancia_x": round(x, 4),
            "caida_v": round(caida_v, 2),
            "caida_pct": round(caida_pct, 2),
        })

    caida_total_pct = (caida_total / tension_nominal) * 100
    cumple_ramales = caida_total_pct <= 3.0
    cumple_total = caida_total_pct <= 5.0
    cumple = cumple_total

    justificacion = (
        f"Caída de tensión acumulada: {caida_total:.2f} V ({caida_total_pct:.2f}%). "
        f"Tensión nominal: {tension_nominal} V. Sistema: {sistema}. "
        f"NTC 2050 recomienda máximo 3% en ramales y 5% total "
        f"(Art. 210-19 Nota informativa). "
        f"{'Cumple' if cumple else 'NO cumple'} el límite del 5%."
    )

    return {
        "detalle_tramos": detalle,
        "caida_total_v": round(caida_total, 2),
        "caida_total_pct": round(caida_total_pct, 2),
        "cumple_ramales_3pct": cumple_ramales,
        "cumple_total_5pct": cumple_total,
        "cumple": cumple,
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Art. 210-19, Cap. 9 Tabla 8-9",
    }