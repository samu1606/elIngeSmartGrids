"""
Configuración multi-norma para cálculos eléctricos.

Soporta:
- NTC 2050 / RETIE (Colombia) — Español
- NEC (USA) — English
- NOM-001 (México) — Español
- NBR 5410 (Brasil) — Português/English

La mayoría de tablas de ampacidad son idénticas entre NTC 2050 y NEC
(ambas derivan de la misma norma IEC/IEEE). Las diferencias principales
son referencias de artículos e idioma.
"""

NORMS = {
    "CO": {
        "code": "NTC_2050",
        "country": "Colombia",
        "country_en": "Colombia",
        "norm_name": "NTC 2050 + RETIE",
        "language": "es",
        "vOLTAGES": [120, 208, 240, 440],
        "frequency": 60,
        "wire_system": "AWG",
        "table_ref": "Tabla 310-16 NTC 2050",
        "breaker_ref": "NTC 2050 Art. 240-6",
        "continuous_load_ref": "NTC 2050 Art. 210-20(A)",
        "conductor_ref": "NTC 2050 Art. 430-22",
        "motor_ref": "NTC 2050 Art. 430",
        "grounding_ref": "NTC 2050 Art. 250-122",
        "voltage_drop_ref": "NTC 2050 Art. 210-19",
        "terminals_ref": "NTC 2050 Art. 110-14(c)",
        "grouping_ref": "NTC 2050 Art. 310-15(b)(3)(a)",
        "temp_ref": "NTC 2050 Art. 310-15(b)(1)",
        "retie_ref": "RETIE Art. 20.4",
        "labels": {
            "conductor": "Conductor",
            "breaker": "Breaker",
            "corriente_nom": "Corriente nominal",
            "corriente_design": "Corriente de diseño",
            "seccion": "Sección",
            "caida_tension": "Caída de tensión",
            "cumple": "Cumple",
            "no_cumple": "No cumple",
        }
    },
    "US": {
        "code": "NEC",
        "country": "USA",
        "country_en": "United States",
        "norm_name": "NEC (NFPA 70)",
        "language": "en",
        "voltages": [120, 208, 240, 480],
        "frequency": 60,
        "wire_system": "AWG",
        "table_ref": "NEC Table 310.16",
        "breaker_ref": "NEC Art. 240-6",
        "continuous_load_ref": "NEC Art. 210-20(A)",
        "conductor_ref": "NEC Art. 430-22",
        "motor_ref": "NEC Art. 430",
        "grounding_ref": "NEC Art. 250-122",
        "voltage_drop_ref": "NEC Art. 210-19",
        "terminals_ref": "NEC Art. 110-14(C)",
        "grouping_ref": "NEC Art. 310-15(b)(3)(a)",
        "temp_ref": "NEC Art. 310-15(b)(1)",
        "retie_ref": None,  # No RETIE in USA
        "labels": {
            "conductor": "Conductor",
            "breaker": "Breaker",
            "corriente_nom": "Rated current",
            "corriente_design": "Design current",
            "seccion": "Cross-section",
            "caida_tension": "Voltage drop",
            "cumple": "Pass",
            "no_cumple": "Fail",
        }
    },
    "MX": {
        "code": "NOM_001",
        "country": "México",
        "country_en": "Mexico",
        "norm_name": "NOM-001-SEDE",
        "language": "es",
        "voltages": [120, 208, 240, 480],
        "frequency": 60,
        "wire_system": "AWG",
        "table_ref": "NOM-001 Tabla 310-16",
        "breaker_ref": "NOM-001 Art. 240-6",
        "continuous_load_ref": "NOM-001 Art. 210-20(A)",
        "conductor_ref": "NOM-001 Art. 430-22",
        "motor_ref": "NOM-001 Art. 430",
        "grounding_ref": "NOM-001 Art. 250-122",
        "voltage_drop_ref": "NOM-001 Art. 210-19",
        "terminals_ref": "NOM-001 Art. 110-14(c)",
        "grouping_ref": "NOM-001 Art. 310-15(b)(3)(a)",
        "temp_ref": "NOM-001 Art. 310-15(b)(1)",
        "retie_ref": None,
        "labels": {
            "conductor": "Conductor",
            "breaker": "Interruptor",
            "corriente_nom": "Corriente nominal",
            "corriente_design": "Corriente de diseño",
            "seccion": "Sección",
            "caida_tension": "Caída de tensión",
            "cumple": "Cumple",
            "no_cumple": "No cumple",
        }
    },
}

def get_norm(country_code: str = "CO") -> dict:
    """Get norm configuration by country code."""
    return NORMS.get(country_code.upper(), NORMS["CO"])

def get_available_countries() -> list:
    """Get list of available countries with their norm info."""
    return [
        {"code": k, "country": v["country"], "norm": v["norm_name"], "language": v["language"]}
        for k, v in NORMS.items()
    ]