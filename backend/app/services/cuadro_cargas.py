"""
Servicio de Cuadro de Cargas — Balance de Cargas de Tablero Eléctrico
Según NTC 2050 Art. 220 y RETIE.

Calcula:
- Corriente por fase (A, B, C)
- Corriente de diseño (125% cargas continuas)
- Balance de fases (desbalance %)
- Corriente total
- Demanda con factor de diversidad (opcional)
- Conductor alimentador principal (Tabla 310-16)
- Breaker principal
"""

import math
from typing import Optional

# =============================================================================
# TABLA 310-16 NTC 2050 — Ampacidades Cobre (Columna 75°C típica bornes)
# =============================================================================

CALIBRES_ORDENADOS = [
    "14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG",
    "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG",
    "250 MCM", "300 MCM", "350 MCM", "400 MCM", "500 MCM",
]

AMPACIDAD_CU_75 = [
    20, 25, 35, 50, 65, 85, 100, 115, 130, 150, 175, 200, 230,
    255, 285, 310, 335, 380,
]

AMPACIDAD_CU_60 = [
    15, 20, 30, 40, 55, 70, 85, 95, 110, 125, 145, 165, 195,
    215, 240, 260, 280, 320,
]

AMPACIDAD_AL_75 = [
    0, 20, 30, 40, 50, 65, 75, 90, 100, 120, 135, 155, 180,
    205, 230, 250, 270, 310,
]

# Mapeo calibre -> sección mm²
SECCION_MM2 = {
    "14 AWG": 2.08, "12 AWG": 3.31, "10 AWG": 5.26, "8 AWG": 8.37,
    "6 AWG": 13.30, "4 AWG": 21.15, "3 AWG": 26.67, "2 AWG": 33.62,
    "1 AWG": 42.41, "1/0 AWG": 53.49, "2/0 AWG": 67.43, "3/0 AWG": 85.01,
    "4/0 AWG": 107.2, "250 MCM": 126.7, "300 MCM": 152.0, "350 MCM": 177.3,
    "400 MCM": 202.7, "500 MCM": 253.4,
}

# =============================================================================
# BREAKERS ESTÁNDAR NTC 2050 Art. 240-6
# =============================================================================

BREAKERS_STD = [
    15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 175,
    200, 225, 250, 300, 350, 400, 500, 600, 800, 1000, 1200,
]

# =============================================================================
# FACTORES DE DEMANDA NTC 2050 Art. 220 (Tabla 220.42, 220.44, 220.50, 220.54, 220.56)
# =============================================================================

FACTORES_DEMANDA = {
    "iluminacion": [(0, 100), (100, 0.35), (float('inf'), 0.35)],  # Simplificado
    "receptaculos": [(0, 100), (100, 0.50), (float('inf'), 0.50)],  # 100% primeros 10kVA, 50% resto
    "motores": 1.0,  # Sin diversidad (mayor motor 125%)
    "cocinas": [(0, 1), (1, 0.8), (2, 0.75), (3, 0.7), (4, 0.65), (5, 0.6), (float('inf'), 0.55)],
    "calefaccion": 1.0,
    "aire_acondicionado": 1.0,
    "continuas": 1.25,  # Art. 210-20(A) / 215-2
    "no_continuas": 1.0,
}

# =============================================================================
# TIPOS DE CARGA PARA FACTOR DE DEMANDA
# =============================================================================

TIPO_CARGA_DEMANDA = {
    "continua": "continua",
    "no_continua": "no_continua",
    "iluminacion": "iluminacion",
    "receptaculos": "receptaculos",
    "motor": "motores",
    "cocina": "cocinas",
    "calefaccion": "calefaccion",
    "aire_acondicionado": "aire_acondicionado",
}

# =============================================================================
# FUNCIONES AUXILIARES
# =============================================================================

