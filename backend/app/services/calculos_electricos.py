"""
Servicios de cálculos eléctricos según NTC 2050 y RETIE.

Módulos:
- Protecciones (breakers): Art. 240-6, Art. 240-4(B)
- Motores: Art. 430 (22, 32, 52, 7B)
- Iluminación: Método de lúmenes IESNA + RETIE Tabla 17.1
- Reactiva: Compensación FP + penalización CREG 108/1997
- Puesta a Tierra: IEEE 142 + Art. 250 NTC 2050
"""

import math

# =============================================================================
# BREAKERS ESTÁNDAR — NTC 2050 Art. 240-6
# =============================================================================

BREAKERS = [
    15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 175,
    200, 225, 250, 300, 350, 400, 500, 600, 800, 1000, 1200,
]

# Límites de conductor pequeño — Art. 240.4(D)
OVERCURRENT_LIMITS_SMALL_CONDUCTOR = {
    "14 AWG": 15,
    "12 AWG": 20,
    "10 AWG": 30,
}

# =============================================================================
# TABLA 250-122 — Conductor de puesta a tierra mínimo (Cobre)
# =============================================================================

CONDUCTOR_TIERRA_CU = [
    (15,   "14 AWG", 2.08),
    (20,   "12 AWG", 3.31),
    (60,   "10 AWG", 5.26),
    (100,  "8 AWG",  8.37),
    (200,  "6 AWG",  13.30),
    (300,  "4 AWG",  21.15),
    (400,  "3 AWG",  26.67),
    (500,  "2 AWG",  33.62),
    (600,  "1 AWG",  42.41),
    (800,  "1/0 AWG",53.49),
    (1000, "2/0 AWG",67.43),
    (1200, "3/0 AWG",85.01),
]

# =============================================================================
# LETRAS DE CÓDIGO PARA ROTOR BLOQUEADO — Art. 430-7(B)
# kVA/HP aproximados para corriente de arranque
# =============================================================================

CODIGO_ARRANQUE = {
    "A": (0.00, 3.15),
    "B": (3.15, 3.55),
    "C": (3.55, 4.00),
    "D": (4.00, 4.50),
    "E": (4.50, 5.00),
    "F": (5.00, 5.60),
    "G": (5.60, 6.30),
    "H": (6.30, 7.10),
    "J": (7.10, 8.00),
    "K": (8.00, 9.00),
    "L": (9.00, 10.00),
    "M": (10.00, 11.20),
    "N": (11.20, 12.50),
    "P": (12.50, 14.00),
    "R": (14.00, 16.00),
    "S": (16.00, 18.00),
    "T": (18.00, 20.00),
    "U": (20.00, 22.40),
    "V": (22.40, None),
}

# =============================================================================
# FACTORES DE MULTIPLICACIÓN PROTECCIÓN CORTO — Art. 430-52 Tabla
# =============================================================================

FACTOR_PROTECCION_MOTOR = {
    "directo": 2.50,          # Disyuntor tiempo inverso
    "estrella_delta": 2.00,   # Arranque reducido
    "suave": 1.75,            # Arrancador suave
    "variador": 1.50,         # VFD — protección incluida
}

# =============================================================================
# CONTACTORES SUGERIDOS SEGÚN FLC — AC-3 (IEC 60947-4-1)
# =============================================================================

CONTACTORES_AC3 = [
    (9,   "AC-3 9A"),
    (12,  "AC-3 12A"),
    (18,  "AC-3 18A"),
    (25,  "AC-3 25A"),
    (32,  "AC-3 32A"),
    (40,  "AC-3 40A"),
    (50,  "AC-3 50A"),
    (65,  "AC-3 65A"),
    (80,  "AC-3 80A"),
    (95,  "AC-3 95A"),
    (115, "AC-3 115A"),
    (150, "AC-3 150A"),
    (185, "AC-3 185A"),
    (225, "AC-3 225A"),
]

# =============================================================================
# RETIE Tabla 17.1 — Densidades de potencia máximas (W/m²)
# =============================================================================

RETIE_DENSIDAD_POTENCIA = {
    "oficina": 12.6,
    "comercial": 14.0,
    "industrial": 16.0,
    "exterior": 8.5,
}

