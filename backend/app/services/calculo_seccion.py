"""
Servicio de cálculo de sección de conductor según NTC 2050 / RETIE.

Incluye:
- Tabla 310-16 completa (60°C, 75°C, 90°C) para Cu y Al
- Resistencia DC del conductor (Capítulo 9, Tabla 8)
- Selección PRIMARIA por columna de temperatura de bornes (Art. 110-14(c))
  → Default 60°C para instalaciones residenciales/comerciales colombianas
- Derating con columna del aislamiento (temp ambiente + agrupamiento)
- Iteración por caída de tensión (Art. 210-19)
- Justificaciones normativas en español
"""
import math
from typing import Optional

# =============================================================================
# TABLA 310-16 NTC 2050 — Ampacidades permisibles en conductores aislados
# (No más de 3 conductores en ducto, temperatura ambiente 30°C)
# =============================================================================

CALIBRES_ORDENADOS = [
    "14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG",
    "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG",
    "250 MCM", "300 MCM", "350 MCM", "400 MCM", "500 MCM",
]

# --- Cobre ---
AMPACIDAD_CU = {
    60: [15, 20, 30, 40, 55, 70,  85,  95, 110, 125, 145, 165, 195, 215, 240, 260, 280, 320],
    75: [20, 25, 35, 50, 65, 85, 100, 115, 130, 150, 175, 200, 230, 255, 285, 310, 335, 380],
    90: [25, 30, 40, 55, 75, 95, 110, 130, 150, 170, 195, 225, 260, 290, 320, 350, 380, 430],
}

# --- Aluminio ---
AMPACIDAD_AL = {
    60: [ 0, 15, 25, 30, 40, 55, 65,  75,  85, 100, 115, 130, 150, 170, 190, 210, 225, 260],
    75: [ 0, 20, 30, 40, 50, 65, 75,  90, 100, 120, 135, 155, 180, 205, 230, 250, 270, 310],
    90: [ 0, 25, 30, 40, 55, 65, 75,  90, 100, 120, 135, 155, 180, 205, 230, 250, 270, 310],
}
# Aluminio 12 AWG no tiene ampacidad en 60°C; 14 AWG Al no está listado en NTC 2050

# =============================================================================
# CAPÍTULO 9, TABLA 8 NTC 2050 — Propiedades eléctricas de conductores
# Resistencia DC a 75°C (Ω/km) para conductores de cobre y aluminio
# =============================================================================

