"""
Routers de Cálculos Eléctricos — NTC 2050 + RETIE.

Endpoints:
  POST /api/calculos/seccion       — Sección de conductor
  POST /api/calculos/protecciones  — Protecciones termomagnéticas
  POST /api/calculos/motores       — Circuito para motores
  POST /api/calculos/iluminacion   — Método de lúmenes
  POST /api/calculos/reactiva      — Compensación de reactiva
  POST /api/calculos/puesta_tierra — Puesta a tierra IEEE 142
  POST /api/calculos/potencia      — Potencia rápida (auxiliar)
"""

import os
import math
import httpx
import requests
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.calculo_seccion import calcular_seccion, buscar_calibre_cobre
from app.services.calculo_fotovoltaico import calcular_sistema_fotovoltaico
from app.services.norms_config import get_norm, get_available_countries, NORMS
from app.services.calculos_electricos import (
    calcular_protecciones,
    calcular_motor,
    calcular_iluminacion,
    calcular_reactiva,
    calcular_puesta_tierra,
)
from app.services.cuadro_cargas import calcular_cuadro_cargas
from app.services.caida_tension import calcular_caida_tension
from app.services.cortocircuito import calcular_cortocircuito
from app.services.tuberias import calcular_tuberias
from app.services.transformadores import calcular_transformador
from app.services.pararrayos import calcular_pararrayos

router = APIRouter()


# =============================================================================
# 1. SECCIÓN DE CONDUCTOR
# =============================================================================

class SeccionInput(BaseModel):
    potencia_kw: float = Field(..., gt=0, description="Potencia activa en kW")
    configuracion: str = Field(
        "mono_120",
        description="Configuración BT: mono_120, mono_208, mono_240, tri_208, tri_220, tri_440 (CO) / tri_480 (US)"
    )
    factor_potencia: float = Field(0.9, gt=0, le=1, description="Factor de potencia")
    material: str = Field("cu", description="cu (cobre) o al (aluminio)")
    aislamiento: str = Field("thw", description="tw, uf, thw, thwn, thhn, xlpe")
    longitud: float = Field(10, gt=0, description="Longitud del circuito en metros")
    caida_tension_max: float = Field(3, gt=0, le=10, description="Caída de tensión máxima permitida en %")
    temperatura_ambiente: float = Field(30.0, ge=10, le=60, description="Temperatura ambiente en °C")
    num_conductores_agrupados: int = Field(0, ge=0, le=20, description="Conductores en ducto (0 = auto desde configuración)")
    temperatura_terminales: int = Field(60, description="Temperatura de terminales: 60 o 75°C (Art. 110-14(c))")
    carga_continua: bool = Field(True, description="Carga continua (>3 horas). Aplica factor 125% (Art. 210-20(A))")
    country_code: str = Field("CO", description="Country code: CO (Colombia), US (USA/NEC), MX (Mexico)")


class SeccionOutput(BaseModel):
    conductor: str
    seccion_mm2: float
    corriente_nom: float
    corriente_design: float
    configuracion: str
    tension: float
    sistema: str
    num_fases: int
    tiene_neutro: bool
    num_conductores_vivos: int
    total_conductores_tuberia: int
    calibre_tierra: str
    seccion_tierra_mm2: float
    calibre_neutro: str
    seccion_neutro_mm2: float
    diametro_canalizacion: str
    ampacidad_terminales: float
    ampacidad_derated: float
    columna_terminales: str
    columna_derating: str
    criterio_seleccion: str
    factor_temp: float
    factor_agrup: float
    caida_tension: float
    caida_cumple: bool
    alerta_caida: str | None
    justificacion: str
    tabla_referencia: str


@router.get("/norms")
async def endpoint_norms():
    """Get available electrical norms by country."""
    return {"norms": get_available_countries()}


@router.get("/norms/{country_code}")
async def endpoint_norm_detail(country_code: str):
    """Get specific norm configuration by country code."""
    norm = get_norm(country_code)
    return {"country": country_code.upper(), "norm": norm}


@router.post("/seccion", response_model=SeccionOutput)
async def endpoint_seccion(data: SeccionInput):
    return calcular_seccion(
        potencia_kw=data.potencia_kw,
        configuracion=data.configuracion,
        factor_potencia=data.factor_potencia,
        material=data.material,
        aislamiento=data.aislamiento,
        longitud=data.longitud,
        caida_tension_max=data.caida_tension_max,
        temperatura_ambiente=data.temperatura_ambiente,
        num_conductores_agrupados=data.num_conductores_agrupados,
        temperatura_terminales=data.temperatura_terminales,
        carga_continua=data.carga_continua,
    )