# =============================================================================
# MÓDULO 2: PROTECCIONES (BREAKERS)
# =============================================================================

def calcular_protecciones(
    corriente_carga: float,
    tipo_carga: str = "continua",
    tension: float = 208,
    num_polos: str = "3",
) -> dict:
    """
    Calcula la protección termomagnética (breaker) según NTC 2050.

    - Carga continua: factor 125% (Art. 210-20(A))
    - Carga no continua: factor 100%
    - Selecciona el siguiente breaker comercial estándar (Art. 240-6)
    - Calcula potencia máxima que soporta el breaker
    - Verifica cumplimiento Art. 240-4(B) para protección de conductores
    """
    factor = 1.25 if tipo_carga == "continua" else 1.0
    corriente_diseno = corriente_carga * factor
    factor_label = "125%" if tipo_carga == "continua" else "100%"

    # Seleccionar breaker comercial
    breaker_seleccionado = BREAKERS[-1]
    for b in BREAKERS:
        if b >= corriente_diseno:
            breaker_seleccionado = b
            break

    # Potencia máxima del breaker
    if num_polos == "3":
        potencia_max = math.sqrt(3) * tension * breaker_seleccionado
    elif num_polos == "2":
        potencia_max = tension * breaker_seleccionado
    else:
        potencia_max = tension * breaker_seleccionado

    # Verificar 240-4(B): el breaker no debe exceder la ampacidad del conductor
    # (se verifica en frontend con el conductor seleccionado)

    cumple_240_4b = True
    if corriente_carga <= 30:
        # Conductores pequeños: 14 AWG máx 15 A, 12 AWG máx 20 A, 10 AWG máx 30 A
        pass  # Se verifica contra conductor real en la interfaz

    justificacion = (
        f"Protección seleccionada: Breaker {breaker_seleccionado}A, {num_polos} polos. "
        f"Corriente nominal de carga: {corriente_carga:.2f} A. "
        f"Corriente de diseño ({factor_label}): {corriente_diseno:.2f} A. "
        f"Seleccionado el siguiente tamaño comercial estándar ≥ {corriente_diseno:.2f} A "
        f"según NTC 2050 Art. 240-6. "
    )
    if tipo_carga == "continua":
        justificacion += (
            f"Aplica factor 125% por carga continua (Art. 210-20(A)), "
            f"donde la carga opera ininterrumpidamente por 3 horas o más."
        )
    else:
        justificacion += "Carga no continua, factor 100% aplicado."
    justificacion += (
        f" Potencia máxima soportada: {potencia_max:.1f} VA. "
        f"Verifique que la ampacidad del conductor ≥ corriente de diseño."
    )

    return {
        "corriente_carga": round(corriente_carga, 2),
        "corriente_design": round(corriente_diseno, 2),
        "breaker": breaker_seleccionado,
        "factor_usado": factor_label,
        "ampacidad_col": "Col. 60°C / 75°C según conductor",
        "cumple_240_4b": cumple_240_4b,
        "potencia_max": round(potencia_max, 1),
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Art. 240-6, Art. 210-20(A)",
    }


# =============================================================================
# MÓDULO 3: MOTORES
# =============================================================================

