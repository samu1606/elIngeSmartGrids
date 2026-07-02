# Prompts para Antigravity — Módulo Fotovoltaico
# Proyecto: El_Inge_Smart_Grids (samu1606/El_Inge_Smart_Grids)
# Stack: Next.js 16 + FastAPI + Supabase + Docker
# Ejecutar en orden: 1 → 2 → 3

---

## PROMPT 1 — Backend + Frontend: Módulo Fotovoltaico Completo

TRABAJANDO en el proyecto El_Inge_Smart_Grids (Next.js 16 + FastAPI + Supabase + Docker).
NO crear proyecto nuevo. AGREGAR un módulo al proyecto existente.

### PARTE A: Backend — Nuevo cálculo fotovoltaico

**1. Crear `backend/app/services/calculo_fotovoltaico.py`:**

```python
"""
Servicio de diseño fotovoltaico para El Inge Smart Grids.
Calcula número de paneles, inversor, costos y retorno de inversión.
Basado en HSP (Horas Sol Pico) por departamento de Colombia.
"""
import math

HSP_POR_DEPARTAMENTO = {
    "Guajira": 6.0, "Atlántico": 5.5, "Bolívar": 5.3, "Magdalena": 5.5,
    "Santander": 5.0, "Antioquia": 4.8, "Cundinamarca": 4.5, "Bogotá": 4.2,
    "Valle": 4.8, "Risaralda": 4.5, "Caldas": 4.5, "Quindío": 4.5,
    "Tolima": 4.8, "Huila": 4.8, "Meta": 5.0, "Nariño": 4.2,
    "Cauca": 4.3, "Boyacá": 4.5, "Norte de Santander": 5.0,
    "Amazonas": 4.0, "Chocó": 3.8,
}

INVERSORES = [1.5, 2.0, 3.0, 3.6, 5.0, 6.0, 8.0, 10.0, 15.0]

TARIFA_POR_ESTRATO = {1: 250, 2: 250, 3: 450, 4: 650, 5: 800, 6: 800, 0: 700}


def calcular_sistema_fotovoltaico(
    consumo_kwh_mes: float,
    departamento: str,
    tipo_techo: str = "inclinado",
    estrato: int = 3,
    presupuesto_max: float = None,
) -> dict:
    hsp = HSP_POR_DEPARTAMENTO.get(departamento, 4.5)
    
    # Dimensionamiento
    consumo_diario = consumo_kwh_mes / 30
    potencia_pico_kw = consumo_diario / (hsp * 0.75)
    num_paneles = math.ceil(potencia_pico_kw / 0.45)
    area_requerida = num_paneles * 2.2
    
    # Validar área disponible
    area_max = 35 if tipo_techo == "inclinado" else 20
    area_ok = area_requerida <= area_max
    if not area_ok:
        num_paneles_ajustado = int(area_max / 2.2)
        num_paneles = min(num_paneles, num_paneles_ajustado)
        potencia_pico_kw = num_paneles * 0.45
    
    # Inversor
    potencia_inversor_kw = potencia_pico_kw * 1.2
    inversor_seleccionado = next((i for i in INVERSORES if i >= potencia_inversor_kw), INVERSORES[-1])
    tipo_inversor = "microinversor" if num_paneles <= 8 else "string"
    
    # Costos (COP 2026)
    costo_paneles = num_paneles * 850000
    costo_inversor = inversor_seleccionado * 1800000
    costo_estructura = num_paneles * 180000
    costo_mano_obra = num_paneles * 250000
    costo_tramites = 1200000
    costo_total = costo_paneles + costo_inversor + costo_estructura + costo_mano_obra + costo_tramites
    
    # Ajustar por presupuesto
    if presupuesto_max and costo_total > presupuesto_max:
        factor = presupuesto_max / costo_total
        num_paneles = max(1, int(num_paneles * factor))
        potencia_pico_kw = num_paneles * 0.45
        # Recalcular costos
        costo_paneles = num_paneles * 850000
        costo_inversor = inversor_seleccionado * 1800000
        costo_estructura = num_paneles * 180000
        costo_mano_obra = num_paneles * 250000
        costo_total = costo_paneles + costo_inversor + costo_estructura + costo_mano_obra + costo_tramites
    
    # Financiero
    tarifa = TARIFA_POR_ESTRATO.get(estrato, 450)
    ahorro_mensual = consumo_kwh_mes * tarifa * 0.85
    retorno_meses = round(costo_total / ahorro_mensual, 1) if ahorro_mensual > 0 else 999
    ahorro_25anios = ahorro_mensual * 12 * 25 - costo_total
    
    # Advertencias
    warnings = []
    if consumo_kwh_mes < 50:
        warnings.append("⚠️ Consumo muy bajo. La inversión solar puede no ser rentable con este nivel de consumo.")
    if retorno_meses > 120:
        warnings.append("⚠️ Retorno de inversión superior a 10 años. Evalúa opciones de financiación.")
    if not area_ok:
        warnings.append(f"⚠️ Área insuficiente. Se ajustó a {num_paneles} paneles (máx {area_max}m²).")
    
    return {
        "ok": True,
        "datos_solares": {
            "departamento": departamento,
            "hsp": hsp,
            "consumo_diario_kwh": round(consumo_diario, 2),
        },
        "sistema": {
            "num_paneles": num_paneles,
            "potencia_total_kw": round(potencia_pico_kw, 2),
            "area_requerida_m2": round(area_requerida, 1),
            "tipo_techo": tipo_techo,
            "area_disponible_m2": area_max,
            "area_suficiente": area_ok,
        },
        "inversor": {
            "potencia_kw": inversor_seleccionado,
            "tipo": tipo_inversor,
        },
        "costos": {
            "paneles": costo_paneles,
            "inversor": costo_inversor,
            "estructura": costo_estructura,
            "mano_obra": costo_mano_obra,
            "tramites": costo_tramites,
            "total_cop": costo_total,
            "total_usd": round(costo_total / 4200, 0),
        },
        "financiero": {
            "tarifa_kwh": tarifa,
            "ahorro_mensual": round(ahorro_mensual, 0),
            "retorno_meses": retorno_meses,
            "ahorro_25anios": round(ahorro_25anios, 0),
        },
        "warnings": warnings,
    }
```