PROPIEDADES_CONDUCTOR = {
    # calibre: {seccion_mm2, r_dc_cu_75, r_dc_al_75, r_ac_cu_pvc, r_ac_al_pvc}
    "14 AWG":  {"mm2": 2.08,  "r_cu": 10.170, "r_al": 10.170, "x_cu": 0.240, "x_al": 0.240},
    "12 AWG":  {"mm2": 3.31,  "r_cu": 6.560,  "r_al": 6.560,  "x_cu": 0.220, "x_al": 0.220},
    "10 AWG":  {"mm2": 5.26,  "r_cu": 3.940,  "r_al": 3.940,  "x_cu": 0.207, "x_al": 0.207},
    "8 AWG":   {"mm2": 8.37,  "r_cu": 2.480,  "r_al": 2.480,  "x_cu": 0.200, "x_al": 0.200},
    "6 AWG":   {"mm2": 13.30, "r_cu": 1.562,  "r_al": 2.580,  "x_cu": 0.184, "x_al": 0.184},
    "4 AWG":   {"mm2": 21.15, "r_cu": 0.983,  "r_al": 1.620,  "x_cu": 0.171, "x_al": 0.171},
    "3 AWG":   {"mm2": 26.67, "r_cu": 0.780,  "r_al": 1.290,  "x_cu": 0.164, "x_al": 0.164},
    "2 AWG":   {"mm2": 33.62, "r_cu": 0.618,  "r_al": 1.020,  "x_cu": 0.157, "x_al": 0.157},
    "1 AWG":   {"mm2": 42.41, "r_cu": 0.490,  "r_al": 0.808,  "x_cu": 0.151, "x_al": 0.151},
    "1/0 AWG": {"mm2": 53.49, "r_cu": 0.389,  "r_al": 0.642,  "x_cu": 0.144, "x_al": 0.144},
    "2/0 AWG": {"mm2": 67.43, "r_cu": 0.308,  "r_al": 0.508,  "x_cu": 0.138, "x_al": 0.138},
    "3/0 AWG": {"mm2": 85.01, "r_cu": 0.245,  "r_al": 0.403,  "x_cu": 0.135, "x_al": 0.135},
    "4/0 AWG": {"mm2": 107.2, "r_cu": 0.194,  "r_al": 0.321,  "x_cu": 0.128, "x_al": 0.128},
    "250 MCM": {"mm2": 126.7, "r_cu": 0.164,  "r_al": 0.272,  "x_cu": 0.125, "x_al": 0.125},
    "300 MCM": {"mm2": 152.0, "r_cu": 0.137,  "r_al": 0.228,  "x_cu": 0.121, "x_al": 0.121},
    "350 MCM": {"mm2": 177.3, "r_cu": 0.118,  "r_al": 0.196,  "x_cu": 0.118, "x_al": 0.118},
    "400 MCM": {"mm2": 202.7, "r_cu": 0.104,  "r_al": 0.172,  "x_cu": 0.115, "x_al": 0.115},
    "500 MCM": {"mm2": 253.4, "r_cu": 0.0833, "r_al": 0.139,  "x_cu": 0.112, "x_al": 0.112},
}

# =============================================================================
# FACTORES DE CORRECCIÓN POR TEMPERATURA AMBIENTE
# Art. 310-15(b)(1) NTC 2050
# =============================================================================

FACTOR_TEMPERATURA = {
    # temp_ambiente: {temp_rating: factor}
    10: {60: 1.29, 75: 1.20, 90: 1.15},
    15: {60: 1.22, 75: 1.15, 90: 1.12},
    20: {60: 1.15, 75: 1.11, 90: 1.08},
    25: {60: 1.08, 75: 1.05, 90: 1.04},
    30: {60: 1.00, 75: 1.00, 90: 1.00},
    35: {60: 0.91, 75: 0.94, 90: 0.96},
    40: {60: 0.82, 75: 0.88, 90: 0.91},
    45: {60: 0.71, 75: 0.82, 90: 0.87},
    50: {60: 0.58, 75: 0.75, 90: 0.82},
    55: {60: 0.41, 75: 0.67, 90: 0.76},
    60: {60: None, 75: 0.58, 90: 0.71},
}

# =============================================================================
# FACTORES DE CORRECCIÓN POR AGRUPAMIENTO DE CONDUCTORES
# Art. 310-15(b)(3)(a) NTC 2050
# =============================================================================

FACTOR_AGRUPAMIENTO = {
    1: 1.00,
    2: 1.00,
    3: 1.00,
    4: 0.80,
    5: 0.80,
    6: 0.80,
    7: 0.70,
    9: 0.70,
    10: 0.50,
    20: 0.50,
}

# =============================================================================
# CONFIGURACIONES DE BAJA TENSIÓN COLOMBIA — NTC 2050 / RETIE
# =============================================================================