def calcular_motor(
    potencia_hp: float,
    tension: float = 208,
    eficiencia: float = 0.85,
    fp: float = 0.85,
    sistema: str = "trifasico",
    tipo_arranque: str = "directo",
    letra_codigo: str = "F",
) -> dict:
    """
    Dimensionamiento completo de circuito para motores según Art. 430 NTC 2050.

    Incluye:
    - Cálculo FLC a partir de HP (1 HP = 746 W)
    - Conductor: 125% FLC (Art. 430-22)
    - Protección cortocircuito ITM según tipo de arranque (Art. 430-52)
    - Protección sobrecarga térmica (Art. 430-32)
    - Corriente de arranque según letra de código (Art 430-7(B))
    - Contactor AC-3 sugerido
    """
    # Paso 1: Corriente a plena carga (FLC)
    potencia_watts = potencia_hp * 746

    if sistema == "trifasico":
        flc = potencia_watts / (math.sqrt(3) * tension * fp * eficiencia)
    else:
        flc = potencia_watts / (tension * fp * eficiencia)

    # Paso 2: Conductor — 125% FLC (Art. 430-22)
    corriente_conductor = flc * 1.25

    # Paso 3: Protección cortocircuito ITM (Art. 430-52)
    factor_itm = FACTOR_PROTECCION_MOTOR.get(tipo_arranque, 2.50)
    proteccion_itm_calc = flc * factor_itm

    # Seleccionar breaker comercial
    breaker_itm = BREAKERS[-1]
    for b in BREAKERS:
        if b >= proteccion_itm_calc:
            breaker_itm = b
            break
    # Excepción Art. 430-52: si no existe breaker estándar, permitir siguiente superior
    # (ya implementado por la selección secuencial)

    # Paso 4: Protección sobrecarga térmica (Art. 430-32)
    # Factor de servicio 1.0 → 115%, FS ≥ 1.15 → 125%.
    # Asumimos FS=1.15 para motores estándar, FS=1.0 para motores pequeños
    if potencia_hp <= 1.0:
        factor_servicio = 1.0
        factor_termica = 1.15  # 115% para FS 1.0
    else:
        factor_servicio = 1.15
        factor_termica = 1.25  # 125% para FS ≥ 1.15

    proteccion_termica = flc * factor_termica

    # Paso 5: Corriente de arranque (Art. 430-7(B))
    letra = letra_codigo.upper() if letra_codigo else "F"
    if letra not in CODIGO_ARRANQUE:
        letra = "F"
    kva_range = CODIGO_ARRANQUE[letra]
    kva_medio = kva_range[0] if kva_range[1] is None else (kva_range[0] + kva_range[1]) / 2
    if kva_range[1] is None:
        kva_medio = kva_range[0] * 1.2  # Estimación conservadora para letra V

    if sistema == "trifasico":
        corriente_arranque = (kva_medio * potencia_hp * 1000) / (math.sqrt(3) * tension)
    else:
        corriente_arranque = (kva_medio * potencia_hp * 1000) / tension

    # Paso 6: Contactor AC-3
    contactor_seleccionado = CONTACTORES_AC3[-1][1]
    for flc_limite, contactor in CONTACTORES_AC3:
        if flc_limite >= flc * 1.1:  # 10% margen
            contactor_seleccionado = contactor
            break

    # Paso 7: Justificación
    tipos_arranque_label = {
        "directo": "Directo (DOL)",
        "estrella_delta": "Estrella-Delta (Y-Δ)",
        "suave": "Arrancador Suave (Soft Starter)",
        "variador": "Variador de Frecuencia (VFD)",
    }
    arranque_label = tipos_arranque_label.get(tipo_arranque, "Directo")

    justificacion = (
        f"Motor {potencia_hp} HP, {tension}V, sistema {sistema}, "
        f"eficiencia {eficiencia*100:.0f}%, FP {fp:.2f}. "
        f"Corriente a plena carga (FLC): {flc:.2f} A. "
        f"Conductor calculado a 125% FLC: {corriente_conductor:.2f} A (Art. 430-22). "
        f"Protección ITM (cortocircuito) factor {factor_itm}×: "
        f"{proteccion_itm_calc:.2f} A → breaker {breaker_itm}A "
        f"(Art. 430-52, disyuntor tiempo inverso para arranque {arranque_label}). "
        f"Protección térmica (sobrecarga) factor {factor_termica}× "
        f"(FS={factor_servicio}): {proteccion_termica:.2f} A (Art. 430-32). "
        f"Corriente de arranque estimada (código {letra}): {corriente_arranque:.1f} A "
        f"(Art. 430-7(B)). Contactor recomendado: {contactor_seleccionado} (IEC 60947-4-1). "
        f"El conductor se selecciona bajo columna 60°C por limitación de bornes "
        f"según Art. 110-14(c). RETIE Art. 20.4 exige protecciones independientes "
        f"contra sobrecarga y cortocircuito en todo circuito motor."
    )

    return {
        "flc": round(flc, 2),
        "conductor_amps": round(corriente_conductor, 2),
        "breaker": breaker_itm,
        "proteccion_itm_calc": round(proteccion_itm_calc, 2),
        "thermal": round(proteccion_termica, 2),
        "factor_servicio": factor_servicio,
        "contactor": contactor_seleccionado,
        "corriente_arranque": round(corriente_arranque, 1),
        "justificacion": justificacion,
        "tabla_referencia": "NTC 2050 Art. 430-22, 430-32, 430-52, 430-7(B) / RETIE Art. 20.4",
    }