**2. Crear `backend/app/routers/fotovoltaico.py`:**

```python
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..services.calculo_fotovoltaico import calcular_sistema_fotovoltaico

router = APIRouter(prefix="/fotovoltaico", tags=["fotovoltaico"])

class SolicitudFotovoltaico(BaseModel):
    consumo_kwh_mes: float
    departamento: str
    tipo_techo: str = "inclinado"
    estrato: int = 3
    presupuesto_max: Optional[float] = None

@router.post("/calcular")
async def calcular(data: SolicitudFotovoltaico):
    return calcular_sistema_fotovoltaico(
        consumo_kwh_mes=data.consumo_kwh_mes,
        departamento=data.departamento,
        tipo_techo=data.tipo_techo,
        estrato=data.estrato,
        presupuesto_max=data.presupuesto_max,
    )
```

**3. En `backend/app/main.py`, modificar imports y routers:**

AGREGAR en los imports:
```python
from app.routers import calculos, health, presupuestos, retie, fotovoltaico
```

AGREGAR el router (donde están los otros app.include_router):
```python
app.include_router(fotovoltaico.router, prefix="/api/fotovoltaico", tags=["Fotovoltaico"])
```

MANTENER todos los imports y routers existentes sin tocar.

---

### PARTE B: Frontend — Página /dashboard/fotovoltaico

**1. Sidebar — AGREGAR item en `frontend/src/components/dashboard/Sidebar.tsx`:**

En el array de items (aprox línea 49), después de "DISEÑO RETIE 2024":
```tsx
{ label: "Fotovoltaico", href: "/dashboard/fotovoltaico", icon: Sun },
```

Agregar el import de Sun de lucide-react si no existe:
```tsx
import { Sun, ... } from "lucide-react";
```

**2. Crear `frontend/src/app/(dashboard)/dashboard/fotovoltaico/page.tsx`:**

Crear una página "use client" con:
- Título "☀️ Diseño Fotovoltaico" y descripción "Calcula tu sistema solar ideal basado en tu consumo"
- Formulario con:
  - Consumo mensual (kWh) — input numérico, placeholder "Ej: 166"
  - Departamento — select con TODOS los 32 departamentos de Colombia
  - Tipo de techo — 2 botones toggle: "Inclinado" (Home) / "Plano" (Building)
  - Estrato — select (1 al 6 + Comercial)
  - Presupuesto máximo — input numérico opcional en COP
- Botón "Calcular Sistema" con gradiente de ámbar a naranja y animación hover
- Zona de resultados con 3 tarjetas (usar el mismo estilo de tarjetas que clientes/page.tsx):
  - ☀️ SISTEMA: ícono grande de panel, # paneles, potencia kW, área m²
  - 💰 INVERSIÓN: costo total COP y USD, desglose de costos, barra de presupuesto
  - 📈 RETORNO: ahorro mensual, meses ROI, ahorro a 25 años