# =============================================================================
# 2. PROTECCIONES (BREAKERS)
# =============================================================================

class ProteccionInput(BaseModel):
    corriente_carga: float = Field(..., gt=0, description="Corriente nominal de carga en Amperios")
    tipo_carga: str = Field("continua", description="continua o no_continua")
    tension: float = Field(208, gt=0, description="Tensión del sistema en Voltios")
    num_polos: str = Field("3", description="Número de polos del breaker: 1, 2 o 3")


class ProteccionOutput(BaseModel):
    corriente_carga: float
    corriente_design: float
    breaker: float
    factor_usado: str
    ampacidad_col: str
    cumple_240_4b: bool
    potencia_max: float
    justificacion: str
    tabla_referencia: str


@router.post("/protecciones", response_model=ProteccionOutput)
async def endpoint_protecciones(data: ProteccionInput):
    return calcular_protecciones(
        corriente_carga=data.corriente_carga,
        tipo_carga=data.tipo_carga,
        tension=data.tension,
        num_polos=data.num_polos,
    )


# =============================================================================
# 3. MOTORES
# =============================================================================

class MotorInput(BaseModel):
    potencia_hp: float = Field(..., gt=0, description="Potencia del motor en HP")
    tension: float = Field(208, gt=0, description="Tensión nominal en Voltios")
    eficiencia: float = Field(0.85, gt=0, le=1, description="Eficiencia del motor")
    fp: float = Field(0.85, gt=0, le=1, description="Factor de potencia del motor")
    sistema: str = Field("trifasico", description="trifasico o monofasico")
    tipo_arranque: str = Field("directo", description="directo, estrella_delta, suave, variador")
    letra_codigo: str = Field("F", description="Letra de código de rotor bloqueado (A-V)")


class MotorOutput(BaseModel):
    conductor: str
    seccion_mm2: float
    breaker: float
    contactor: str
    flc: float
    conductor_amps: float
    thermal: float
    corriente_arranque: float
    factor_servicio: float
    justificacion_normativa_ia: str
    justificacion: str
    tabla_referencia: str


@router.post("/motores", response_model=MotorOutput)
async def endpoint_motores(data: MotorInput):
    res = calcular_motor(
        potencia_hp=data.potencia_hp,
        tension=data.tension,
        eficiencia=data.eficiencia,
        fp=data.fp,
        sistema=data.sistema,
        tipo_arranque=data.tipo_arranque,
        letra_codigo=data.letra_codigo,
    )

    flc = res["flc"]
    breaker = res["breaker"]
    conductor_amps = res["conductor_amps"]
    contactor = res["contactor"]
    thermal = res["thermal"]
    corriente_arranque = res["corriente_arranque"]
    factor_servicio = res["factor_servicio"]
    justificacion_base = res["justificacion"]

    # Seleccionar calibre del conductor por columna 60°C (Art. 110-14(c))
    conductor = buscar_calibre_cobre(conductor_amps)

    # Sección mm²
    from app.services.calculo_seccion import PROPIEDADES_CONDUCTOR
    props = PROPIEDADES_CONDUCTOR.get(conductor, {"mm2": 53.49})
    seccion_mm2 = props["mm2"]

    # --- Justificación IA (Ollama opcional) ---
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")

    prompt_ia = (
        f"Como Ingeniero Electricista experto en la NTC 2050 (Código Eléctrico Colombiano) "
        f"y el RETIE, redacta un párrafo corto y estrictamente profesional de justificación "
        f"técnica para una memoria de cálculo de instalación eléctrica. "
        f"Datos del diseño: Motor de {data.potencia_hp} HP alimentado a {data.tension} V "
        f"({data.sistema}), arranque {data.tipo_arranque}, eficiencia {data.eficiencia*100:.0f}%, "
        f"FP {data.fp:.2f}, letra código {data.letra_codigo}. "
        f"Corriente Nominal (FLC): {flc} A. "
        f"Corriente del Conductor aplicando el factor de seguridad del 125% (Art. 430-22): "
        f"{conductor_amps} A. "
        f"Selección del conductor: Calibre {conductor} ({seccion_mm2} mm²) basado "
        f"estrictamente en la columna de 60°C de la Tabla 310-16, atendiendo a las "
        f"limitaciones de temperatura en las terminales de los equipos según el "
        f"Artículo 110-14(c). "
        f"Protección contra cortocircuito sugerida (Art. 430-52): Breaker de {breaker} A. "
        f"Protección térmica de sobrecarga (Art. 430-32): {thermal} A "
        f"(FS={factor_servicio}). "
        f"Corriente de arranque estimada (Art. 430-7(B)): {corriente_arranque} A. "
        f"Contactor recomendado: {contactor} (IEC 60947-4-1). "
        f"Cita los artículos correspondientes de la NTC 2050 y el RETIE de forma técnica, "
        f"explica el razonamiento de protección, y concluye con una recomendación "
        f"normativa y de seguridad. NO uses formato HTML ni markdown."
    )

    justificacion_ia = "Justificación técnica no disponible (Ollama no accesible)."
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": "gemma4:12b",
                    "prompt": prompt_ia,
                    "stream": False,
                },
            )
            if response.status_code == 200:
                justificacion_ia = response.json().get("response", justificacion_ia)
    except Exception as e:
        justificacion_ia = f"Cálculo completado. Justificación IA omitida: {str(e)}"

    return {
        "conductor": conductor,
        "seccion_mm2": seccion_mm2,
        "breaker": breaker,
        "contactor": contactor,
        "flc": round(flc, 2),
        "conductor_amps": round(conductor_amps, 2),
        "thermal": round(thermal, 2),
        "corriente_arranque": round(corriente_arranque, 1),
        "factor_servicio": factor_servicio,
        "justificacion_normativa_ia": justificacion_ia,
        "justificacion": justificacion_base,
        "tabla_referencia": res["tabla_referencia"],
    }