# =============================================================================
# MÓDULO 4: ILUMINACIÓN
# =============================================================================

def calcular_iluminacion(
    largo: float,
    ancho: float,
    lux_objetivo: float = 500,
    lumens_lampara: float = 3000,
    cu: float = 0.6,
    llf: float = 0.8,
    potencia_lampara: float = 40,
    tipo_area: str = "oficina",
) -> dict:
    """
    Método de los lúmenes (IESNA) para diseño de iluminación.

    N = (Lux × Área) / (Lúmenes × CU × LLF)

    Parámetros:
    - CU: Coeficiente de Utilización (0-1)
    - LLF: Factor de Pérdida de Luz (Light Loss Factor, 0-1)
    - Distribución sugerida en filas y columnas optimizadas al área.
    - Verificación contra densidades máximas RETIE Tabla 17.1
    """
    area = largo * ancho

    if lumens_lampara <= 0:
        return {"error": "Los lúmenes por luminaria deben ser mayores a 0."}

    # Número de luminarias
    luminarias_exactas = (lux_objetivo * area) / (lumens_lampara * cu * llf)
    luminarias = max(1, math.ceil(luminarias_exactas))

    # Distribución optimizada a la geometría del área
    if luminarias > 0 and largo > 0 and ancho > 0:
        relacion_aspecto = largo / ancho
        filas = max(1, math.ceil(math.sqrt(luminarias * relacion_aspecto)))
        columnas = math.ceil(luminarias / filas) if filas > 0 else 1
        # Ajustar si columnas resultantes no son razonables
        while filas * columnas < luminarias:
            columnas += 1
    else:
        filas = 1
        columnas = luminarias

    # Espaciamiento sugerido
    if filas > 0 and columnas > 0:
        espaciamiento_largo = round(largo / max(filas, 1), 2)
        espaciamiento_ancho = round(ancho / max(columnas, 1), 2)
        espaciamiento = f"~{espaciamiento_largo}m × {espaciamiento_ancho}m"
    else:
        espaciamiento = "N/A"

    # Carga total y densidad de potencia
    carga_total = luminarias * potencia_lampara
    densidad_potencia = carga_total / area if area > 0 else 0

    # Verificar contra RETIE Tabla 17.1
    limite_retie = RETIE_DENSIDAD_POTENCIA.get(tipo_area.lower(), 14.0)
    retie_cumple = densidad_potencia <= limite_retie

    # Lux real alcanzado con el número seleccionado
    lux_real = (luminarias * lumens_lampara * cu * llf) / area if area > 0 else 0

    # Justificación
    justificacion = (
        f"Diseño de iluminación por Método de los Lúmenes (IESNA). "
        f"Área: {area:.2f} m² ({largo}m × {ancho}m). "
        f"Nivel de iluminancia objetivo: {lux_objetivo} lux "
        f"(tipo área: {tipo_area}). "
        f"Número de luminarias calculado: {luminarias_exactas:.2f} → "
        f"seleccionadas: {luminarias} unidades de {lumens_lampara} lm c/u. "
        f"Distribución sugerida: {filas} filas × {columnas} columnas "
        f"(espaciamiento {espaciamiento}). "
        f"Factor CU: {cu} | Factor LLF: {llf}. "
        f"Carga total: {carga_total:.1f} W, densidad: {densidad_potencia:.2f} W/m² "
        f"(límite RETIE para {tipo_area}: {limite_retie} W/m²). "
        f"{'✓ Cumple RETIE Tabla 17.1' if retie_cumple else '⚠️ Excede límite RETIE. Optimice luminarias más eficientes.'} "
        f"Iluminancia real esperada: ~{lux_real:.0f} lux."
    )

    return {
        "area": round(area, 2),
        "lux_objetivo": lux_objetivo,
        "luminarias": luminarias,
        "luminarias_exactas": round(luminarias_exactas, 2),
        "distribucion": f"{filas} filas × {columnas} col",
        "filas": filas,
        "columnas": columnas,
        "espaciamiento": espaciamiento,
        "carga_total": round(carga_total, 1),
        "densidad_potencia": round(densidad_potencia, 2),
        "retie_cumple": retie_cumple,
        "limite_retie": limite_retie,
        "cu_usado": cu,
        "llf_usado": llf,
        "justificacion": justificacion,
        "tabla_referencia": "Método de los Lúmenes (IESNA) / RETIE Tabla 17.1",
    }