CONFIGURACIONES_BT = {
    "mono_120": {
        "label": "Monofásico Bifilar 120V (F + N)",
        "tension": 120,
        "sistema": "monofasico",
        "num_fases": 1,
        "tiene_neutro": True,
        "num_conductores_vivos": 1,
    },
    "mono_208": {
        "label": "Monofásico Trifilar 120/208V (F + F + N)",
        "tension": 208,
        "sistema": "monofasico",
        "num_fases": 2,
        "tiene_neutro": True,
        "num_conductores_vivos": 2,
    },
    "mono_240": {
        "label": "Monofásico Trifilar 120/240V (F + F + N)",
        "tension": 240,
        "sistema": "monofasico",
        "num_fases": 2,
        "tiene_neutro": True,
        "num_conductores_vivos": 2,
    },
    "tri_208": {
        "label": "Trifásico 208V (3F + N)",
        "tension": 208,
        "sistema": "trifasico",
        "num_fases": 3,
        "tiene_neutro": True,
        "num_conductores_vivos": 3,
    },
    "tri_220": {
        "label": "Trifásico 220V (3F)",
        "tension": 220,
        "sistema": "trifasico",
        "num_fases": 3,
        "tiene_neutro": False,
        "num_conductores_vivos": 3,
    },
    "tri_440": {
        "label": "Trifásico 440V (3F)",
        "tension": 440,
        "sistema": "trifasico",
        "num_fases": 3,
        "tiene_neutro": False,
        "num_conductores_vivos": 3,
    },
}

# =============================================================================
# DATOS DE CANALIZACIÓN — NTC 2050 Capítulo 9, Tabla 5 + Tabla 4
# =============================================================================

# Área aproximada del conductor con aislamiento THHN/THWN (mm²)
# NTC 2050 Cap. 9 Tabla 5 — Approximate área mm²
AREA_CONDUCTOR_AISLADO = {
    "14 AWG":  8.58,
    "12 AWG":  11.68,
    "10 AWG":  15.68,
    "8 AWG":   23.65,
    "6 AWG":   32.71,
    "4 AWG":   46.26,
    "3 AWG":   54.38,
    "2 AWG":   67.43,
    "1 AWG":   82.89,
    "1/0 AWG": 100.00,
    "2/0 AWG": 118.70,
    "3/0 AWG": 141.00,
    "4/0 AWG": 167.70,
    "250 MCM": 196.10,
    "300 MCM": 227.70,
    "350 MCM": 258.10,
    "400 MCM": 290.30,
    "500 MCM": 354.70,
}

# Tubo PVC conduit dimensiones comerciales Colombia (mm)
# Diámetro interno nominal → área interna (mm²)
PVC_CONDUIT = [
    ("1/2\"", 16.1,  203.0),
    ("3/4\"", 21.3,  356.0),
    ("1\"",   27.0,  573.0),
    ("1-1/4\"", 35.4, 983.0),
    ("1-1/2\"", 41.2, 1333.0),
    ("2\"",   52.5,  2165.0),
    ("2-1/2\"", 63.0, 3117.0),
    ("3\"",   78.4,  4828.0),
    ("4\"",  100.9,  7998.0),
]

# =============================================================================
# FUNCIONES AUXILIARES
# =============================================================================

def _obtener_ampacidad(calibre: str, material: str, temp_rating: int) -> int:
    """Obtiene la ampacidad base de la Tabla 310-16 para un calibre dado."""
    idx = CALIBRES_ORDENADOS.index(calibre)
    tabla = AMPACIDAD_CU if material == "cu" else AMPACIDAD_AL
    return tabla[temp_rating][idx]


def _seleccionar_conductor_por_ampacidad(
    corriente: float, material: str, temp_rating: int,
    factor_temp: float, factor_agrup: float
) -> tuple[str, float, float]:
    """Selecciona el calibre más pequeño cuya ampacidad corregida >= corriente."""
    tabla = AMPACIDAD_CU if material == "cu" else AMPACIDAD_AL
    for i, calibre in enumerate(CALIBRES_ORDENADOS):
        amp_base = tabla[temp_rating][i]
        if amp_base == 0:
            continue  # No listado (ej: 12 AWG Al a 60°C)
        amp_corregida = amp_base * factor_temp * factor_agrup
        if amp_corregida >= corriente:
            return calibre, float(amp_base), float(amp_corregida)
    # Retornar el más grande disponible
    ultimo = CALIBRES_ORDENADOS[-1]
    amp_base = tabla[temp_rating][-1]
    amp_corregida = amp_base * factor_temp * factor_agrup
    return ultimo, float(amp_base), float(amp_corregida)


