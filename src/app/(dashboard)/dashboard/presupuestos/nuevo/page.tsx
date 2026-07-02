"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getApiUrl } from "@/lib/api";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calculator,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Building2,
  Package,
  ChevronRight,
  Wrench,
} from "lucide-react";

// =============================================================================
// TIPOS
// =============================================================================

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  pricing_mode: "por_salida" | "por_ml";
  quantity: number;
  unit: string;
  unit_price: number;
  metros_por_salida: number | null;
  subtotal: number;
  discount_pct: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  // APU — Análisis de Precios Unitarios
  apu_materiales: number;
  apu_mano_obra: number;
  apu_equipo: number;
  apu_transporte: number;
  apu_indirectos: number;
  apu_expanded: boolean;
}

interface CalculatedBudget {
  number: string;
  client_name: string;
  client_nit: string | null;
  client_address: string | null;
  client_phone: string | null;
  client_email: string | null;
  project_name: string;
  project_address: string | null;
  issue_date: string;
  valid_until: string;
  items: BudgetItem[];
  subtotal_general: number;
  iva_pct: number;
  iva_amount: number;
  retencion_pct: number;
  retencion_amount: number;
  total_final: number;
  notas_legales: string;
}

interface CatalogoItem {
  descripcion: string;
  categoria: string;
  precio_unidad?: number;
  precio_ml?: number;
  precio_por_salida?: number;
  metros_por_salida_default?: number;
  incluye_instalacion?: boolean;
}

// =============================================================================
// CATEGORÍAS Y MODOS DE FACTURACIÓN
// =============================================================================

const CATEGORIES: Record<string, string> = {
  tablero: "Tableros y Gabinetes",
  breaker: "Breakers y Protecciones",
  cableado: "Cableado",
  canalizacion: "Canalización (Tubería)",
  tomacorriente: "Tomacorrientes",
  iluminacion: "Iluminación",
  mano_obra: "Mano de Obra",
  diseno: "Diseño Eléctrico",
  inspeccion: "Inspección y Certificación",
  otro: "Otro",
};

const PRICING_MODES: Record<string, string> = {
  por_salida: "Por Salida (UND)",
  por_ml: "Por Metro Lineal (ml)",
};

const UNITS_BY_PRICING: Record<string, string[]> = {
  por_salida: ["und", "salida", "punto", "global", "hora", "día", "visita", "juego"],
  por_ml: ["ml", "metro"],
};

// =============================================================================

// =============================================================================
// CATÁLOGO ELÉCTRICO JERÁRQUICO — Opciones reales de ingeniería
// =============================================================================

interface CatalogoOpcion {
  label: string;
  descripcion: string;
  precio: number;
  pricing_mode: "por_salida" | "por_ml";
  unit: string;
  category: string;
  metros_por_salida?: number;
  apu_materiales?: number;
  apu_mano_obra?: number;
  apu_equipo?: number;
  apu_transporte?: number;
  apu_indirectos?: number;
}