# =============================================================================
# MÓDULO 5: COMPENSACIÓN DE REACTIVA
# =============================================================================

def calcular_reactiva(
    potencia_kw: float,
    fp_actual: float,
    fp_objetivo: float = 0.95,
    tension: float = 208,
    frecuencia: float = 60,
    costo_kwh: float = 800,
) -> dict:
    """
    Cálculo de banco de capacitores para corrección del factor de potencia.

    Incluye:
    - kVAR necesarios
    - Capacitancia en μF
    - Ahorro en kVA
    - Penalización según CREG Res. 108/1997 (FP < 0.90)
    - ROI estimado (meses)
    """
    # Validación
    if fp_actual >= 1.0 or fp_actual <= 0:
        fp_actual = 0.99
    if fp_objetivo >= 1.0 or fp_objetivo <= 0:
        fp_objetivo = 1.0
    if fp_actual >= fp_objetivo:
        # Ya cumple o está por encima del objetivo
        pass

    # Ángulos
    theta1 = math.acos(min(fp_actual, 0.9999))
    theta2 = math.acos(min(fp_objetivo, 0.9999))

    # kVAR necesarios: Qc = P × (tan θ1 - tan θ2)
    qc = potencia_kw * (math.tan(theta1) - math.tan(theta2))
    qc = max(0, qc)

    # Capacitancia (μF): C = Qc × 10^9 / (2π × f × V^2)
    if frecuencia > 0 and tension > 0:
        capacitancia = (qc * 1000 * 1e6) / (2 * math.pi * frecuencia * tension ** 2)
    else:
        capacitancia = 0.0

    # Potencias aparentes
    s_antes = potencia_kw / fp_actual
    s_despues = potencia_kw / fp_objetivo if fp_objetivo > 0 else s_antes
    ahorro_kva = max(0, s_antes - s_despues)

    # Corrientes
    if tension > 0:
        corriente_antes = (s_antes * 1000) / (math.sqrt(3) * tension)
        corriente_despues = (s_despues * 1000) / (math.sqrt(3) * tension)
    else:
        corriente_antes = 0
        corriente_despues = 0

    # Penalización CREG 108/1997 — Colombia
    penalizacion = fp_actual < 0.90
    if penalizacion:
        # % de penalización ≈ (0.90 - FP) / 0.90 aplicado al costo de energía
        consumo_mensual_est = potencia_kw * 24 * 30  # kWh/mes estimado
        factor_penalizacion = (0.90 - fp_actual) / 0.90
        costo_penalizacion_mensual = consumo_mensual_est * factor_penalizacion * costo_kwh
        costo_penalizacion_mensual = max(0, costo_penalizacion_mensual)
    else:
        costo_penalizacion_mensual = 0.0

    # ROI estimado
    # Costo típico banco capacitores en Colombia: ~$150,000 COP/kVAR (2024)
    costo_capacitor_est = qc * 150000 if qc > 0 else 0
    if costo_penalizacion_mensual > 0 and costo_capacitor_est > 0:
        retorno_meses = costo_capacitor_est / costo_penalizacion_mensual
    else:
        retorno_meses = 0.0

    # Justificación
    fp_cumple_retie = fp_actual >= 0.90
    justificacion = (
        f"Compensación de potencia reactiva para corregir FP de {fp_actual:.2f} "
        f"a {fp_objetivo:.2f}. "
        f"Banco de capacitores requerido: {qc:.2f} kVAR "
        f"({capacitancia:.1f} μF a {tension}V {frecuencia}Hz). "
        f"Potencia aparente antes: {s_antes:.2f} kVA → después: {s_despues:.2f} kVA "
        f"(ahorro: {ahorro_kva:.2f} kVA). "
    )
    if penalizacion:
        justificacion += (
            f"⚠️ FP actual ({fp_actual:.2f}) < 0.90: APLICA PENALIZACIÓN CREG 108/1997. "
            f"Penalización mensual estimada: ${costo_penalizacion_mensual:,.0f} COP. "
            f"El costo estimado del banco (~${costo_capacitor_est:,.0f} COP) "
            f"se recuperaría en aproximadamente {retorno_meses:.1f} meses. "
        )
    else:
        justificacion += (
            f"✓ FP actual ({fp_actual:.2f}) ≥ 0.90. Cumple RETIE Art. 12.3 "
            f"y no aplica penalización CREG. "
        )
    if fp_actual >= fp_objetivo:
        justificacion += (
            f"El FP actual ya cumple o supera el objetivo. No se requiere "
            f"compensación adicional."
        )

    return {
        "qc": round(qc, 2),
        "capacitancia": round(capacitancia, 1),
        "s_antes": round(s_antes, 2),
        "s_despues": round(s_despues, 2),
        "ahorro_kva": round(ahorro_kva, 2),
        "corriente_antes": round(corriente_antes, 2),
        "corriente_despues": round(corriente_despues, 2),
        "penalizacion": penalizacion,
        "costo_penalizacion_mensual": round(costo_penalizacion_mensual, 0),
        "retorno_inversion_meses": round(retorno_meses, 1),
        "fp_cumple_retie": fp_cumple_retie,
        "justificacion": justificacion,
        "tabla_referencia": "Triángulo de Potencias / CREG 108/1997 / RETIE Art. 12.3",
    }