def _caida_tension(
    calibre: str, material: str, corriente: float,
    longitud: float, tension: float, sistema: str
) -> float:
    """
    Calcula la caída de tensión porcentual.
    Usa resistencia DC a 75°C del Capítulo 9, Tabla 8 (Ω/km).
    Fórmula exacta IEC/NTC:
      Monofásico: ΔV% = (2 × L × I × (R cos φ + X sen φ)) / V × 100
      Trifásico:  ΔV% = (√3 × L × I × (R cos φ + X sen φ)) / V × 100
    Simplificada (despreciando reactancia para secciones < 50mm²):
      Usamos solo R para conductores pequeños.
    """
    props = PROPIEDADES_CONDUCTOR.get(calibre)
    if not props:
        return 0.1
    r_km = props["r_cu"] if material == "cu" else props["r_al"]
    r_m = r_km / 1000.0  # Ω/m

    if sistema == "trifasico":
        caida = (math.sqrt(3) * r_m * longitud * corriente) / tension * 100
    else:
        caida = (2 * r_m * longitud * corriente) / tension * 100

    return round(max(caida, 0.01), 2)


def _obtener_factor_temp(temp_ambiente: float, temp_rating: int) -> float:
    """Interpola o selecciona el factor de corrección por temperatura."""
    # Encontrar la temperatura más cercana en la tabla
    temps_ordenados = sorted(FACTOR_TEMPERATURA.keys())
    # Redondear temp_ambiente a la entrada más cercana
    temp_cercana = min(temps_ordenados, key=lambda t: abs(t - temp_ambiente))
    factor = FACTOR_TEMPERATURA[temp_cercana].get(temp_rating)
    if factor is None:
        # Si no hay rating para esa temp, usar el más cercano disponible
        for temp in sorted(temps_ordenados, reverse=True):
            f = FACTOR_TEMPERATURA[temp].get(temp_rating)
            if f is not None:
                factor = f
                break
        if factor is None:
            factor = 1.0
    return factor


def _obtener_factor_agrupamiento(num_conductores: int) -> float:
    """Selecciona el factor de corrección por agrupamiento más cercano."""
    if num_conductores <= 3:
        return 1.0
    for max_cond, factor in sorted(FACTOR_AGRUPAMIENTO.items()):
        if num_conductores <= max_cond:
            return factor
    return 0.50


def _siguiente_calibre(calibre: str) -> Optional[str]:
    """Devuelve el siguiente calibre más grande, o None si ya es el máximo."""
    idx = CALIBRES_ORDENADOS.index(calibre)
    if idx < len(CALIBRES_ORDENADOS) - 1:
        return CALIBRES_ORDENADOS[idx + 1]
    return None


def _seleccionar_conductor_tierra(corriente_design: float) -> str:
    """
    Selecciona el calibre del conductor de tierra según NTC 2050 Art. 250-122.
    Basado en el rating del dispositivo de sobrecorriente (aproximado por I_design).
    """
    TIERRA_CU = [
        (15,   "14 AWG"),
        (20,   "12 AWG"),
        (60,   "10 AWG"),
        (100,  "8 AWG"),
        (200,  "6 AWG"),
        (300,  "4 AWG"),
        (400,  "3 AWG"),
        (500,  "2 AWG"),
        (600,  "1 AWG"),
        (800,  "1/0 AWG"),
        (1000, "2/0 AWG"),
        (1200, "3/0 AWG"),
    ]
    for amperaje, calibre in TIERRA_CU:
        if corriente_design <= amperaje:
            return calibre
    return "4/0 AWG"