# =============================================================================
# 4. ILUMINACIÓN
# =============================================================================

class IluminacionInput(BaseModel):
    largo: float = Field(..., gt=0, description="Largo del área en metros")
    ancho: float = Field(..., gt=0, description="Ancho del área en metros")
    lux_objetivo: float = Field(500, gt=0, description="Nivel de iluminancia objetivo (lux)")
    lumens_lampara: float = Field(3000, gt=0, description="Lúmenes por luminaria")
    cu: float = Field(0.6, gt=0, le=1, description="Coeficiente de utilización")
    llf: float = Field(0.8, gt=0, le=1, description="Factor de pérdida lumínica (LLF)")
    potencia_lampara: float = Field(40, gt=0, description="Potencia por luminaria en Watts")
    tipo_area: str = Field("oficina", description="oficina, comercial, industrial, exterior")


class IluminacionOutput(BaseModel):
    area: float
    lux_objetivo: float
    luminarias: int
    luminarias_exactas: float
    distribucion: str
    filas: int
    columnas: int
    espaciamiento: str
    carga_total: float
    densidad_potencia: float
    retie_cumple: bool
    limite_retie: float
    cu_usado: float
    llf_usado: float
    justificacion: str
    tabla_referencia: str


@router.post("/iluminacion", response_model=IluminacionOutput)
async def endpoint_iluminacion(data: IluminacionInput):
    return calcular_iluminacion(
        largo=data.largo,
        ancho=data.ancho,
        lux_objetivo=data.lux_objetivo,
        lumens_lampara=data.lumens_lampara,
        cu=data.cu,
        llf=data.llf,
        potencia_lampara=data.potencia_lampara,
        tipo_area=data.tipo_area,
    )


# =============================================================================
# 5. COMPENSACIÓN DE REACTIVA
# =============================================================================

class ReactivaInput(BaseModel):
    potencia_kw: float = Field(..., gt=0, description="Potencia activa en kW")
    fp_actual: float = Field(..., gt=0, le=1, description="Factor de potencia actual")
    fp_objetivo: float = Field(0.95, gt=0, le=1, description="Factor de potencia deseado")
    tension: float = Field(208, gt=0, description="Tensión nominal en Voltios")
    frecuencia: float = Field(60, description="Frecuencia de la red: 50 o 60 Hz")
    costo_kwh: float = Field(800, gt=0, description="Costo del kWh en COP")