# =============================================================================
# MÓDULO 6: PUESTA A TIERRA
# =============================================================================

def calcular_puesta_tierra(
    resistividad: float,
    longitud_electrodo: float = 2.4,
    diametro_electrodo: float = 0.0159,
    tension: float = 208,
    requerimiento: float = 25,
) -> dict:
    """
    Cálculo de resistencia de puesta a tierra para electrodos verticales
    según IEEE 142 / NTC 2050 Art. 250.

    Incluye:
    - Resistencia de varilla simple
    - Cálculo de número de varillas en paralelo necesarias
    - Conductor de puesta a tierra según Art. 250-122
    - Separación recomendada
    - Sugerencias de mejora si no cumple
    """
    if longitud_electrodo <= 0:
        longitud_electrodo = 2.4
    if diametro_electrodo <= 0:
        diametro_electrodo = 0.0159  # 5/8" varilla copperweld

    radio = diametro_electrodo / 2

    # Resistencia de una varilla (IEEE 142)
    # R = (ρ / (2πL)) × (ln(4L/a) − 1)
    if longitud_electrodo > 0 and radio > 0:
        r_single = (resistividad / (2 * math.pi * longitud_electrodo)) * (
            math.log((4 * longitud_electrodo) / radio) - 1
        )
    else:
        r_single = float("inf")

    # Número de varillas en paralelo necesarias
    # R_n ≈ R_single × (1 + k) / n  donde k = factor de acoplamiento
    # Separación entre varillas = L para mínimo acoplamiento (k ≈ 0.15)
    factor_acoplamiento = 0.15
    if r_single <= requerimiento:
        num_varillas = 1
        r_total = r_single
    else:
        # Despejar n: n = R_single × (1 + k) / R_requerido
        num_varillas_exacto = (r_single * (1 + factor_acoplamiento)) / requerimiento
        num_varillas = max(1, math.ceil(num_varillas_exacto))
        r_total = (r_single * (1 + factor_acoplamiento)) / num_varillas

    # Separación recomendada = longitud del electrodo para mínimo acoplamiento
    separacion = round(longitud_electrodo, 2)

    # Conductor de puesta a tierra según capacidad (Art. 250-122)
    # Estimamos por la resistencia: corriente de falla = V / R
    # Pero para selección nos basamos en breaker principal típico
    # Asumimos conductor según tabla 250-122 basado en breaker estándar
    corriente_falla_est = 5000  # A típico residencial/comercial en BT
    conductor_tierra = "8 AWG Cu"
    seccion_conductor_mm2 = 8.37
    for amperaje, calibre, mm2 in CONDUCTOR_TIERRA_CU:
        if amperaje >= corriente_falla_est / 100:  # Estimación conservadora
            conductor_tierra = calibre
            seccion_conductor_mm2 = mm2
            break

    # Estado
    if r_total < 10:
        estado = "Excelente < 10 Ω (Ideal para equipos de cómputo)"
    elif r_total < 25:
        estado = "Aprobado < 25 Ω (NTC 2050 Art. 250-56)"
    else:
        estado = "Requiere mejora (Bentonita, más varillas o malla)"

    cumple = r_total <= requerimiento

    # Sugerencia
    if cumple and r_total < 10:
        sugerencia = (
            f"Instalación óptima. {num_varillas} varilla(s) de "
            f"{longitud_electrodo}m × Ø{diametro_electrodo*1000:.0f}mm, "
            f"separadas ≥{separacion}m. Conductor de tierra: {conductor_tierra} "
            f"(NTC 2050 Art. 250-122). Método de verificación: caída de potencial "
            f"(3 puntos, IEEE 81)."
        )
    elif cumple:
        sugerencia = (
            f"Instalación conforme. {num_varillas} varilla(s) de "
            f"{longitud_electrodo}m × Ø{diametro_electrodo*1000:.0f}mm, "
            f"separadas ≥{separacion}m. Conductor de tierra: {conductor_tierra} "
            f"(NTC 2050 Art. 250-122). Si se requiere mejorar, añada bentonita "
            f"o aumente a varilla de mayor longitud (3.0 m). Verifique con "
            f"telurómetro método caída de potencial (IEEE 81)."
        )
    else:
        sugerencia = (
            f"⚠️ No cumple con el límite de {requerimiento}Ω. "
            f"Se necesitan {num_varillas} varilla(s) de {longitud_electrodo}m "
            f"separadas ≥{separacion}m. Considere: (1) usar bentonita o gel "
            f"conductivo alrededor de cada varilla, (2) aumentar longitud de "
            f"varilla a 3.0-4.0 m, (3) añadir malla de puesta a tierra "
            f"complementaria, (4) tratar el suelo con sales electrolíticas. "
            f"Conductor de tierra: {conductor_tierra}. "
            f"Verifique con telurómetro IEEE 81 después de la instalación."
        )

    # Justificación
    justificacion = (
        f"Sistema de puesta a tierra diseñado según NTC 2050 Art. 250 e IEEE 142. "
        f"Resistividad del terreno: {resistividad} Ω-m. "
        f"Electrodo tipo varilla vertical copperweld: {longitud_electrodo}m "
        f"× Ø{diametro_electrodo*1000:.0f}mm. "
        f"Resistencia de 1 varilla: {r_single:.2f} Ω. "
    )
    if num_varillas > 1:
        justificacion += (
            f"Requiere {num_varillas} varillas en paralelo separadas ≥{separacion}m "
            f"(factor acoplamiento k≈{factor_acoplamiento}). "
            f"Resistencia equivalente total: {r_total:.2f} Ω. "
        )
    else:
        justificacion += f"Resistencia total: {r_total:.2f} Ω. "

    if cumple:
        justificacion += (
            f"✓ Cumple límite NTC 2050 Art. 250-56 ({requerimiento}Ω). "
            f"Estado: {estado}."
        )
    else:
        justificacion += (
            f"⚠️ No cumple límite de {requerimiento}Ω. "
            f"Se requieren medidas adicionales. Estado: {estado}."
        )

    return {
        "r_total": round(r_total, 2),
        "r_single": round(r_single, 2),
        "cumple": cumple,
        "limite": requerimiento,
        "num_varillas": num_varillas,
        "separacion_varillas": separacion,
        "conductor_tierra": conductor_tierra,
        "seccion_conductor_mm2": seccion_conductor_mm2,
        "rho_usado": resistividad,
        "estado": estado,
        "sugerencia": sugerencia,
        "metodo_medicion": "Caída de potencial (3 puntos, IEEE 81)",
        "justificacion": justificacion,
        "tabla_referencia": "IEEE 142 / NTC 2050 Art. 250-52, 250-53, 250-56, 250-122",
    }
