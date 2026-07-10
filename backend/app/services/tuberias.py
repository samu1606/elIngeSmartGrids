"""
Dimensionamiento de tuberías conduit según NTC 2050.
Tablas 4 y 5 del Capítulo 9.
"""

# Áreas de conductores (mm²) — Tabla 5 Cap. 9 NTC 2050
AREA_CONDUCTOR_MM2 = {
    "14 AWG THW": 3.31, "14 AWG THHN": 2.08,
    "12 AWG THW": 5.26, "12 AWG THHN": 3.31,
    "10 AWG THW": 8.37, "10 AWG THHN": 5.26,
    "8 AWG THW": 13.30, "8 AWG THHN": 8.37,
    "6 AWG THW": 21.15, "6 AWG THHN": 13.30,
    "4 AWG THW": 33.62, "4 AWG THHN": 21.15,
    "3 AWG THW": 42.41, "3 AWG THHN": 26.67,
    "2 AWG THW": 53.49, "2 AWG THHN": 33.62,
    "1 AWG THW": 67.43, "1 AWG THHN": 42.41,
    "1/0 AWG THW": 85.01, "1/0 AWG THHN": 53.49,
    "2/0 AWG THW": 107.2, "2/0 AWG THHN": 67.43,
    "3/0 AWG THW": 135.3, "3/0 AWG THHN": 85.01,
    "4/0 AWG THW": 170.9, "4/0 AWG THHN": 107.2,
}

# Áreas internas de tuberías (mm²) — Tabla 4 Cap. 9 NTC 2050 (PVC tipo A)
# Diámetro comercial → área interna mm²
TUBO_PVC_AREAS = {
    "1/2\" (16mm)": 128, "3/4\" (21mm)": 211, "1\" (27mm)": 353,
    "1-1/4\" (35mm)": 579, "1-1/2\" (41mm)": 797, "2\" (53mm)": 1393,
    "2-1/2\" (63mm)": 1987, "3\" (78mm)": 3034, "3-1/2\" (91mm)": 4138,
    "4\" (103mm)": 5325, "5\" (129mm)": 8323, "6\" (155mm)": 12110,
}

TUBO_EMT_AREAS = {
    "1/2\"": 132, "3/4\"": 211, "1\"": 353, "1-1/4\"": 579,
    "1-1/2\"": 797, "2\"": 1393, "2-1/2\"": 2215, "3\"": 3237,
    "3-1/2\"": 4122, "4\"": 5345,
}

TUBO_RMC_AREAS = {
    "1/2\"": 126, "3/4\"": 211, "1\"": 353, "1-1/4\"": 579,
    "1-1/2\"": 797, "2\"": 1393, "2-1/2\"": 1987, "3\"": 3034,
    "3-1/2\"": 4138, "4\"": 5325,
}

TUBOS = {
    "PVC": TUBO_PVC_AREAS, "EMT": TUBO_EMT_AREAS, "RMC": TUBO_RMC_AREAS,
}


def calcular_tuberias(
    conductores: list,
    tipo_tubo: str = "PVC",
) -> dict:
    """
    Dimensionamiento de tubería conduit.
    conductores: [{calibre, tipo_aislamiento, num_conductores}]
    """
    # Sumar áreas
    area_total = 0.0
    total_conductores = 0
    detalle = []

    for c in conductores:
        calibre = c.get("calibre", "12 AWG")
        tipo = c.get("tipo_aislamiento", "THW")
        cantidad = c.get("num_conductores", 1)
        key = f"{calibre} {tipo}"

        area_unitaria = AREA_CONDUCTOR_MM2.get(key, 5.26)
        area_grupo = area_unitaria * cantidad
        area_total += area_grupo
        total_conductores += cantidad
        detalle.append({
            "calibre": calibre,
            "tipo": tipo,
            "cantidad": cantidad,
            "area_unitaria_mm2": area_unitaria,
            "area_total_mm2": round(area_grupo, 2),
        })

    # Porcentaje de llenado según NTC 2050 Tabla 1 Cap. 9
    if total_conductores == 1:
        pct_max = 53
    elif total_conductores == 2:
        pct_max = 31
    else:
        pct_max = 40

    area_requerida = area_total / (pct_max / 100)

    # Seleccionar tubo
    tubos = TUBOS.get(tipo_tubo, TUBO_PVC_AREAS)
    diametro_seleccionado = None
    area_tubo = 0
    for diam, area in sorted(tubos.items(), key=lambda x: x[1]):
        if area >= area_requerida:
            diametro_seleccionado = diam
            area_tubo = area
            break

    if not diametro_seleccionado:
        diametro_seleccionado = "6\" (155mm)"
        area_tubo = 12110

    pct_ocupacion = (area_total / area_tubo) * 100 if area_tubo > 0 else 100
    cumple = pct_ocupacion <= pct_max

    justificacion = (
        f"Total de conductores: {total_conductores}. "
        f"Área total conductores: {area_total:.2f} mm². "
        f"Porcentaje máximo de llenado ({total_conductores} cond.): {pct_max}%. "
        f"Área mínima requerida: {area_requerida:.2f} mm². "
        f"Tubo seleccionado: {tipo_tubo} {diametro_seleccionado} "
        f"(área interna: {area_tubo} mm²). "
        f"Ocupación actual: {pct_ocupacion:.1f}%. "
        f"{'Cumple' if cumple else 'NO cumple'} NTC 2050 Cap. 9 Tabla 1."
    )

    return {
        "detalle_conductores": detalle,
        "area_total_mm2": round(area_total, 2),
        "pct_maximo_llenado": pct_max,
        "area_requerida_mm2": round(area_requerida, 2),
        "tipo_tubo": tipo_tubo,
        "diametro_seleccionado": diametro_seleccionado,
        "area_tubo_mm2": area_tubo,
        "pct_ocupacion": round(pct_ocupacion, 1),
        "cumple": cumple,
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Cap. 9, Tablas 1, 4 y 5",
    }