class ReactivaOutput(BaseModel):
    qc: float
    capacitancia: float
    s_antes: float
    s_despues: float
    ahorro_kva: float
    corriente_antes: float
    corriente_despues: float
    penalizacion: bool
    costo_penalizacion_mensual: float
    retorno_inversion_meses: float
    fp_cumple_retie: bool
    justificacion: str
    tabla_referencia: str


@router.post("/reactiva", response_model=ReactivaOutput)
async def endpoint_reactiva(data: ReactivaInput):
    return calcular_reactiva(
        potencia_kw=data.potencia_kw,
        fp_actual=data.fp_actual,
        fp_objetivo=data.fp_objetivo,
        tension=data.tension,
        frecuencia=data.frecuencia,
        costo_kwh=data.costo_kwh,
    )


# =============================================================================
# 6. PUESTA A TIERRA
# =============================================================================

class PuestaTierraInput(BaseModel):
    resistividad: float = Field(..., gt=0, description="Resistividad del suelo en Ω-m")
    longitud_electrodo: float = Field(2.4, gt=0, description="Longitud de la varilla en metros")
    diametro_electrodo: float = Field(0.0159, gt=0, description="Diámetro de la varilla en metros")
    tension: float = Field(208, gt=0, description="Tensión del sistema en Voltios")
    requerimiento: float = Field(25, gt=0, description="Resistencia máxima objetivo en Ω")


class PuestaTierraOutput(BaseModel):
    r_total: float
    r_single: float
    cumple: bool
    limite: float
    num_varillas: int
    separacion_varillas: float
    conductor_tierra: str
    seccion_conductor_mm2: float
    rho_usado: float
    estado: str
    sugerencia: str
    metodo_medicion: str
    justificacion: str
    tabla_referencia: str


@router.post("/puesta_tierra", response_model=PuestaTierraOutput)
async def endpoint_puesta_tierra(data: PuestaTierraInput):
    return calcular_puesta_tierra(
        resistividad=data.resistividad,
        longitud_electrodo=data.longitud_electrodo,
        diametro_electrodo=data.diametro_electrodo,
        tension=data.tension,
        requerimiento=data.requerimiento,
    )


# =============================================================================
# 7. POTENCIA RÁPIDA (AUXILIAR)
# =============================================================================

class PotenciaInput(BaseModel):
    tension: float = Field(..., gt=0, description="Tensión en Voltios")
    corriente: float = Field(..., gt=0, description="Corriente en Amperios")
    factor_potencia: float = Field(0.9, gt=0, le=1, description="Factor de potencia")
    sistema: str = Field("trifasico", description="trifasico o monofasico")


class PotenciaOutput(BaseModel):
    potencia_activa_w: float
    potencia_aparente_va: float
    potencia_reactiva_var: float
    corriente_fase: float
    tabla_referencia: str


@router.post("/potencia", response_model=PotenciaOutput)
async def endpoint_potencia(data: PotenciaInput):
    if data.sistema == "trifasico":
        aparente = math.sqrt(3) * data.tension * data.corriente
    else:
        aparente = data.tension * data.corriente

    activa = aparente * data.factor_potencia
    reactiva = math.sqrt(abs(aparente ** 2 - activa ** 2))

    return {
        "potencia_activa_w": round(activa, 2),
        "potencia_aparente_va": round(aparente, 2),
        "potencia_reactiva_var": round(reactiva, 2),
        "corriente_fase": round(data.corriente, 2),
        "tabla_referencia": "Leyes de circuitos de Corriente Alterna",
    }


# =============================================================================
# 8. SISTEMA FOTOVOLTAICO
# =============================================================================

class FotovoltaicoInput(BaseModel):
    consumo_kwh_mes: float = Field(..., gt=0, description="Consumo mensual de energía en kWh")
    departamento: str = Field(..., description="Departamento de Colombia para HSP")
    tipo_techo: str = Field(..., description="Tipo de techo: plano o inclinado")
    estrato: str = Field(..., description="Estrato: 1-2, 3, 4, 5-6, comercial")
    presupuesto_max: float = Field(None, description="Presupuesto máximo en COP (opcional)")


