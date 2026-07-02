import math
import unicodedata

# Horas Solar Pico (HSP) por departamento en Colombia
HSP_DEPARTAMENTOS = {
    "guajira": 6.0,
    "atlantico": 5.5,
    "bolivar": 5.3,
    "magdalena": 5.5,
    "santander": 5.0,
    "antioquia": 4.8,
    "cundinamarca": 4.5,
    "bogota": 4.2,
    "valle": 4.8,
    "risaralda": 4.5,
    "caldas": 4.5,
    "quindio": 4.5,
    "tolima": 4.8,
    "huila": 4.8,
    "meta": 5.0,
    "narino": 4.2,
    "cauca": 4.3,
    "boyaca": 4.5,
    "norte de santander": 5.0,
    "amazonas": 4.0,
    "choco": 3.8
}

INVERSORES = [1.5, 2.0, 3.0, 3.6, 5.0, 6.0, 8.0, 10.0, 15.0]

def _normalizar_texto(texto: str) -> str:
    """Normaliza el texto quitando acentos y convirtiendo a minúsculas."""
    if not texto:
        return ""
    texto = texto.lower().strip()
    # Eliminar acentos
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto)
                  if unicodedata.category(c) != 'Mn')
    return texto

def calcular_sistema_fotovoltaico(
    consumo_kwh_mes: float,
    departamento: str,
    tipo_techo: str,
    estrato: str,
    presupuesto_max: float = None
) -> dict:
    """
    Realiza el dimensionamiento y cálculo financiero de un sistema solar fotovoltaico para Colombia.
    """
    # 1. Obtener HSP
    dep_norm = _normalizar_texto(departamento)
    hsp = HSP_DEPARTAMENTOS.get(dep_norm, 4.5)  # 4.5 HSP por defecto (promedio nacional)

    # 2. Cálculos de potencia y paneles iniciales
    consumo_diario = consumo_kwh_mes / 30.0
    # Eficiencia global del sistema asumida: 75% (pérdidas por temperatura, cableado, inversor)
    potencia_pico_kw = consumo_diario / (hsp * 0.75)
    
    # Cada panel es de 450W (0.45 kW)
    num_paneles = math.ceil(potencia_pico_kw / 0.45)
    
    alerta_espacio = None
    alerta_presupuesto = None

    # 3. Validación de límite de espacio en techo
    # Área por panel: 2.2 m²
    max_area = 20.0 if _normalizar_texto(tipo_techo) == "plano" else 35.0
    area_requerida_inicial = num_paneles * 2.2

    if area_requerida_inicial > max_area:
        num_paneles_max = math.floor(max_area / 2.2)
        alerta_espacio = (
            f"El número de paneles se redujo de {num_paneles} a {num_paneles_max} "
            f"debido a la limitación de área del techo ({max_area} m²)."
        )
        num_paneles = num_paneles_max

    # 4. Validación de presupuesto máximo (Iterar hacia abajo si excede)
    if presupuesto_max is not None and presupuesto_max > 0:
        while num_paneles > 0:
            # Calcular inversor para este número de paneles
            pico_actual = num_paneles * 0.45
            inversor_req = pico_actual * 1.2
            
            # Buscar inversor
            inv_sug = 15.0
            for inv in INVERSORES:
                if inv >= inversor_req:
                    inv_sug = inv
                    break
            
            # Calcular costos
            costo_paneles = num_paneles * 850000
            costo_inversor = inv_sug * 1800000
            costo_estructura = num_paneles * 180000
            costo_mano_obra = num_paneles * 250000
            costo_tramites = 1200000
            
            costo_total = costo_paneles + costo_inversor + costo_estructura + costo_mano_obra + costo_tramites
            
            if costo_total <= presupuesto_max:
                break
                
            num_paneles -= 1
            
        # Si se redujo por presupuesto
        area_req_temp = (num_paneles + 1) * 2.2
        if area_req_temp <= max_area and presupuesto_max is not None:
            alerta_presupuesto = (
                f"El número de paneles se limitó a {num_paneles} para no "
                f"exceder el presupuesto máximo de ${presupuesto_max:,.0f} COP."
            )

    # 5. Recalcular parámetros finales basados en el número de paneles definitivo
    potencia_pico_final_kw = num_paneles * 0.45
    area_final_m2 = num_paneles * 2.2
    
    # Inversor sugerido
    potencia_inversor_calc = potencia_pico_final_kw * 1.2
    potencia_inversor_sugerida = 0.0
    tipo_inversor = "ninguno"
    
    if num_paneles > 0:
        potencia_inversor_sugerida = 15.0
        for inv in INVERSORES:
            if inv >= potencia_inversor_calc:
                potencia_inversor_sugerida = inv
                break
        tipo_inversor = "microinversor" if num_paneles <= 8 else "string"

    # 6. Costos finales COP y USD
    costo_paneles = num_paneles * 850000
    costo_inversor = potencia_inversor_sugerida * 1800000
    costo_estructura = num_paneles * 180000
    costo_mano_obra = num_paneles * 250000
    costo_tramites = 1200000 if num_paneles > 0 else 0
    
    total_cop = costo_paneles + costo_inversor + costo_estructura + costo_mano_obra + costo_tramites
    total_usd = total_cop / 4200.0

    # 7. Tarifa y Ahorro Financiero
    # estrato: "1-2", "3", "4", "5-6", "comercial"
    estrato_clean = _normalizar_texto(str(estrato))
    if estrato_clean in ["1", "2", "1-2", "estrato 1", "estrato 2"]:
        tarifa = 250.0
    elif estrato_clean in ["3", "estrato 3"]:
        tarifa = 450.0
    elif estrato_clean in ["4", "estrato 4"]:
        tarifa = 650.0
    elif estrato_clean in ["5", "6", "5-6", "estrato 5", "estrato 6"]:
        tarifa = 800.0
    elif "comercial" in estrato_clean or "industrial" in estrato_clean:
        tarifa = 700.0
    else:
        tarifa = 700.0  # Default promedio / comercial

    # Generación mensual estimada basada en HSP real del departamento
    # Generación mensual = kWp * HSP * 30 días * 0.75 eficiencia
    generacion_estimada_kwh = potencia_pico_final_kw * hsp * 30.0 * 0.75
    
    # Ahorro mensual (limitado al consumo del cliente)
    energia_compensada_kwh = min(generacion_estimada_kwh, consumo_kwh_mes)
    ahorro_mensual = energia_compensada_kwh * tarifa * 0.85  # 85% de ahorro efectivo por cobros fijos/distribución
    
    retorno_meses = 999.0
    if ahorro_mensual > 0:
        retorno_meses = total_cop / ahorro_mensual
        
    ahorro_25anios = (ahorro_mensual * 12.0 * 25.0) - total_cop

    # 8. Warnings de viabilidad
    alerta_consumo = None
    alerta_retorno = None
    
    if consumo_kwh_mes < 50.0:
        alerta_consumo = "Consumo mensual muy bajo para justificar sistema solar (menor a 50 kWh)."
        
    if retorno_meses > 120.0:
        alerta_retorno = "El tiempo de retorno de inversión supera los 10 años (120 meses)."

    return {
        "hsp": hsp,
        "consumo_diario": round(consumo_diario, 2),
        "potencia_pico_kw": round(potencia_pico_final_kw, 2),
        "num_paneles": num_paneles,
        "area_m2": round(area_final_m2, 2),
        "potencia_inversor_sugerida": potencia_inversor_sugerida,
        "tipo_inversor": tipo_inversor,
        "costo_panel_total": costo_paneles,
        "costo_inversor": costo_inversor,
        "costo_estructura": costo_estructura,
        "costo_mano_obra": costo_mano_obra,
        "costo_tramites": costo_tramites,
        "total_cop": total_cop,
        "total_usd": round(total_usd, 2),
        "tarifa_aplicada": tarifa,
        "generacion_estimada_kwh": round(generacion_estimada_kwh, 2),
        "ahorro_mensual": round(ahorro_mensual, 2),
        "retorno_meses": round(retorno_meses, 1),
        "ahorro_25anios": round(ahorro_25anios, 2),
        "alerta_consumo": alerta_consumo,
        "alerta_retorno": alerta_retorno,
        "alerta_espacio": alerta_espacio,
        "alerta_presupuesto": alerta_presupuesto
    }