const CATALOGO_ELECTRICO: Record<string, CatalogoOpcion[]> = {
  "Tableros y Gabinetes": [
    { label: "Monofásico 6CTOS", descripcion: "Tablero monofásico 6 circuitos, empotrable", precio: 85000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Monofásico 12CTOS", descripcion: "Tablero monofásico 12 circuitos, empotrable", precio: 145000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Monofásico 18CTOS", descripcion: "Tablero monofásico 18 circuitos, superficie", precio: 210000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Bifásico 12CTOS", descripcion: "Tablero bifásico 12 circuitos, empotrable", precio: 195000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Bifásico 18CTOS", descripcion: "Tablero bifásico 18 circuitos, superficie", precio: 260000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Bifásico 24CTOS", descripcion: "Tablero bifásico 24 circuitos, superficie", precio: 350000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Trifásico 8CTOS (con totalizador)", descripcion: "Tablero trifásico 8 circuitos con espacio para totalizador", precio: 280000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Trifásico 8CTOS (sin totalizador)", descripcion: "Tablero trifásico 8 circuitos sin espacio totalizador", precio: 220000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Trifásico 12CTOS (con totalizador)", descripcion: "Tablero trifásico 12 circuitos con espacio para totalizador", precio: 380000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
    { label: "Gabinete metálico 24CTOS", descripcion: "Gabinete metálico para 24 circuitos, IP55", precio: 520000, pricing_mode: "por_salida", unit: "und", category: "tablero" },
  ],
  "Breakers y Protecciones": [
    { label: "Breaker 1P 15A", descripcion: "Breaker riel DIN 1 polo 15A, curva C", precio: 18500, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 1P 20A", descripcion: "Breaker riel DIN 1 polo 20A, curva C", precio: 19500, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 1P 30A", descripcion: "Breaker riel DIN 1 polo 30A, curva C", precio: 22000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 2P 30A", descripcion: "Breaker riel DIN 2 polos 30A, curva C", precio: 35000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 2P 50A", descripcion: "Breaker riel DIN 2 polos 50A, curva C", precio: 45000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 2P 63A", descripcion: "Breaker riel DIN 2 polos 63A, curva C", precio: 55000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 3P 50A", descripcion: "Breaker caja moldeada 3 polos 50A", precio: 120000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Breaker 3P 100A", descripcion: "Breaker caja moldeada 3 polos 100A", precio: 195000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Totalizador 2P 100A", descripcion: "Totalizador general 2 polos 100A", precio: 85000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Totalizador 3P 125A", descripcion: "Totalizador general 3 polos 125A", precio: 160000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
    { label: "Prot. sobretensión 2P", descripcion: "DPS Clase II 2 polos 40kA", precio: 95000, pricing_mode: "por_salida", unit: "und", category: "breaker" },
  ],
  "Salidas (Tomacorrientes e Iluminación)": [
    { label: "Toma doble estándar", descripcion: "Tomacorriente doble 15A/125V, placa blanca", precio: 15000, pricing_mode: "por_salida", unit: "salida", category: "tomacorriente", metros_por_salida: 7 },
    { label: "Toma GFCI 20A", descripcion: "Tomacorriente GFCI 20A protección falla a tierra", precio: 45000, pricing_mode: "por_salida", unit: "salida", category: "tomacorriente", metros_por_salida: 7 },
    { label: "Toma doble + USB", descripcion: "Tomacorriente doble con puertos USB-A y USB-C", precio: 38000, pricing_mode: "por_salida", unit: "salida", category: "tomacorriente", metros_por_salida: 7 },
    { label: "Punto iluminación LED", descripcion: "Salida para luminaria LED 120V con interruptor", precio: 28000, pricing_mode: "por_salida", unit: "salida", category: "iluminacion", metros_por_salida: 5 },
    { label: "Punto iluminación + conmutador", descripcion: "Salida iluminación con interruptor conmutable (escalera)", precio: 45000, pricing_mode: "por_salida", unit: "salida", category: "iluminacion", metros_por_salida: 8 },
    { label: "Interruptor sencillo", descripcion: "Interruptor sencillo 15A/125V", precio: 12000, pricing_mode: "por_salida", unit: "und", category: "iluminacion" },
    { label: "Interruptor doble", descripcion: "Interruptor doble 15A/125V", precio: 18000, pricing_mode: "por_salida", unit: "und", category: "iluminacion" },
    { label: "Sensor de movimiento", descripcion: "Sensor de movimiento 180° para iluminación", precio: 55000, pricing_mode: "por_salida", unit: "und", category: "iluminacion" },
  ],
  "Cableado (por metro lineal)": [
    { label: "12 AWG THHN Cu", descripcion: "Cable de cobre 12 AWG THHN/THWN 600V", precio: 2800, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
    { label: "10 AWG THHN Cu", descripcion: "Cable de cobre 10 AWG THHN/THWN 600V", precio: 4200, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
    { label: "8 AWG THHN Cu", descripcion: "Cable de cobre 8 AWG THHN/THWN 600V", precio: 7500, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
    { label: "6 AWG THHN Cu", descripcion: "Cable de cobre 6 AWG THHN/THWN 600V", precio: 11000, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
    { label: "4 AWG THHN Cu", descripcion: "Cable de cobre 4 AWG THHN/THWN 600V", precio: 18000, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
    { label: "2 AWG THHN Cu", descripcion: "Cable de cobre 2 AWG THHN/THWN 600V", precio: 28000, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
    { label: "6 AWG Cu Desnudo", descripcion: "Cable de cobre desnudo 6 AWG para puesta a tierra", precio: 6500, pricing_mode: "por_ml", unit: "ml", category: "cableado" },
  ],
  "Canalización (Tubería)": [
    { label: "PVC 1/2\"", descripcion: "Tubería PVC conduit 1/2 pulgada", precio: 2500, pricing_mode: "por_ml", unit: "ml", category: "canalizacion" },
    { label: "PVC 3/4\"", descripcion: "Tubería PVC conduit 3/4 pulgada", precio: 3500, pricing_mode: "por_ml", unit: "ml", category: "canalizacion" },
    { label: "PVC 1\"", descripcion: "Tubería PVC conduit 1 pulgada", precio: 5000, pricing_mode: "por_ml", unit: "ml", category: "canalizacion" },
    { label: "PVC 1-1/2\"", descripcion: "Tubería PVC conduit 1-1/2 pulgada", precio: 7500, pricing_mode: "por_ml", unit: "ml", category: "canalizacion" },
    { label: "Bandeja portacable 20cm", descripcion: "Bandeja portacable metálica 20cm ancho", precio: 35000, pricing_mode: "por_ml", unit: "ml", category: "canalizacion" },
  ],
  "Mano de Obra": [
    { label: "Hora electricista certificado", descripcion: "Mano de obra electricista certificado RETIE", precio: 35000, pricing_mode: "por_salida", unit: "hora", category: "mano_obra" },
    { label: "Hora ayudante técnico", descripcion: "Mano de obra ayudante técnico eléctrico", precio: 18000, pricing_mode: "por_salida", unit: "hora", category: "mano_obra" },
    { label: "Instalación tablero", descripcion: "Mano de obra instalación y cableado de tablero", precio: 180000, pricing_mode: "por_salida", unit: "global", category: "mano_obra" },
    { label: "Certificación RETIE", descripcion: "Elaboración de certificado RETIE de conformidad", precio: 280000, pricing_mode: "por_salida", unit: "global", category: "inspeccion" },
  ],
  "Diseño e Ingeniería": [
    { label: "Diseño eléctrico básico", descripcion: "Diseño eléctrico para instalación ≤10kVA (simplificado)", precio: 450000, pricing_mode: "por_salida", unit: "global", category: "diseno" },
    { label: "Diseño eléctrico detallado", descripcion: "Diseño completo RETIE Art. 3.3.1.1 (>10kVA)", precio: 850000, pricing_mode: "por_salida", unit: "global", category: "diseno" },
    { label: "Inspección RETIE (visita)", descripcion: "Visita de inspección y verificación RETIE en sitio", precio: 150000, pricing_mode: "por_salida", unit: "visita", category: "inspeccion" },
    { label: "Diagrama unifilar", descripcion: "Elaboración de diagrama unifilar NTC 2050", precio: 120000, pricing_mode: "por_salida", unit: "und", category: "diseno" },
  ],
};


// =============================================================================
// APU — Análisis de Precios Unitarios (Plantillas por categoría)
// =============================================================================

interface APUTemplate {
  materiales_pct: number;
  mano_obra_pct: number;
  equipo_pct: number;
  transporte_pct: number;
  indirectos_pct: number;
}

const APU_TEMPLATES: Record<string, APUTemplate> = {
  tablero:       { materiales_pct: 70, mano_obra_pct: 15, equipo_pct: 5,  transporte_pct: 5,  indirectos_pct: 5 },
  breaker:       { materiales_pct: 80, mano_obra_pct: 10, equipo_pct: 3,  transporte_pct: 3,  indirectos_pct: 4 },
  cableado:      { materiales_pct: 60, mano_obra_pct: 25, equipo_pct: 5,  transporte_pct: 5,  indirectos_pct: 5 },
  canalizacion:  { materiales_pct: 45, mano_obra_pct: 35, equipo_pct: 5,  transporte_pct: 8,  indirectos_pct: 7 },
  tomacorriente: { materiales_pct: 55, mano_obra_pct: 30, equipo_pct: 5,  transporte_pct: 5,  indirectos_pct: 5 },
  iluminacion:   { materiales_pct: 55, mano_obra_pct: 30, equipo_pct: 5,  transporte_pct: 5,  indirectos_pct: 5 },
  mano_obra:     { materiales_pct: 0,  mano_obra_pct: 80, equipo_pct: 5,  transporte_pct: 5,  indirectos_pct: 10 },
  diseno:        { materiales_pct: 5,  mano_obra_pct: 70, equipo_pct: 10, transporte_pct: 3,  indirectos_pct: 12 },
  inspeccion:    { materiales_pct: 5,  mano_obra_pct: 65, equipo_pct: 10, transporte_pct: 8,  indirectos_pct: 12 },
  otro:          { materiales_pct: 40, mano_obra_pct: 30, equipo_pct: 10, transporte_pct: 10, indirectos_pct: 10 },
};

function calcularAPU(precioTotal: number, categoria: string) {
  const tpl = APU_TEMPLATES[categoria] || APU_TEMPLATES["otro"];
  return {
    materiales:  Math.round(precioTotal * tpl.materiales_pct / 100),
    mano_obra:   Math.round(precioTotal * tpl.mano_obra_pct / 100),
    equipo:      Math.round(precioTotal * tpl.equipo_pct / 100),
    transporte:  Math.round(precioTotal * tpl.transporte_pct / 100),
    indirectos:  Math.round(precioTotal * tpl.indirectos_pct / 100),
  };
}

// Iconos por categoría para el catálogo
const ICONOS_CATEGORIA: Record<string, string> = {
  "Tableros y Gabinetes": "⚡",
  "Breakers y Protecciones": "🔌",
  "Salidas (Tomacorrientes e Iluminación)": "💡",
  "Cableado (por metro lineal)": "🔗",
  "Canalización (Tubería)": "🔧",
  "Mano de Obra": "👷",
  "Diseño e Ingeniería": "📐",
};

// PÁGINA PRINCIPAL
// =============================================================================

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const supabase = createClient();
  const apiUrl = getApiUrl();

  // Estados del formulario
  const [number, setNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientNit, setClientNit] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [ivaPct, setIvaPct] = useState(19);
  const [retencionPct, setRetencionPct] = useState(0);
  const [notasLegales, setNotasLegales] = useState(
    "Precios en pesos colombianos (COP). Válido por 30 días calendario. " +
    "No incluye IVA. Forma de pago: 50% anticipo, 50% contra entrega. " +
    "El instalador certificado cumple con RETIE Res. 40117/2024."
  );

  // Estados de ítems
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [calculatedBudget, setCalculatedBudget] = useState<CalculatedBudget | null>(null);

  // Estados de UI
  const [catalogo, setCatalogo] = useState<Record<string, CatalogoItem>>({});
  const [metrosOptions, setMetrosOptions] = useState<number[]>([5, 6, 7, 8, 9, 10, 11]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);

  // Cargar catálogo y config
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, metrosRes] = await Promise.all([
          fetch(`${apiUrl}/api/presupuestos/catalogo`),
          fetch(`${apiUrl}/api/presupuestos/config/metros`),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCatalogo(catData.catalogo || {});
        }
        if (metrosRes.ok) {
          const metrosData = await metrosRes.json();
          setMetrosOptions(metrosData.opciones_metros_por_salida || [5, 6, 7, 8, 9, 10, 11]);
        }
      } catch (err) {
        console.warn("Backend no disponible, usando datos locales:", err);
      } finally {
        setLoadingCatalogo(false);
      }
    };
    loadData();
  }, [apiUrl]);

  // Auto-numeración
  useEffect(() => {
    const loadLastNumber = async () => {
      try {
        const { data } = await supabase
          .from("budgets")
          .select("number")
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const lastNum = data[0].number;
          const match = lastNum.match(/PRE-(\d+)/);
          if (match) {
            const next = parseInt(match[1]) + 1;
            setNumber(`PRE-${String(next).padStart(3, "0")}`);
          } else {
            setNumber("PRE-001");
          }
        } else {
          setNumber("PRE-001");
        }
      } catch {
        setNumber("PRE-001");
      }
    };
    loadLastNumber();
  }, [supabase]);

  // =========================================================================
  // AGREGAR ÍTEM DESDE CATÁLOGO
  // =========================================================================

  const addItemFromCatalogo = (opcion: CatalogoOpcion) => {
    const apu = calcularAPU(opcion.precio, opcion.category);
    const newItem: BudgetItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: opcion.category,
      description: opcion.descripcion,
      pricing_mode: opcion.pricing_mode as "por_salida" | "por_ml",
      quantity: 1,
      unit: opcion.unit,
      unit_price: opcion.precio,
      metros_por_salida: opcion.metros_por_salida || null,
      apu_materiales: apu.materiales,
      apu_mano_obra: apu.mano_obra,
      apu_equipo: apu.equipo,
      apu_transporte: apu.transporte,
      apu_indirectos: apu.indirectos,
      apu_expanded: false,
      subtotal: 0,
      discount_pct: 0,
      discount_amount: 0,
      total: 0,
      notes: null,
    };
    setItems([...items, newItem]);
    setCalculatedBudget(null);
  };

  // =========================================================================
  // AGREGAR ÍTEM MANUAL VACÍO
  // =========================================================================

  const addEmptyItem = () => {
    const newItem: BudgetItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: "otro",
      description: "",
      pricing_mode: "por_salida" as "por_salida",
      quantity: 1,
      unit: "und",
      unit_price: 0,
      metros_por_salida: null,
      apu_materiales: 0,
      apu_mano_obra: 0,
      apu_equipo: 0,
      apu_transporte: 0,
      apu_indirectos: 0,
      apu_expanded: false,
      subtotal: 0,
      discount_pct: 0,
      discount_amount: 0,
      total: 0,
      notes: null,
    };
    setItems([...items, newItem]);
    setCalculatedBudget(null);
  };

  // =========================================================================
  // ACTUALIZAR ÍTEM
  // =========================================================================

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // Auto-ajustar unidad cuando cambia el modo
        if (field === "pricing_mode") {
          const defaultUnit = UNITS_BY_PRICING[value]?.[0] || "unidad";
          updated.unit = defaultUnit;

          if (value === "por_unidad") {
            updated.metros_por_salida = null;
          } else if (value === "por_ml" && !updated.metros_por_salida) {
            updated.metros_por_salida = 7;
          }
        }

        return updated;
      })
    );
    setCalculatedBudget(null);
  };

  // =========================================================================
  // ELIMINAR ÍTEM
  // =========================================================================

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCalculatedBudget(null);
  };

  // =========================================================================
  // CALCULAR PRESUPUESTO (llama al backend)
  // =========================================================================

  const calcularPresupuesto = async () => {
    setError(null);
    setCalculando(true);

    if (items.length === 0) {
      setError("Agregue al menos un ítem al presupuesto.");
      setCalculando(false);
      return;
    }

    if (!projectName.trim()) {
      setError("El nombre del proyecto es obligatorio.");
      setCalculando(false);
      return;
    }

    if (!clientName.trim()) {
      setError("El nombre del cliente es obligatorio.");
      setCalculando(false);
      return;
    }

    // Validar items
    for (const item of items) {
      if (!item.description.trim()) {
        setError("Todos los ítems deben tener descripción.");
        setCalculando(false);
        return;
      }
    }

    try {
      const res = await fetch(`${apiUrl}/api/presupuestos/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          client_name: clientName,
          client_nit: clientNit || null,
          client_address: clientAddress || null,
          client_phone: clientPhone || null,
          client_email: clientEmail || null,
          project_name: projectName,
          project_address: projectAddress || null,
          issue_date: issueDate,
          valid_until: validUntil,
          items: items.map((item) => ({
            category: item.category,
            description: item.description,
            pricing_mode: item.pricing_mode,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            metros_por_salida: item.metros_por_salida,
            discount_pct: item.discount_pct,
            notes: item.notes,
          })),
          iva_pct: ivaPct,
          retencion_pct: retencionPct,
          notas_legales: notasLegales,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al calcular el presupuesto.");
      }

      const data: CalculatedBudget = await res.json();
      setCalculatedBudget(data);
    } catch (err: any) {
      console.warn("Backend no disponible, calculando localmente:", err.message);
      calcularLocalmente();
    } finally {
      setCalculando(false);
    }
  };

  // Cálculo local (fallback si backend no disponible)
  const calcularLocalmente = () => {
    const itemsCalculados = items.map((item) => {
      let subtotal = 0;
      const qty = item.quantity;
      const price = item.unit_price;
      const mts = item.metros_por_salida || 7;

      if (item.pricing_mode === "por_ml") {
        subtotal = qty * mts * price;
      } else if (item.pricing_mode === "por_salida") {
        subtotal = qty * price;
      } else {
        subtotal = qty * price;
      }

      const discount = subtotal * (item.discount_pct / 100);
      const total = subtotal - discount;

      return {
        ...item,
        subtotal: Math.round(subtotal * 100) / 100,
        discount_amount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
      };
    });

    const subtotalGeneral = itemsCalculados.reduce((acc, i) => acc + i.total, 0);
    const ivaAmount = subtotalGeneral * (ivaPct / 100);
    const retencionAmount = subtotalGeneral * (retencionPct / 100);
    const totalFinal = subtotalGeneral + ivaAmount - retencionAmount;

    setCalculatedBudget({
      number,
      client_name: clientName,
      client_nit: clientNit || null,
      client_address: clientAddress || null,
      client_phone: clientPhone || null,
      client_email: clientEmail || null,
      project_name: projectName,
      project_address: projectAddress || null,
      issue_date: issueDate,
      valid_until: validUntil,
      items: itemsCalculados,
      subtotal_general: Math.round(subtotalGeneral * 100) / 100,
      iva_pct: ivaPct,
      iva_amount: Math.round(ivaAmount * 100) / 100,
      retencion_pct: retencionPct,
      retencion_amount: Math.round(retencionAmount * 100) / 100,
      total_final: Math.round(totalFinal * 100) / 100,
      notas_legales: notasLegales,
    });
  };

  // =========================================================================
  // GUARDAR EN SUPABASE
  // =========================================================================

  const guardarPresupuesto = async () => {
    if (!calculatedBudget) return;
    setError(null);
    setGuardando(true);

    try {
      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .insert({
          number: calculatedBudget.number,
          client_name: calculatedBudget.client_name,
          project_name: calculatedBudget.project_name,
          issue_date: calculatedBudget.issue_date,
          valid_until: calculatedBudget.valid_until,
          total: calculatedBudget.total_final,
          status: "pendiente",
        })
        .select()
        .single();

      if (budgetError) throw budgetError;
      if (!budgetData) throw new Error("No se pudo crear el presupuesto.");

      // Insertar items (si la tabla existe)
      try {
        const itemsToInsert = calculatedBudget.items.map((item, idx) => ({
          budget_id: budgetData.id,
          category: item.category,
          description: item.description,
          pricing_mode: item.pricing_mode,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          metros_por_salida: item.metros_por_salida,
          discount_pct: item.discount_pct,
          subtotal: item.subtotal,
          discount_amount: item.discount_amount,
          total: item.total,
          notes: item.notes,
          sort_order: idx,
        }));

        await supabase.from("budget_items").insert(itemsToInsert);
      } catch (itemErr: any) {
        console.warn("Items no guardados (tabla budget_items puede no existir aún):", itemErr.message);
      }

      setSuccess("¡Presupuesto guardado exitosamente!");
      setTimeout(() => {
        router.push("/dashboard/presupuestos");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al guardar el presupuesto.");
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================================
  // FORMATO COP
  // =========================================================================

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val);

  // =========================================================================
  // ITEMS AGRUPADOS POR CATEGORÍA
  // =========================================================================

  // Catálogo jerárquico definido arriba como CATALOGO_ELECTRICO

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 mb-2 transition-colors cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a Presupuestos
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" /> Nuevo Presupuesto
          </h1>
        </div>
      </div>

      {/* Mensajes */}
      {error && (<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"><AlertCircle className="h-5 w-5 shrink-0 text-red-500" /><span>{error}</span></div>)}
      {success && (<div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700"><CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" /><span>{success}</span></div>)}

      {/* ================================================================ */}
      {/* CLIENTE + PROYECTO — Solo lo esencial */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-3xs font-bold uppercase text-slate-400 tracking-wider mb-1">Cliente *</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre o razón social" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-3xs font-bold uppercase text-slate-400 tracking-wider mb-1">Nombre del Proyecto *</label>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Instalación Eléctrica Comercial, Residencial, Industrial..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CATÁLOGO JERÁRQUICO — Categorías expandibles con opciones reales */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Catálogo de Materiales y Servicios
          </h2>
          <p className="text-3xs text-slate-400 mt-0.5">Seleccione una categoría y elija los ítems a incluir en el presupuesto</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(CATALOGO_ELECTRICO).map(([categoria, opciones]) => {
              const expandida = categoriaExpandida === categoria;
              return (
                <div key={categoria} className={`rounded-xl border transition-all duration-200 ${expandida ? 'border-primary/30 bg-primary/[0.02] shadow-sm ring-1 ring-primary/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <button
                    onClick={() => setCategoriaExpandida(expandida ? null : categoria)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left cursor-pointer"
                  >
                    <span className="text-sm">{ICONOS_CATEGORIA[categoria] || '📦'}</span>
                    <span className="text-xs font-bold text-slate-800 flex-1">{categoria}</span>
                    <span className="text-2xs text-slate-400 font-mono">{opciones.length} opciones</span>
                    <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform duration-200 ${expandida ? 'rotate-90' : ''}`} />
                  </button>
                  {expandida && (
                    <div className="border-t border-slate-100 px-4 py-3 space-y-1.5 max-h-64 overflow-y-auto">
                      {opciones.map((opcion, idx) => (
                        <button
                          key={idx}
                          onClick={() => addItemFromCatalogo(opcion)}
                          className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left hover:bg-primary/5 active:scale-[0.98] transition-all cursor-pointer group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-primary transition-colors block truncate">{opcion.label}</span>
                            <span className="text-3xs text-slate-400 block truncate">{opcion.descripcion}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold font-mono text-primary">{formatCOP(opcion.precio)}</span>
                            <span className="text-3xs text-slate-400">{opcion.unit === 'ml' ? '/ml' : opcion.unit === 'salida' ? '/sal' : opcion.unit === 'hora' ? '/h' : ''}</span>
                            <Plus className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!categoriaExpandida && (
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
              <span className="text-3xs text-slate-400">¿No encuentra lo que busca? Agregue un ítem manual:</span>
              <button onClick={addEmptyItem} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-2xs font-semibold text-slate-500 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"><Plus className="h-3 w-3" /> Ítem Personalizado</button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* ÍTEMS DEL PRESUPUESTO — EL DINERO MANDA */}
      {/* ================================================================ */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Ítems del Presupuesto ({items.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider">
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 w-28">Modo</th>
                  <th className="px-4 py-2 text-center w-20">Cant.</th>
                  <th className="px-4 py-2 text-right w-28">P. Unitario</th>
                  <th className="px-4 py-2 text-right w-28">TOTAL</th>
                  <th className="px-4 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <Fragment key={item.id}>
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2">
                      <input type="text" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Descripción" className="w-full rounded border border-transparent hover:border-slate-200 focus:border-primary/50 bg-transparent px-1.5 py-0.5 text-xs text-slate-800 outline-none font-semibold" />
                      <div className="flex items-center gap-1 mt-0.5">
                        <select value={item.category} onChange={(e) => updateItem(item.id, "category", e.target.value)} className="rounded border border-slate-200 bg-slate-50 px-1 py-0 text-3xs text-slate-500 outline-none cursor-pointer">
                          {Object.entries(CATEGORIES).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                        </select>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, "apu_expanded", !item.apu_expanded)}
                          className={`rounded border px-1 py-0 text-3xs font-bold transition-all cursor-pointer ${item.apu_expanded ? 'border-primary/30 bg-primary/10 text-primary' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-primary/20 hover:text-primary'}`}
                          title="Análisis de Precios Unitarios"
                        >APU</button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <select value={item.pricing_mode} onChange={(e) => updateItem(item.id, "pricing_mode", e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-2xs text-slate-600 outline-none focus:border-primary/50 cursor-pointer">{Object.entries(PRICING_MODES).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}</select>
                      {item.pricing_mode === "por_salida" && item.metros_por_salida && (
                        <select value={item.metros_por_salida} onChange={(e) => updateItem(item.id, "metros_por_salida", Number(e.target.value))} className="mt-1 w-full rounded border border-amber-200 bg-amber-50 px-1 py-0.5 text-2xs font-semibold text-amber-700 outline-none cursor-pointer">{metrosOptions.map(m => (<option key={m} value={m}>{m}m/sal</option>))}</select>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 justify-center">
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} min={1} className="w-14 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-xs font-mono text-slate-800 outline-none focus:border-primary/50 text-center" />
                        <span className="text-2xs font-semibold text-slate-500">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="relative inline-block">
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                        <input type="number" value={item.unit_price} onChange={(e) => { const precio = Number(e.target.value); updateItem(item.id, "unit_price", precio); const apu = calcularAPU(precio, item.category); updateItem(item.id, "apu_materiales", apu.materiales); updateItem(item.id, "apu_mano_obra", apu.mano_obra); updateItem(item.id, "apu_equipo", apu.equipo); updateItem(item.id, "apu_transporte", apu.transporte); updateItem(item.id, "apu_indirectos", apu.indirectos); }} min={0} className="w-24 rounded border border-slate-200 bg-slate-50 pl-5 pr-1.5 py-0.5 text-sm font-bold font-mono text-slate-800 outline-none focus:border-primary/50 text-right" />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-sm font-black font-mono text-slate-900">{formatCOP(item.unit_price * item.quantity)}</span>
                    </td>
                    <td className="px-1 py-2">
                      <button onClick={() => removeItem(item.id)} className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                  {/* APU — Desglose de costos expandible */}
                  {item.apu_expanded && (
                    <tr key={`apu-${item.id}`}>
                      <td colSpan={6} className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-3xs font-bold uppercase text-slate-400 tracking-wider">APU — Análisis de Precios Unitarios</span>
                          <span className="text-3xs text-slate-400">({CATEGORIES[item.category] || item.category})</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-2xs">
                          <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                            <span className="text-slate-400 block">Materiales</span>
                            <input type="number" value={item.apu_materiales} onChange={(e) => updateItem(item.id, "apu_materiales", Number(e.target.value))} className="w-full bg-transparent text-xs font-bold font-mono text-slate-800 outline-none mt-0.5" />
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                            <span className="text-slate-400 block">Mano de Obra</span>
                            <input type="number" value={item.apu_mano_obra} onChange={(e) => updateItem(item.id, "apu_mano_obra", Number(e.target.value))} className="w-full bg-transparent text-xs font-bold font-mono text-slate-800 outline-none mt-0.5" />
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                            <span className="text-slate-400 block">Equipo/Herram.</span>
                            <input type="number" value={item.apu_equipo} onChange={(e) => updateItem(item.id, "apu_equipo", Number(e.target.value))} className="w-full bg-transparent text-xs font-bold font-mono text-slate-800 outline-none mt-0.5" />
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                            <span className="text-slate-400 block">Transporte</span>
                            <input type="number" value={item.apu_transporte} onChange={(e) => updateItem(item.id, "apu_transporte", Number(e.target.value))} className="w-full bg-transparent text-xs font-bold font-mono text-slate-800 outline-none mt-0.5" />
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                            <span className="text-slate-400 block">AIU (Indirectos)</span>
                            <input type="number" value={item.apu_indirectos} onChange={(e) => updateItem(item.id, "apu_indirectos", Number(e.target.value))} className="w-full bg-transparent text-xs font-bold font-mono text-slate-800 outline-none mt-0.5" />
                          </div>
                        </div>
                        <div className="flex justify-end mt-2 pt-2 border-t border-slate-200">
                          <span className="text-2xs text-slate-400 mr-2">Total APU:</span>
                          <span className="text-xs font-black font-mono text-primary">{formatCOP(item.apu_materiales + item.apu_mano_obra + item.apu_equipo + item.apu_transporte + item.apu_indirectos)}</span>
                          <span className="text-3xs text-slate-400 ml-2">(Precio venta: {formatCOP(item.unit_price)})</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barra de total + calcular */}
          <div className="border-t-2 border-slate-200 bg-gradient-to-r from-primary/5 to-white px-5 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={calcularPresupuesto} disabled={calculando} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-primary/20">
                  {calculando ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</> : <><Calculator className="h-4 w-4" /> Calcular Presupuesto</>}
                </button>
                <span className="text-2xs text-slate-400">IVA/Retención → <a href="/dashboard/ajustes" className="text-primary underline font-semibold">Ajustes</a></span>
              </div>
              <div className="text-right">
                <span className="text-2xs font-semibold text-slate-400 uppercase block">Subtotal Estimado</span>
                <span className="text-xl font-black text-slate-900 font-display">{formatCOP(items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* RESULTADO FINAL */}
      {/* ================================================================ */}
      {calculatedBudget && (
        <div className="rounded-2xl border-2 border-primary/30 bg-white shadow-xl overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 font-medium">{calculatedBudget.client_name}</p>
                <h3 className="text-lg font-black font-display">{calculatedBudget.project_name || calculatedBudget.number}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xs font-semibold text-white/60 uppercase block">TOTAL FINAL</span>
                <span className="text-3xl font-black font-display tracking-tight">{formatCOP(calculatedBudget.total_final)}</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider">
                  <th className="px-5 py-2 w-8">#</th>
                  <th className="px-5 py-2">Descripción</th>
                  <th className="px-5 py-2 text-right w-28">P. Unit.</th>
                  <th className="px-5 py-2 text-center w-20">Cant.</th>
                  <th className="px-5 py-2 text-right w-28">Subtotal</th>
                  <th className="px-5 py-2 text-right w-28">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calculatedBudget.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-5 py-2"><span className="font-semibold text-slate-800 text-xs">{item.description}</span>{item.metros_por_salida && <span className="ml-1.5 text-amber-600 text-3xs">({item.metros_por_salida}m)</span>}</td>
                    <td className="px-5 py-2 text-right font-mono text-sm font-bold text-slate-800">{formatCOP(item.unit_price)}</td>
                    <td className="px-5 py-2 text-center text-xs text-slate-500">{item.quantity} {item.unit}</td>
                    <td className="px-5 py-2 text-right font-mono text-xs text-slate-500">{formatCOP(item.subtotal)}</td>
                    <td className="px-5 py-2 text-right font-mono text-sm font-black text-slate-900">{formatCOP(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/50">
            <div className="space-y-1 max-w-xs ml-auto">
              <div className="flex justify-between text-xs"><span className="text-slate-400">Subtotal</span><span className="font-mono font-semibold text-slate-800">{formatCOP(calculatedBudget.subtotal_general)}</span></div>
              {calculatedBudget.iva_pct > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">IVA ({calculatedBudget.iva_pct}%)</span><span className="font-mono text-slate-600">{formatCOP(calculatedBudget.iva_amount)}</span></div>}
              {calculatedBudget.retencion_pct > 0 && <div className="flex justify-between text-xs"><span className="text-red-500">Retefuente ({calculatedBudget.retencion_pct}%)</span><span className="font-mono text-red-600">-{formatCOP(calculatedBudget.retencion_amount)}</span></div>}
              <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200"><span className="text-slate-900">TOTAL</span><span className="font-display text-primary">{formatCOP(calculatedBudget.total_final)}</span></div>
            </div>
          </div>
          <div className="border-t border-slate-200 px-6 py-3 flex justify-end gap-3 bg-white">
            <button onClick={() => setCalculatedBudget(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">Nuevo Cálculo</button>
            <button onClick={guardarPresupuesto} disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-xs font-bold text-white hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-sm">
              {guardando ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar Presupuesto</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