def _aplicar_factor_demanda(cargas: list) -> dict:
    """
    Aplica factores de demanda según NTC 2050 Art. 220.
    Retorna demanda total y desglose por tipo.
    """
    demanda_por_tipo = {}
    for carga in cargas:
        tipo = carga.get("tipo_carga", "continua").lower()
        potencia = carga.get("potencia_w", 0) / 1000  # kW
        demanda_por_tipo[tipo] = demanda_por_tipo.get(tipo, 0) + potencia

    # Factores simplificados por tipo
    factores = {
        "continua": 1.25,
        "no_continua": 1.0,
        "iluminacion": 1.0,  # Sin diversidad en iluminación típica
        "receptaculos": 0.5,  # 50% diversidad
        "motor": 1.0,
        "cocinas": 0.7,
        "calefaccion": 1.0,
        "aire_acondicionado": 1.0,
    }

    demanda_total = 0
    desglose = {}
    for tipo, carga_kw in demanda_por_tipo.items():
        factor = factores.get(tipo, 1.0)
        demanda = carga_kw * factor
        demanda_total += demanda
        desglose[tipo] = {"carga_kw": round(carga_kw, 2), "factor": factor, "demanda_kw": round(demanda, 2)}

    return {"demanda_total_kw": round(demanda_total, 2), "desglose": desglose}


def _calcular_corriente_fase(potencia_w: float, fp: float, tension: float, sistema: str) -> float:
    """Calcula corriente por fase según sistema."""
    if sistema == "trifasico":
        return potencia_w / (math.sqrt(3) * tension * fp)
    else:
        return potencia_w / (tension * fp)


def _seleccionar_conductor_ampacidad(corriente_a: float, material: str = "cu", temp_terminales: int = 75) -> dict:
    """Selecciona conductor según ampacidad Tabla 310-16."""
    if material == "cu":
        ampacidades = AMPACIDAD_CU_75 if temp_terminales >= 75 else AMPACIDAD_CU_60
    else:
        ampacidades = AMPACIDAD_AL_75

    for i, amp in enumerate(ampacidades):
        if amp >= corriente_a:
            calibre = CALIBRES_ORDENADOS[i]
            return {
                "calibre": calibre,
                "ampacidad": amp,
                "seccion_mm2": SECCION_MM2[calibre],
                "columna": f"{temp_terminales}°C"
            }

    # Si no encuentra, retorna el mayor
    return {
        "calibre": CALIBRES_ORDENADOS[-1],
        "ampacidad": ampacidades[-1],
        "seccion_mm2": SECCION_MM2[CALIBRES_ORDENADOS[-1]],
        "columna": f"{temp_terminales}°C"
    }


def _seleccionar_breaker(corriente_a: float) -> int:
    """Selecciona breaker estándar ≥ corriente según Art. 240-6."""
    for b in BREAKERS_STD:
        if b >= corriente_a:
            return b
    return BREAKERS_STD[-1]


def _calcular_desbalance(fase_a: float, fase_b: float, fase_c: float) -> dict:
    """Calcula desbalance de fases según IEEE 141 / NTC 2050."""
    corrientes = [fase_a, fase_b, fase_c]
    # Solo considerar fases con carga
    corrientes_activas = [c for c in corrientes if c > 0]

    if len(corrientes_activas) == 0:
        return {"desbalance_pct": 0.0, "corriente_promedio": 0.0, "max_desviacion": 0.0, "cumple": True}

    promedio = sum(corrientes_activas) / len(corrientes_activas)
    if promedio == 0:
        return {"desbalance_pct": 0.0, "corriente_promedio": 0.0, "max_desviacion": 0.0, "cumple": True}

    max_desviacion = max(abs(c - promedio) for c in corrientes_activas)
    desbalance_pct = (max_desviacion / promedio) * 100

    # NTC 2050 / IEEE 141: desbalance ≤ 10% ideal, ≤ 20% aceptable
    cumple = desbalance_pct <= 20.0

    return {
        "desbalance_pct": round(desbalance_pct, 1),
        "corriente_promedio": round(promedio, 2),
        "max_desviacion": round(max_desviacion, 2),
        "cumple": cumple,
        "evaluacion": "Excelente ≤ 5%" if desbalance_pct <= 5 else ("Aceptable ≤ 10%" if desbalance_pct <= 10 else ("Marginal ≤ 20%" if desbalance_pct <= 20 else "Excesivo > 20%"))
    }