- Si hay warnings, mostrarlos en tarjetas amarillas con ícono AlertTriangle
- Loading state con skeleton cards mientras hace fetch
- Colores: primary = "#F59E0B" (ámbar/naranja solar), usar className="text-primary" con variables CSS del proyecto
- Responsive: columna en mobile, 2 columnas en desktop (formulario izquierda, resultados derecha)
- Llamar a: `POST /api/fotovoltaico/calcular` usando la variable de entorno NEXT_PUBLIC_API_URL
- Manejar errores con toast o alert básico

IMPORTANTE: 
- Usa EXACTAMENTE los mismos componentes y estilos que el resto del dashboard. 
- Mira calculadora/page.tsx y clientes/page.tsx como referencia.
- El layout del dashboard ya está listo (sidebar + header), solo creá el contenido de la página.
- NO modificar layout.tsx ni otros archivos del dashboard.
```

---

## PROMPT 2 — Integración: Factura de Energía → Cotización Automática

AGREGAR a la página /dashboard/fotovoltaico la capacidad de subir una foto de factura
y autocompletar el formulario.

### Frontend:

Arriba del formulario de diseño fotovoltaico, agregar una zona drag & drop:
- Área con borde punteado, ícono UploadCloud de lucide-react
- Texto: "📸 Subí tu factura de energía y autocompletamos los datos"
- Formatos: JPG, PNG (máx 10MB)
- Al soltar archivo: mostrar preview miniatura
- Botón "Analizar Factura" (ámbar)

Al hacer clic:
1. Convertir imagen a base64 con FileReader
2. Llamar a `POST /api/fotovoltaico/analizar-factura` enviando `{ image_base64 }`
3. Mostrar skeleton "🔍 Analizando factura con IA..."
4. Al recibir respuesta:
   - Autocompletar consumo_kwh, departamento (mapear dirección), estrato
   - Mostrar datos extraídos en un badge verde "✅ Factura analizada"
   - Auto-ejecutar el cálculo del sistema
5. Si falla: mostrar error "No se pudo leer la factura. Intentá con otra foto más clara."

### Backend:

Agregar endpoint en `backend/app/routers/fotovoltaico.py`:

```python
import base64, requests

@router.post("/analizar-factura")
async def analizar_factura(data: dict):
    image_base64 = data.get("image_base64", "")
    if not image_base64:
        return {"ok": False, "error": "image_base64 requerido"}
    
    # Llamar a Vision API (nuestro microservicio en el VPS)
    try:
        resp = requests.post(
            "http://vision-api:5000/api/vision/cotizacion-solar",
            json={"image_base64": image_base64},
            timeout=120
        )
        return resp.json()
    except Exception as e:
        return {"ok": False, "error": f"Error conectando con Vision API: {str(e)}"}
```

IMPORTANTE: El servicio vision-api ya existe en el VPS en el puerto 8091. 
En docker-compose.yml, agregar un alias de red para que el backend pueda llamarlo como "vision-api".
O usar la IP: http://148.230.90.171:8091
```

---

## PROMPT 3 — Mejoras Visuales y UX

MEJORAR la experiencia del módulo fotovoltaico:

1. **Gráfico de retorno**: En la tarjeta de RETORNO, agregar un mini gráfico de barras simple (sin librerías, solo divs con altura proporcional) que muestre:
   - Inversión inicial (barra roja hacia abajo)
   - Ahorro acumulado a 5, 10, 25 años (barras verdes hacia arriba)

2. **Indicador de viabilidad**: Badge de color en el sistema:
   - 🟢 "ALTAMENTE VIABLE" si retorno < 36 meses
   - 🟡 "VIABLE" si retorno 36-72 meses  
   - 🟠 "EVALUAR" si retorno 72-120 meses
   - 🔴 "NO RECOMENDADO" si retorno > 120 meses

3. **Recomendación de baterías** (opcional):
   - Checkbox "¿Incluir baterías?" en el formulario
   - Si se marca: agregar batería de litio (10kWh = $8,000,000 COP)
   - Recalcular: cobertura sube a 95%, añadir al costo total

4. **Botón "Guardar Proyecto"**:
   - Al calcular, mostrar botón "Guardar como Proyecto"
   - Llama al endpoint de proyectos existente con los datos del sistema
   - Feedback: toast "✅ Proyecto solar guardado"

5. **Animaciones**:
   - Los números de resultados hacen count-up animation (usar useEffect + setInterval)
   - Las tarjetas aparecen con fade-in + slide-up stagger
