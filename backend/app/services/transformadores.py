"""
Selección de transformadores según carga.
NTC 2050 — Art. 450, RETIE Cap. 13.
"""

import math

# Capacidades estándar de transformadores (kVA)
KVA_ESTANDAR = [15, 25, 37.5, 50, 75, 100, 167, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000]


def calcular_transformador(
    potencia_total_kw: float,
    factor_potencia: float = 0.9,
    tension_primaria: float = 13200,
    tension_secundaria: float = 208,
    tipo: str = "seco",
    sistema: str = "trifasico",
) -> dict:
    """
    Selecciona transformador basado en la carga.
    """
    # Potencia aparente requerida
    s_requerida = potencia_total_kw / factor_potencia

    # Factor de carga futuro (125% para cargas continuas/previsión)
    s_diseno = s_requerida * 1.25

    # Seleccionar kVA estándar
    kva_seleccionado = KVA_ESTANDAR[-1]
    for kva in KVA_ESTANDAR:
        if kva >= s_diseno:
            kva_seleccionado = kva
            break

    # Factor de carga del transformador
    factor_carga = (s_requerida / kva_seleccionado) * 100

    # Corrientes
    if sistema == "trifasico":
        corriente_primaria = (kva_seleccionado * 1000) / (math.sqrt(3) * tension_primaria)
        corriente_secundaria = (kva_seleccionado * 1000) / (math.sqrt(3) * tension_secundaria)
    else:
        corriente_primaria = (kva_seleccionado * 1000) / tension_primaria
        corriente_secundaria = (kva_seleccionado * 1000) / tension_secundaria

    # Pérdidas estimadas (aproximación: núcleo 0.5% + cobre 1.5% a plena carga)
    perdidas_nucleo = kva_seleccionado * 0.005
    perdidas_cobre = kva_seleccionado * (factor_carga / 100) ** 2 * 0.015
    perdidas_totales = perdidas_nucleo + perdidas_cobre
    eficiencia = (potencia_total_kw / (potencia_total_kw + perdidas_totales)) * 100 if potencia_total_kw > 0 else 0

    # Regulación (±5% típica)
    regulacion = 2.5  # % estimado estándar

    # Capacidad
    if factor_carga <= 80:
        capacidad_estado = "Óptima"
        capacidad_color = "verde"
    elif factor_carga <= 100:
        capacidad_estado = "Adecuada"
        capacidad_color = "amarillo"
    else:
        capacidad_estado = "Sobrecargado"
        capacidad_color = "rojo"

    justificacion = (
        f"Potencia activa total: {potencia_total_kw} kW. "
        f"Factor de potencia: {factor_potencia}. "
        f"Potencia aparente requerida: {s_requerida:.1f} kVA. "
        f"Factor de diseño (125%): {s_diseno:.1f} kVA. "
        f"Transformador seleccionado: {kva_seleccionado} kVA ({tipo}). "
        f"Factor de carga: {factor_carga:.1f}%. "
        f"Corriente primaria: {corriente_primaria:.2f} A. "
        f"Corriente secundaria: {corriente_secundaria:.2f} A. "
        f"Pérdidas estimadas: {perdidas_totales:.2f} kW. "
        f"Eficiencia estimada: {eficiencia:.2f}%. "
        f"NTC 2050 Art. 450 y RETIE Cap. 13."
    )

    return {
        "kva_seleccionado": kva_seleccionado,
        "s_requerida": round(s_requerida, 1),
        "s_diseno": round(s_diseno, 1),
        "factor_carga_pct": round(factor_carga, 1),
        "corriente_primaria": round(corriente_primaria, 2),
        "corriente_secundaria": round(corriente_secundaria, 2),
        "perdidas_nucleo_kw": round(perdidas_nucleo, 3),
        "perdidas_cobre_kw": round(perdidas_cobre, 3),
        "perdidas_totales_kw": round(perdidas_totales, 3),
        "eficiencia_estimada_pct": round(eficiencia, 2),
        "regulacion_pct": regulacion,
        "capacidad_estado": capacidad_estado,
        "capacidad_color": capacidad_color,
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Art. 450, RETIE Cap. 13",
    }