def calcular_cuadro_cargas(
    cargas: list,
    tension: float = 208,
    sistema: str = "trifasico",
    factor_diversidad: Optional[float] = None,
    temp_terminales: int = 75,
    material_alimentador: str = "cu",
) -> dict:
    """
    Calcula el cuadro de cargas completo para un tablero eléctrico.

    Args:
        cargas: Lista de dicts con:
            - nombre (str)
            - potencia_w (float)
            - factor_potencia (float, 0-1)
            - sistema (str: "mono" o "tri")
            - fase_a, fase_b, fase_c (bool: a qué fase va conectada)
            - tipo_carga (str: "continua", "no_continua", "iluminacion", "receptaculos", "motor", "cocina", "calefaccion", "aire_acondicionado")
        tension: Tensión línea-línea en voltios
        sistema: "monofasico" o "trifasico"
        factor_diversidad: Factor de diversidad global opcional (0-1)
        temp_terminales: Temperatura bornes (60 o 75°C) para conductor alimentador
        material_alimentador: "cu" o "al"

    Returns:
        Dict con desglose completo del cuadro de cargas
    """
    # Inicializar acumuladores por fase
    potencia_fase = {"A": 0.0, "B": 0.0, "C": 0.0}
    corriente_fase = {"A": 0.0, "B": 0.0, "C": 0.0}
    potencia_diseno_fase = {"A": 0.0, "B": 0.0, "C": 0.0}
    corriente_diseno_fase = {"A": 0.0, "B": 0.0, "C": 0.0}

    total_potencia_w = 0.0
    total_potencia_diseno_w = 0.0
    detalle_cargas = []

    for carga in cargas:
        nombre = carga.get("nombre", "Carga")
        potencia_w = carga.get("potencia_w", 0)
        fp = carga.get("factor_potencia", 0.9)
        sistema_carga = carga.get("sistema", "mono")
        tipo_carga = carga.get("tipo_carga", "continua").lower()

        # Determinar factor de diseño (125% continua, 100% no continua)
        if tipo_carga in ["continua", "continuo"]:
            factor_diseno = 1.25
        elif tipo_carga in ["no_continua", "no_continua", "no_continua"]:
            factor_diseno = 1.0
        else:
            # Para otros tipos, usar factor de demanda
            factor_diseno = 1.0  # Se aplica en demanda global

        potencia_diseno = potencia_w * factor_diseno

        # Distribuir en fases
        if sistema_carga == "trifasico" or sistema == "trifasico":
            # Carga trifásica balanceada
            corriente = _calcular_corriente_fase(potencia_w, fp, tension, "trifasico")
            corriente_diseno = _calcular_corriente_fase(potencia_diseno, fp, tension, "trifasico")

            for fase in ["A", "B", "C"]:
                if carga.get(f"fase_{fase.lower()}", True):
                    potencia_fase[fase] += potencia_w / 3
                    potencia_diseno_fase[fase] += potencia_diseno / 3
                    corriente_fase[fase] += corriente
                    corriente_diseno_fase[fase] += corriente_diseno
        else:
            # Carga monofásica - asignar a fase específica
            fase_asignada = None
            for fase in ["A", "B", "C"]:
                if carga.get(f"fase_{fase.lower()}", False):
                    fase_asignada = fase
                    break

            if fase_asignada is None:
                # Auto-asignar a la fase menos cargada
                fase_asignada = min(corriente_fase, key=corriente_fase.get)

            corriente = _calcular_corriente_fase(potencia_w, fp, tension, "monofasico")
            corriente_diseno = _calcular_corriente_fase(potencia_diseno, fp, tension, "monofasico")

            potencia_fase[fase_asignada] += potencia_w
            potencia_diseno_fase[fase_asignada] += potencia_diseno
            corriente_fase[fase_asignada] += corriente
            corriente_diseno_fase[fase_asignada] += corriente_diseno

        total_potencia_w += potencia_w
        total_potencia_diseno_w += potencia_diseno

        detalle_cargas.append({
            "nombre": nombre,
            "potencia_w": potencia_w,
            "potencia_diseno_w": round(potencia_diseno, 1),
            "factor_potencia": fp,
            "tipo_carga": tipo_carga,
            "factor_diseno": factor_diseno,
            "fase_asignada": fase_asignada if sistema_carga != "trifasico" else "A-B-C",
            "corriente_a": round(corriente, 2),
            "corriente_diseno_a": round(corriente_diseno, 2),
        })

    # Calcular desbalance
    desbalance = _calcular_desbalance(
        corriente_diseno_fase["A"],
        corriente_diseno_fase["B"],
        corriente_diseno_fase["C"]
    )

    # Corriente total (máxima de las fases para dimensionamiento)
    corriente_max_fase = max(corriente_diseno_fase.values())

    # Aplicar factor de diversidad global si se proporciona
    if factor_diversidad is not None:
        corriente_max_fase *= factor_diversidad
        for fase in potencia_diseno_fase:
            potencia_diseno_fase[fase] *= factor_diversidad
            corriente_diseno_fase[fase] *= factor_diversidad

    # Seleccionar conductor alimentador principal
    conductor_alimentador = _seleccionar_conductor_ampacidad(
        corriente_max_fase,
        material_alimentador,
        temp_terminales
    )

    # Seleccionar breaker principal
    breaker_principal = _seleccionar_breaker(corriente_max_fase)

    # Potencia total de diseño
    potencia_total_diseno = sum(potencia_diseno_fase.values())

    # Justificación
    justificacion = (
        f"Cuadro de cargas calculado según NTC 2050 Art. 220 y RETIE. "
        f"Total de cargas: {len(cargas)} circuitos. "
        f"Potencia conectada: {total_potencia_w/1000:.2f} kW. "
        f"Potencia de diseño (con factores 125%/100%): {potencia_total_diseno/1000:.2f} kW. "
        f"Sistema: {sistema} {tension}V. "
        f"Corrientes de diseño por fase: A={corriente_diseno_fase['A']:.2f}A, "
        f"B={corriente_diseno_fase['B']:.2f}A, C={corriente_diseno_fase['C']:.2f}A. "
        f"Desbalance de fases: {desbalance['desbalance_pct']}% ({desbalance['evaluacion']}). "
        f"Corriente máxima de diseño: {corriente_max_fase:.2f} A. "
        f"Conductor alimentador: {conductor_alimentador['calibre']} "
        f"({conductor_alimentador['seccion_mm2']} mm², {conductor_alimentador['ampacidad']}A @ {conductor_alimentador['columna']}). "
        f"Breaker principal: {breaker_principal}A (NTC 2050 Art. 240-6). "
        f"{'✓ Desbalance dentro de límites (≤20%)' if desbalance['cumple'] else '⚠️ Desbalance excesivo (>20%), redistribuir cargas'}. "
        f"Tabla 310-16 Columna {temp_terminales}°C por limitación de bornes (Art. 110-14(c))."
    )

    return {
        "detalle_cargas": detalle_cargas,
        "potencia_conectada_kw": round(total_potencia_w / 1000, 2),
        "potencia_diseno_kw": round(potencia_total_diseno / 1000, 2),
        "por_fase": {
            "A": {
                "potencia_w": round(potencia_fase["A"], 1),
                "potencia_diseno_w": round(potencia_diseno_fase["A"], 1),
                "corriente_a": round(corriente_fase["A"], 2),
                "corriente_diseno_a": round(corriente_diseno_fase["A"], 2),
            },
            "B": {
                "potencia_w": round(potencia_fase["B"], 1),
                "potencia_diseno_w": round(potencia_diseno_fase["B"], 1),
                "corriente_a": round(corriente_fase["B"], 2),
                "corriente_diseno_a": round(corriente_diseno_fase["B"], 2),
            },
            "C": {
                "potencia_w": round(potencia_fase["C"], 1),
                "potencia_diseno_w": round(potencia_diseno_fase["C"], 1),
                "corriente_a": round(corriente_fase["C"], 2),
                "corriente_diseno_a": round(corriente_diseno_fase["C"], 2),
            },
        },
        "corriente_max_fase_a": round(corriente_max_fase, 2),
        "desbalance": desbalance,
        "conductor_alimentador": conductor_alimentador,
        "breaker_principal": breaker_principal,
        "factor_diversidad_aplicado": factor_diversidad if factor_diversidad else 1.0,
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Art. 220, 210-20(A), 215-2, 240-6, 110-14(c), Tabla 310-16 / RETIE Art. 20.4",
    }


# =============================================================================
# FUNCIÓN DE CONVENIENCIA PARA FRONTEND
# =============================================================================

def calcular_cuadro_cargas_simple(
    cargas: list,
    tension: float = 208,
    sistema: str = "trifasico",
) -> dict:
    """
    Versión simplificada para uso directo en API.
    """
    return calcular_cuadro_cargas(cargas, tension, sistema)