def _calcular_canalizacion(calibre_fase: str, calibre_tierra: str, num_fases: int, tiene_neutro: bool) -> str:
    """
    Calcula el diámetro mínimo de tubería PVC según NTC 2050 Capítulo 9.
    Incluye fases, neutro (si aplica) y conductor de tierra.
    Fill: 53% para 1 conductor, 31% para 2, 40% para 3 o más.
    """
    area_fase = AREA_CONDUCTOR_AISLADO.get(calibre_fase, 100.0)
    area_tierra = AREA_CONDUCTOR_AISLADO.get(calibre_tierra, 10.0)

    # Fases + neutro (mismo calibre que fase) + tierra
    total_cond = num_fases + (1 if tiene_neutro else 0) + 1  # +1 tierra
    area_total = (num_fases + (1 if tiene_neutro else 0)) * area_fase + area_tierra

    if total_cond == 1:
        fill_factor = 0.53
    elif total_cond == 2:
        fill_factor = 0.31
    else:
        fill_factor = 0.40

    area_requerida = area_total / fill_factor

    for nombre, diametro, area_interna in PVC_CONDUIT:
        if area_interna >= area_requerida:
            return nombre, total_cond
    return "4\"+", total_cond


def buscar_calibre_cobre(corriente_diseno: float) -> str:
    """
    Selecciona conductor de cobre por columna 60°C para protección
    de terminales según Art. 110-14(c) de la NTC 2050.
    Limita 12 AWG a 20 A máximo (regla de bornes pequeños).
    """
    for i, calibre in enumerate(CALIBRES_ORDENADOS):
        amp = AMPACIDAD_CU[60][i]
        if amp > 0 and amp >= corriente_diseno:
            # Art. 240.4(D) — limitaciones de conductores pequeños
            if calibre == "14 AWG" and corriente_diseno > 15:
                continue
            if calibre == "12 AWG" and corriente_diseno > 20:
                continue
            if calibre == "10 AWG" and corriente_diseno > 30:
                continue
            return calibre
    return "Requerida consulta de ingeniería (Carga > 320 A a 60 °C)"


# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