class FotovoltaicoOutput(BaseModel):
    hsp: float
    consumo_diario: float
    potencia_pico_kw: float
    num_paneles: int
    area_m2: float
    potencia_inversor_sugerida: float
    tipo_inversor: str
    costo_panel_total: float
    costo_inversor: float
    costo_estructura: float
    costo_mano_obra: float
    costo_tramites: float
    total_cop: float
    total_usd: float
    tarifa_aplicada: float
    generacion_estimada_kwh: float
    ahorro_mensual: float
    retorno_meses: float
    ahorro_25anios: float
    alerta_consumo: str | None = None
    alerta_retorno: str | None = None
    alerta_espacio: str | None = None
    alerta_presupuesto: str | None = None


@router.post("/fotovoltaico", response_model=FotovoltaicoOutput)
async def endpoint_fotovoltaico(data: FotovoltaicoInput):
    return calcular_sistema_fotovoltaico(
        consumo_kwh_mes=data.consumo_kwh_mes,
        departamento=data.departamento,
        tipo_techo=data.tipo_techo,
        estrato=data.estrato,
        presupuesto_max=data.presupuesto_max,
    )


@router.post("/fotovoltaico/analizar-factura")
async def analizar_factura(data: dict):
    image_base64 = data.get("image_base64", "")
    if not image_base64:
        return {"ok": False, "error": "Se requiere image_base64"}
    
    try:
        resp = requests.post(
            "http://148.230.90.171:8091/api/vision/cotizacion-solar",
            json={"image_base64": image_base64},
            timeout=120
        )
        result = resp.json()
        
        # Si Vision API devolvió error, propagarlo
        if not result.get("ok"):
            return {"ok": False, "error": result.get("error", "Vision API no pudo procesar la imagen")}
        
        # Extraer datos planos para el frontend
        parsed = result.get("parsed", {})
        factura = parsed.get("factura", {})
        
        return {
            "ok": True,
            "consumo_kwh": factura.get("consumo_kwh"),
            "consumo_kwh_mes": factura.get("consumo_kwh"),
            "estrato": factura.get("estrato"),
            "departamento": factura.get("direccion", ""),
            "direccion": factura.get("direccion", ""),
            "empresa": factura.get("empresa", ""),
            "costo_total": factura.get("costo_total"),
            "periodo": factura.get("periodo", ""),
            "factura": factura,
            "cotizacion": parsed.get("cotizacion", {}),
        }
    except Exception as e:
        return {"ok": False, "error": f"Error Vision API: {str(e)}"}


# =============================================================================
# 9. CUADRO DE CARGAS
# =============================================================================

class CargaItem(BaseModel):
    nombre: str = Field("Carga", description="Nombre de la carga")
    potencia_w: float = Field(..., gt=0, description="Potencia en Watts")
    factor_potencia: float = Field(0.9, gt=0, le=1, description="Factor de potencia")
    sistema: str = Field("tri", description="mono o tri")
    fase_a: bool = Field(True, description="Conectada a fase A")
    fase_b: bool = Field(False, description="Conectada a fase B")
    fase_c: bool = Field(False, description="Conectada a fase C")
    tipo_carga: str = Field("continua", description="continua, no_continua, iluminacion, receptaculos, motor, cocina")


class CuadroCargasInput(BaseModel):
    cargas: list[CargaItem] = Field(..., min_items=1, description="Lista de cargas del tablero")
    tension: float = Field(208, gt=0, description="Tensión línea-línea en Voltios")
    sistema: str = Field("trifasico", description="monofasico o trifasico")
    factor_diversidad: float | None = Field(None, ge=0, le=1, description="Factor de diversidad opcional")


@router.post("/cuadro-cargas")
async def endpoint_cuadro_cargas(data: CuadroCargasInput):
    cargas_list = [c.model_dump() for c in data.cargas]
    return calcular_cuadro_cargas(
        cargas=cargas_list,
        tension=data.tension,
        sistema=data.sistema,
        factor_diversidad=data.factor_diversidad,
    )


# =============================================================================
# 10. CAÍDA DE TENSIÓN AVANZADA
# =============================================================================

class TramoInput(BaseModel):
    longitud_m: float = Field(..., gt=0, description="Longitud del tramo en metros")
    corriente_a: float = Field(..., gt=0, description="Corriente en Amperios")
    calibre: str = Field("12 AWG", description="Calibre del conductor")
    material: str = Field("cu", description="cu (cobre) o al (aluminio)")


