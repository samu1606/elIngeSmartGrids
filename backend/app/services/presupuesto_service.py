"""
Servicio de presupuestos eléctricos — El Inge Smart Grids.

Soporta modos de facturación:
- por_unidad: precio fijo por unidad
- por_salida: precio por punto/salida (tomacorrientes, luminarias)
- por_ml: precio por metro lineal (cableado, canalización)
- por_salida_con_ml: precio combinado por salida + metros de cable por salida
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class PricingMode(str, Enum):
    por_unidad = "por_unidad"
    por_salida = "por_salida"
    por_ml = "por_ml"
    por_salida_con_ml = "por_salida_con_ml"  # Salida + metros asociados


class ItemCategory(str, Enum):
    tablero = "tablero"
    breaker = "breaker"
    cableado = "cableado"
    canalizacion = "canalizacion"
    tomacorriente = "tomacorriente"
    iluminacion = "iluminacion"
    mano_obra = "mano_obra"
    diseno = "diseno"
    inspeccion = "inspeccion"
    otro = "otro"


# =============================================================================
# CATÁLOGO DE REFERENCIA — Precios sugeridos en COP (Colombia 2026)
# =============================================================================

PRECIOS_REFERENCIA_COP = {
    # Tableros
    "tablero_trifasico_30ctos": {
        "descripcion": "Tablero trifásico 30 circuitos con espacio para totalizador, barras 200A, IP65",
        "categoria": ItemCategory.tablero,
        "precio_unidad": 850_000,
        "incluye_instalacion": False,
    },
    "tablero_monofasico_12ctos": {
        "descripcion": "Tablero monofásico 12 circuitos, barras 125A, IP40",
        "categoria": ItemCategory.tablero,
        "precio_unidad": 280_000,
        "incluye_instalacion": False,
    },
    "totalizador_200A": {
        "descripcion": "Totalizador 3P 200A, caja moldeada, 25kA",
        "categoria": ItemCategory.breaker,
        "precio_unidad": 450_000,
        "incluye_instalacion": False,
    },

    # Breakers
    "breaker_1p_20a": {
        "descripcion": "Breaker enchufable 1P 20A, 10kA, riel DIN",
        "categoria": ItemCategory.breaker,
        "precio_unidad": 25_000,
    },
    "breaker_2p_40a": {
        "descripcion": "Breaker enchufable 2P 40A, 10kA, riel DIN",
        "categoria": ItemCategory.breaker,
        "precio_unidad": 52_000,
    },
    "breaker_3p_100a": {
        "descripcion": "Breaker enchufable 3P 100A, 10kA, riel DIN",
        "categoria": ItemCategory.breaker,
        "precio_unidad": 145_000,
    },

    # Cableado (precio por metro lineal)
    "cable_thhn_12_awg_cu": {
        "descripcion": "Cable THHN 12 AWG cobre, 600V, color negro/blanco/verde",
        "categoria": ItemCategory.cableado,
        "precio_ml": 3_500,
        "metros_por_salida_default": 7,
    },
    "cable_thhn_10_awg_cu": {
        "descripcion": "Cable THHN 10 AWG cobre, 600V",
        "categoria": ItemCategory.cableado,
        "precio_ml": 5_200,
        "metros_por_salida_default": 7,
    },
    "cable_thhn_8_awg_cu": {
        "descripcion": "Cable THHN 8 AWG cobre, 600V",
        "categoria": ItemCategory.cableado,
        "precio_ml": 8_400,
        "metros_por_salida_default": 10,
    },

    # Canalización (precio por metro lineal)
    "tuberia_pvc_1_2": {
        "descripcion": "Tubo PVC conduit 1/2\", tramo 3m",
        "categoria": ItemCategory.canalizacion,
        "precio_ml": 2_800,
    },
    "tuberia_pvc_3_4": {
        "descripcion": "Tubo PVC conduit 3/4\", tramo 3m",
        "categoria": ItemCategory.canalizacion,
        "precio_ml": 3_600,
    },
    "tuberia_pvc_1": {
        "descripcion": "Tubo PVC conduit 1\", tramo 3m",
        "categoria": ItemCategory.canalizacion,
        "precio_ml": 5_100,
    },

    # Tomacorrientes
    "toma_doble_polo_tierra": {
        "descripcion": "Tomacorriente doble polo a tierra 15A 125V, placa incluida",
        "categoria": ItemCategory.tomacorriente,
        "precio_unidad": 18_000,
    },
    "toma_gfci": {
        "descripcion": "Tomacorriente GFCI 15A 125V, protección falla a tierra",
        "categoria": ItemCategory.tomacorriente,
        "precio_unidad": 65_000,
    },

    # Iluminación
    "lampara_led_18w": {
        "descripcion": "Luminaria LED 18W 120V, 1800lm, luz blanca 4000K, sobreponer",
        "categoria": ItemCategory.iluminacion,
        "precio_unidad": 35_000,
    },
    "lampara_led_40w": {
        "descripcion": "Panel LED 40W 120V, 4000lm, empotrable, 60×60cm",
        "categoria": ItemCategory.iluminacion,
        "precio_unidad": 85_000,
    },
    "interruptor_sencillo": {
        "descripcion": "Interruptor sencillo 15A, placa incluida",
        "categoria": ItemCategory.iluminacion,
        "precio_unidad": 12_000,
    },
    "interruptor_conmutador": {
        "descripcion": "Interruptor conmutador 3 vías 15A, placa incluida",
        "categoria": ItemCategory.iluminacion,
        "precio_unidad": 18_500,
    },

    # Mano de obra
    "mo_instalacion_tablero": {
        "descripcion": "Mano de obra — Instalación de tablero (incluye montaje, conexión de barras y marcación)",
        "categoria": ItemCategory.mano_obra,
        "precio_unidad": 350_000,
    },
    "mo_instalacion_breaker": {
        "descripcion": "Mano de obra — Instalación de breaker (incluye conexión y prueba)",
        "categoria": ItemCategory.mano_obra,
        "precio_unidad": 15_000,
    },
    "mo_toma_sencilla": {
        "descripcion": "Mano de obra — Instalación de tomacorriente (por salida)",
        "categoria": ItemCategory.mano_obra,
        "precio_por_salida": 35_000,
        "metros_por_salida_default": 7,
    },
    "mo_punto_luz": {
        "descripcion": "Mano de obra — Instalación de punto de luz (por salida, incluye interruptor)",
        "categoria": ItemCategory.mano_obra,
        "precio_por_salida": 45_000,
        "metros_por_salida_default": 7,
    },
    "mo_cableado_por_ml": {
        "descripcion": "Mano de obra — Tendido y entubado de cable (por metro lineal)",
        "categoria": ItemCategory.mano_obra,
        "precio_ml": 2_500,
    },

    # Diseño
    "diseno_electrico_basico": {
        "descripcion": "Diseño eléctrico — Planos, memoria de cálculo NTC 2050 y diagrama unifilar",
        "categoria": ItemCategory.diseno,
        "precio_unidad": 450_000,
    },
    "diseno_revision_retie": {
        "descripcion": "Revisión y justificación RETIE — Dictamen de cumplimiento",
        "categoria": ItemCategory.diseno,
        "precio_unidad": 600_000,
    },

    # Inspección
    "inspeccion_retie": {
        "descripcion": "Inspección RETIE — Visita técnica, mediciones y certificado",
        "categoria": ItemCategory.inspeccion,
        "precio_unidad": 380_000,
    },
}

# =============================================================================
# CONFIGURACIONES DE METROS POR TIPO DE SALIDA
# =============================================================================

OPCIONES_METROS_POR_SALIDA = [5, 6, 7, 8, 9, 10, 11]
METROS_DEFAULT_POR_SALIDA = 7


# =============================================================================
# MODELOS Pydantic
# =============================================================================

class BudgetItemInput(BaseModel):
    """Ítem individual del presupuesto enviado por el frontend."""
    category: ItemCategory = ItemCategory.otro
    description: str = Field(..., description="Descripción del ítem")
    pricing_mode: PricingMode = PricingMode.por_unidad
    quantity: float = Field(..., gt=0, description="Cantidad")
    unit: str = Field("unidad", description="Unidad de medida (unidad, salida, ml, m², global)")
    unit_price: float = Field(0, gt=0, description="Precio unitario en COP")
    metros_por_salida: Optional[float] = Field(None, description="Metros de cable por salida (solo para modo por_salida_con_ml o por_ml)")
    discount_pct: float = Field(0, ge=0, le=100, description="Descuento porcentual aplicado al ítem")
    notes: Optional[str] = Field(None, description="Notas adicionales")

    @field_validator("metros_por_salida")
    @classmethod
    def validar_metros_por_salida(cls, v):
        if v is not None and v not in OPCIONES_METROS_POR_SALIDA:
            raise ValueError(f"Metros por salida debe ser: {OPCIONES_METROS_POR_SALIDA}")
        return v


class BudgetItemOutput(BaseModel):
    """Ítem calculado con totales."""
    id: str
    category: str
    description: str
    pricing_mode: str
    quantity: float
    unit: str
    unit_price: float
    metros_por_salida: Optional[float] = None
    subtotal: float  # quantity × unit_price (× metros_por_salida si aplica)
    discount_pct: float = 0
    discount_amount: float = 0
    total: float  # subtotal - discount
    notes: Optional[str] = None


class PresupuestoCompletoInput(BaseModel):
    """Presupuesto completo enviado desde el frontend."""
    number: str = Field(..., description="Número de presupuesto, ej. PRE-006")
    client_name: str = Field(..., description="Nombre del cliente")
    client_nit: Optional[str] = Field(None, description="NIT/CC del cliente")
    client_address: Optional[str] = Field(None, description="Dirección del cliente")
    client_phone: Optional[str] = Field(None, description="Teléfono del cliente")
    client_email: Optional[str] = Field(None, description="Email del cliente")
    project_name: str = Field(..., description="Nombre del proyecto")
    project_address: Optional[str] = Field(None, description="Dirección del proyecto")
    issue_date: str = Field(..., description="Fecha de emisión (YYYY-MM-DD)")
    valid_until: str = Field(..., description="Válido hasta (YYYY-MM-DD)")
    items: list[BudgetItemInput] = Field(..., min_length=1, description="Ítems del presupuesto")
    notas_legales: Optional[str] = Field(
        "Precios en pesos colombianos (COP). "
        "Válido por 30 días calendario. "
        "No incluye IVA. "
        "Forma de pago: 50% anticipo, 50% contra entrega. "
        "El instalador certificado cumple con RETIE Res. 40117/2024. "
        "Esta cotización se rige por la NTC 2050 y el RETIE vigente."
    )
    iva_pct: float = Field(0, ge=0, le=19, description="Porcentaje de IVA (0-19%)")
    retencion_pct: float = Field(0, ge=0, le=10, description="Porcentaje de retención en la fuente")


class PresupuestoCompletoOutput(BaseModel):
    """Presupuesto completo con cálculos y totales."""
    number: str
    client_name: str
    client_nit: Optional[str] = None
    client_address: Optional[str] = None
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    project_name: str
    project_address: Optional[str] = None
    issue_date: str
    valid_until: str
    items: list[BudgetItemOutput]
    subtotal_general: float  # Suma de todos los items.total
    iva_pct: float
    iva_amount: float
    retencion_pct: float
    retencion_amount: float
    total_final: float  # subtotal + IVA - retención
    notas_legales: str


# =============================================================================
# SERVICIO PRINCIPAL
# =============================================================================

def calcular_item(item: BudgetItemInput, idx: int) -> BudgetItemOutput:
    """
    Calcula los totales de un ítem según su modo de facturación.

    Modos soportados:
    - por_unidad: subtotal = quantity × unit_price
    - por_salida: subtotal = quantity × unit_price
    - por_ml: subtotal = quantity × metros_por_salida × unit_price
    - por_salida_con_ml: subtotal = quantity × (unit_price + metros_por_salida × precio_ml_adicional)
    """
    pricing = item.pricing_mode
    qty = item.quantity
    price = item.unit_price
    mts = item.metros_por_salida or METROS_DEFAULT_POR_SALIDA

    if pricing == PricingMode.por_ml:
        # Precio por metro lineal: cantidad_total_metros × precio_por_metro
        # quantity = número de salidas, metros_por_salida = metros por cada salida
        total_metros = qty * mts
        subtotal = total_metros * price
    elif pricing == PricingMode.por_salida_con_ml:
        # Precio por salida + cableado asociado
        # unit_price = precio de la salida, y los metros se calculan aparte con precio_ml
        # En este modo, el precio del cable viene en otro ítem separado (por_ml)
        subtotal = qty * price
    elif pricing == PricingMode.por_salida:
        # Precio fijo por punto/salida
        subtotal = qty * price
    else:
        # por_unidad
        subtotal = qty * price

    # Aplicar descuento
    discount_amount = subtotal * (item.discount_pct / 100)
    total = subtotal - discount_amount

    return BudgetItemOutput(
        id=f"item-{idx+1:03d}",
        category=item.category.value,
        description=item.description,
        pricing_mode=item.pricing_mode.value,
        quantity=qty,
        unit=item.unit,
        unit_price=price,
        metros_por_salida=mts if pricing in (PricingMode.por_ml, PricingMode.por_salida_con_ml) else None,
        subtotal=round(subtotal, 2),
        discount_pct=item.discount_pct,
        discount_amount=round(discount_amount, 2),
        total=round(total, 2),
        notes=item.notes,
    )


def calcular_presupuesto_completo(data: PresupuestoCompletoInput) -> PresupuestoCompletoOutput:
    """Procesa el presupuesto completo con todos los cálculos."""
    items_calculados = []
    for i, item in enumerate(data.items):
        item_out = calcular_item(item, i)
        items_calculados.append(item_out)

    subtotal_general = sum(item.total for item in items_calculados)
    iva_amount = subtotal_general * (data.iva_pct / 100)
    retencion_amount = subtotal_general * (data.retencion_pct / 100)
    total_final = subtotal_general + iva_amount - retencion_amount

    return PresupuestoCompletoOutput(
        number=data.number,
        client_name=data.client_name,
        client_nit=data.client_nit,
        client_address=data.client_address,
        client_phone=data.client_phone,
        client_email=data.client_email,
        project_name=data.project_name,
        project_address=data.project_address,
        issue_date=data.issue_date,
        valid_until=data.valid_until,
        items=items_calculados,
        subtotal_general=round(subtotal_general, 2),
        iva_pct=data.iva_pct,
        iva_amount=round(iva_amount, 2),
        retencion_pct=data.retencion_pct,
        retencion_amount=round(retencion_amount, 2),
        total_final=round(total_final, 2),
        notas_legales=data.notas_legales or "",
    )