def calcular_seccion(
    potencia_kw: float,
    configuracion: str,
    factor_potencia: float,
    material: str,
    aislamiento: str,
    longitud: float,
    caida_tension_max: float,
    temperatura_ambiente: float = 30.0,
    num_conductores_agrupados: int = 0,
    temperatura_terminales: int = 60,
    carga_continua: bool = True,
) -> dict:
    """
    Calcula el calibre del conductor eléctrico según NTC 2050.

    Parámetros:
    - potencia_kw: Potencia activa en kW (se convierte a W ×1000 internamente)
    - configuracion: Configuración BT colombiana (ver CONFIGURACIONES_BT)
    - num_conductores_agrupados: Conductores en ducto (0 = auto desde config)
    - carga_continua: Si True, aplica factor 125% (Art. 210-20(A))

    Lógica de selección (doble criterio):
    1. CRITERIO PRIMARIO: Columna de temperatura de bornes (default 60°C,
       Art. 110-14(c)).
    2. CRITERIO DE DERATING: Columna del aislamiento con factores de
       corrección por T° ambiente y agrupamiento.
    3. Se selecciona el MAYOR calibre entre ambos criterios.
    4. Iteración por caída de tensión (Art. 210-19).
    5. Cálculo de diámetro de canalización (Capítulo 9).
    """

    # --- Paso 0: Resolver configuración BT colombiana ---
    cfg = CONFIGURACIONES_BT.get(configuracion)
    if cfg is None:
        cfg = CONFIGURACIONES_BT["mono_120"]  # fallback seguro
    tension = cfg["tension"]
    sistema = cfg["sistema"]
    config_label = cfg["label"]
    tiene_neutro = cfg["tiene_neutro"]
    num_fases = cfg["num_fases"]
    conductores_vivos_config = cfg["num_conductores_vivos"]

    # Auto-detectar número de conductores si no se especificó
    if num_conductores_agrupados <= 0:
        num_conductores_agrupados = conductores_vivos_config
    # Total conductores en tubería (fases + neutro + tierra)
    total_conductores_tuberia = num_fases + (1 if tiene_neutro else 0) + 1  # +1 tierra

    # Convertir kW a W
    potencia_w = potencia_kw * 1000

    # --- Paso 1: Corriente nominal ---
    if sistema == "trifasico":
        corriente_nom = potencia_w / (math.sqrt(3) * tension * factor_potencia)
    else:
        corriente_nom = potencia_w / (tension * factor_potencia)

    # Factor de diseño: 125% solo para carga continua
    factor_diseno = 1.25 if carga_continua else 1.0
    corriente_design = corriente_nom * factor_diseno

    # --- Paso 2: Determinar columnas de temperatura ---

    # Columna de bornes (terminales) — Art. 110-14(c)
    temp_terminales = temperatura_terminales
    if temp_terminales not in (60, 75):
        temp_terminales = 60
    col_terminales = f"{temp_terminales}°C"

    # Columna del aislamiento (para derating)
    aislamiento_lower = aislamiento.lower().strip()
    if aislamiento_lower in ("tw", "uf", "60", "tw/uf"):
        temp_derating = 60
        col_derating = "60°C"
        aislamiento_label = "TW / UF"
    elif aislamiento_lower in ("thw", "thwn", "75", "thw/thwn"):
        temp_derating = 75
        col_derating = "75°C"
        aislamiento_label = "THW / THWN"
    else:  # thhn, xlpe, 90
        temp_derating = 90
        col_derating = "90°C"
        aislamiento_label = "THHN / XLPE"

    # --- Paso 3: Factores de corrección (sobre columna del aislamiento) ---
    factor_temp = _obtener_factor_temp(temperatura_ambiente, temp_derating)
    factor_agrup = _obtener_factor_agrupamiento(num_conductores_agrupados)

    # =====================================================================
    # Paso 4: SELECCIÓN POR BORNES (CRITERIO PRIMARIO)
    # Selecciona el calibre más pequeño tal que:
    #   ampacidad_en_columna_terminales >= corriente_design
    # =====================================================================
    conductor_bornes = CALIBRES_ORDENADOS[-1]
    amp_terminales_base = 0.0
    for i, calibre in enumerate(CALIBRES_ORDENADOS):
        tabla = AMPACIDAD_CU if material == "cu" else AMPACIDAD_AL
        amp_en_terminales = tabla[temp_terminales][i]
        if amp_en_terminales == 0:
            continue
        # Art. 240.4(D): limitaciones de conductores pequeños
        if material == "cu" and temp_terminales == 60:
            if calibre == "14 AWG" and corriente_design > 15:
                continue
            if calibre == "12 AWG" and corriente_design > 20:
                continue
            if calibre == "10 AWG" and corriente_design > 30:
                continue
        if amp_en_terminales >= corriente_design:
            conductor_bornes = calibre
            amp_terminales_base = float(amp_en_terminales)
            break

    # =====================================================================
    # Paso 5: VERIFICACIÓN DE DERATING (columna del aislamiento)
    # Para cada calibre, si su ampacidad derated >= corriente_design, es válido.
    # Empezamos desde conductor_bornes hacia arriba.
    # =====================================================================
    idx_inicio = CALIBRES_ORDENADOS.index(conductor_bornes)
    conductor_derating = conductor_bornes
    amp_derating_base = 0.0
    amp_derating_corregida = 0.0
    for i in range(idx_inicio, len(CALIBRES_ORDENADOS)):
        calibre = CALIBRES_ORDENADOS[i]
        tabla = AMPACIDAD_CU if material == "cu" else AMPACIDAD_AL
        amp_base_der = tabla[temp_derating][i]
        if amp_base_der == 0:
            continue
        amp_corr = amp_base_der * factor_temp * factor_agrup
        if amp_corr >= corriente_design:
            conductor_derating = calibre
            amp_derating_base = float(amp_base_der)
            amp_derating_corregida = round(amp_corr, 1)
            break

    # =====================================================================
    # Paso 6: CALIBRE FINAL = max(por bornes, por derating)
    # =====================================================================
    idx_bornes = CALIBRES_ORDENADOS.index(conductor_bornes)
    idx_derating = CALIBRES_ORDENADOS.index(conductor_derating)
    if idx_derating > idx_bornes:
        conductor = conductor_derating
        criterio = "Derating"
    else:
        conductor = conductor_bornes
        criterio = "Terminales"

    # Recalcular ampacidades exactas para el conductor final
    idx_final = CALIBRES_ORDENADOS.index(conductor)
    tabla_mat = AMPACIDAD_CU if material == "cu" else AMPACIDAD_AL
    amp_terminales_base = float(tabla_mat[temp_terminales][idx_final])
    amp_derating_base = float(tabla_mat[temp_derating][idx_final])
    amp_derating_corregida = round(amp_derating_base * factor_temp * factor_agrup, 1)

    # =====================================================================
    # Paso 7: ITERACIÓN POR CAÍDA DE TENSIÓN (Art. 210-19)
    # =====================================================================
    max_iteraciones = 8
    caida = _caida_tension(
        conductor, material, corriente_nom, longitud, tension, sistema
    )
    caida_cumple = caida <= caida_tension_max
    conductor_inicial_caida = conductor

    for _ in range(max_iteraciones):
        if caida_cumple:
            break
        siguiente = _siguiente_calibre(conductor)
        if siguiente is None:
            break
        conductor = siguiente
        caida = _caida_tension(
            conductor, material, corriente_nom, longitud, tension, sistema
        )
        caida_cumple = caida <= caida_tension_max

    # Si el calibre escaló por caída, recalcular ampacidades
    if conductor != conductor_inicial_caida:
        idx_final = CALIBRES_ORDENADOS.index(conductor)
        amp_terminales_base = float(tabla_mat[temp_terminales][idx_final])
        amp_derating_base = float(tabla_mat[temp_derating][idx_final])
        amp_derating_corregida = round(amp_derating_base * factor_temp * factor_agrup, 1)
        criterio = "Caída de tensión"

    # =====================================================================
    # Paso 8: ALERTA DE CAÍDA DE TENSIÓN
    # =====================================================================
    alerta_caida = None
    if not caida_cumple:
        alerta_caida = (
            f"La caída de tensión ({caida}%) excede el máximo permitido "
            f"({caida_tension_max}%). Se seleccionó el mayor calibre disponible "
            f"({conductor}). Considere reducir la longitud, aumentar la tensión "
            f"o usar conductores en paralelo."
        )

    # =====================================================================
    # Paso 9: JUSTIFICACIÓN NORMATIVA
    # =====================================================================
    material_label = "Cobre" if material == "cu" else "Aluminio"
    justificacion = (
        f"Conductor {material_label} calibre {conductor} seleccionado según "
        f"NTC 2050 Tabla 310-16. "
        f"Corriente nominal: {corriente_nom:.2f} A. "
        f"Corriente de diseño ({factor_diseno*100:.0f}%): {corriente_design:.2f} A. "
    )

    # Explicar criterio que gobernó
    if criterio == "Terminales":
        justificacion += (
            f"Criterio gobernante: Temperatura de bornes. "
            f"Ampacidad en columna {col_terminales} "
            f"(Art. 110-14(c)): {amp_terminales_base:.0f} A ≥ "
            f"corriente de diseño {corriente_design:.2f} A. "
        )
    elif criterio == "Derating":
        justificacion += (
            f"Criterio gobernante: Derating. "
            f"Ampacidad base {col_derating}: {amp_derating_base:.0f} A → "
            f"corregida (Fᵗ={factor_temp:.2f}, Fᵃ={factor_agrup:.2f}): "
            f"{amp_derating_corregida:.1f} A ≥ {corriente_design:.2f} A. "
            f"La ampacidad en bornes ({col_terminales}) es "
            f"{amp_terminales_base:.0f} A — cumple pero no gobernó. "
        )
    else:  # "Caída de tensión"
        justificacion += (
            f"Criterio gobernante: Caída de tensión ({caida}% ≤ {caida_tension_max}%). "
            f"Ampacidad en bornes {col_terminales}: {amp_terminales_base:.0f} A. "
            f"Ampacidad derated {col_derating}: {amp_derating_corregida:.1f} A. "
        )

    if carga_continua:
        justificacion += (
            f"Carga continua (>3h): aplica factor {factor_diseno*100:.0f}% "
            f"(Art. 210-20(A)). "
        )
    else:
        justificacion += "Carga no continua: factor 100% (Art. 210-20(A)). "

    if sistema == "trifasico":
        justificacion += "Sistema trifásico (Art. 210-19). "
    else:
        justificacion += "Sistema monofásico (Art. 210-19). "

    if temp_terminales == 60:
        justificacion += (
            f"Se aplica columna {col_terminales} por limitación de temperatura "
            f"en terminales de equipos (Art. 110-14(c)). "
        )
    if num_conductores_agrupados > 3:
        justificacion += (
            f"Factor agrupamiento {factor_agrup:.2f} aplicado por "
            f"{num_conductores_agrupados} conductores (Art. 310-15(b)(3)(a)). "
        )
    if temperatura_ambiente != 30:
        justificacion += (
            f"Factor temperatura {factor_temp:.2f} aplicado por "
            f"Tᵃᵐᵇ={temperatura_ambiente}°C (Art. 310-15(b)(1)). "
        )

    # =====================================================================
    # Paso 10: Conductor de tierra + canalización
    # =====================================================================
    props = PROPIEDADES_CONDUCTOR.get(conductor, {"mm2": 53.49})
    seccion_mm2 = props["mm2"]

    # Conductor de tierra según NTC 2050 Art. 250-122
    calibre_tierra = _seleccionar_conductor_tierra(corriente_design)
    props_tierra = PROPIEDADES_CONDUCTOR.get(calibre_tierra, {"mm2": 2.08})
    seccion_tierra_mm2 = props_tierra["mm2"]

    # Diámetro de canalización incluye fases + neutro + tierra
    diametro_canalizacion, total_cond = _calcular_canalizacion(
        conductor, calibre_tierra, num_fases, tiene_neutro
    )

    return {
        "conductor": conductor,
        "seccion_mm2": seccion_mm2,
        "corriente_nom": round(corriente_nom, 2),
        "corriente_design": round(corriente_design, 2),
        "configuracion": config_label,
        "tension": tension,
        "sistema": sistema,
        "num_fases": num_fases,
        "tiene_neutro": tiene_neutro,
        "num_conductores_vivos": num_conductores_agrupados,
        "total_conductores_tuberia": total_cond,
        "calibre_tierra": calibre_tierra,
        "seccion_tierra_mm2": round(seccion_tierra_mm2, 2),
        "calibre_neutro": conductor if tiene_neutro else "No aplica",
        "seccion_neutro_mm2": seccion_mm2 if tiene_neutro else 0.0,
        "diametro_canalizacion": diametro_canalizacion,
        "ampacidad_terminales": amp_terminales_base,
        "ampacidad_derated": amp_derating_corregida,
        "columna_terminales": col_terminales,
        "columna_derating": col_derating,
        "criterio_seleccion": criterio,
        "factor_temp": round(factor_temp, 3),
        "factor_agrup": round(factor_agrup, 3),
        "caida_tension": caida,
        "caida_cumple": caida_cumple,
        "alerta_caida": alerta_caida,
        "justificacion": justificacion,
        "tabla_referencia": f"Tabla 310-16 NTC 2050 ({material_label}, {aislamiento_label})",
    }