class CaidaTensionInput(BaseModel):
    tramos: list[TramoInput] = Field(..., min_items=1, description="Lista de tramos en serie")
    tension_nominal: float = Field(208, gt=0, description="Tensión nominal del sistema en Voltios")
    sistema: str = Field("trifasico", description="trifasico o monofasico")


@router.post("/caida-tension")
async def endpoint_caida_tension(data: CaidaTensionInput):
    tramos_list = [t.model_dump() for t in data.tramos]
    return calcular_caida_tension(
        tramos=tramos_list,
        tension_nominal=data.tension_nominal,
        sistema=data.sistema,
    )


# =============================================================================
# 11. CORTOCIRCUITO
# =============================================================================

class CortocircuitoInput(BaseModel):
    potencia_trafo_kva: float = Field(..., gt=0, description="Potencia del transformador en kVA")
    impedancia_z_pct: float = Field(..., gt=0, le=100, description="Impedancia Z del transformador en %")
    longitud_alimentador_m: float = Field(..., ge=0, description="Longitud del alimentador en metros")
    calibre_alimentador: str = Field("2 AWG", description="Calibre del alimentador")
    material: str = Field("cu", description="cu o al")
    sistema: str = Field("trifasico", description="trifasico o monofasico")
    tension: float = Field(208, gt=0, description="Tensión del sistema en Voltios")


@router.post("/cortocircuito")
async def endpoint_cortocircuito(data: CortocircuitoInput):
    return calcular_cortocircuito(
        potencia_trafo_kva=data.potencia_trafo_kva,
        impedancia_z_pct=data.impedancia_z_pct,
        longitud_alimentador_m=data.longitud_alimentador_m,
        calibre_alimentador=data.calibre_alimentador,
        material=data.material,
        sistema=data.sistema,
        tension=data.tension,
    )


# =============================================================================
# 12. TUBERÍAS Y CANALIZACIONES
# =============================================================================

class ConductorTuboInput(BaseModel):
    calibre: str = Field("12 AWG", description="Calibre del conductor")
    tipo_aislamiento: str = Field("THW", description="THW, THHN, etc")
    num_conductores: int = Field(1, ge=1, le=50, description="Número de conductores")


class TuberiasInput(BaseModel):
    conductores: list[ConductorTuboInput] = Field(..., min_items=1, description="Lista de conductores")
    tipo_tubo: str = Field("PVC", description="PVC, EMT, RMC")


@router.post("/tuberias")
async def endpoint_tuberias(data: TuberiasInput):
    conductores_list = [c.model_dump() for c in data.conductores]
    return calcular_tuberias(
        conductores=conductores_list,
        tipo_tubo=data.tipo_tubo,
    )


# =============================================================================
# 13. TRANSFORMADORES
# =============================================================================

class TransformadorInput(BaseModel):
    potencia_total_kw: float = Field(..., gt=0, description="Potencia activa total en kW")
    factor_potencia: float = Field(0.9, gt=0, le=1, description="Factor de potencia")
    tension_primaria: float = Field(13200, gt=0, description="Tensión primaria en Voltios")
    tension_secundaria: float = Field(208, gt=0, description="Tensión secundaria en Voltios")
    tipo: str = Field("seco", description="seco o liquido")
    sistema: str = Field("trifasico", description="trifasico o monofasico")


@router.post("/transformadores")
async def endpoint_transformadores(data: TransformadorInput):
    return calcular_transformador(
        potencia_total_kw=data.potencia_total_kw,
        factor_potencia=data.factor_potencia,
        tension_primaria=data.tension_primaria,
        tension_secundaria=data.tension_secundaria,
        tipo=data.tipo,
        sistema=data.sistema,
    )


# =============================================================================
# 14. PARARRAYOS
# =============================================================================

class PararrayosInput(BaseModel):
    tipo_estructura: str = Field("residencial", description="residencial, comercial, industrial, repetidores")
    altura_m: float = Field(..., gt=0, description="Altura de la estructura en metros")
    area_m2: float = Field(..., gt=0, description="Área de la estructura en m²")
    nivel_proteccion: str = Field("IV", description="Nivel de protección: I, II, III, IV")


@router.post("/pararrayos")
async def endpoint_pararrayos(data: PararrayosInput):
    return calcular_pararrayos(
        tipo_estructura=data.tipo_estructura,
        altura_m=data.altura_m,
        area_m2=data.area_m2,
        nivel_proteccion=data.nivel_proteccion,
    )


