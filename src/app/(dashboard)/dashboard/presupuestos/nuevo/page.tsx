"use client";

import { useState, useEffect, useCallback, Fragment, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getApiUrl } from "@/lib/api";
import {
  Plus, Package,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Wrench,
  PenTool,
  Percent,
  Settings,
} from "lucide-react";
import AddItemModal from "@/components/presupuestos/AddItemModal";
import type { APUCompleto } from "@/lib/supabase/apus";

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
  // Origen del ítem
  is_from_apu?: boolean;  // true = biblioteca APU, false/undefined = manual o catálogo
  tipo_item?: 'insumo_directo' | 'apu';  // solo para ítems manuales
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
  aiu_pct: number;
  aiu_amount: number;
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

const ENGINEERING_UNITS = ['und', 'ml', 'm2', 'kg', 'lb', 'salida', 'punto', 'global', 'hora', 'día', 'visita', 'juego'];

// =============================================================================

// =============================================================================
// CATÁLOGO ELÉCTRICO JERÁRQUICO — Opciones reales de ingeniería
// =============================================================================


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

// Empaquetar datos APU en el campo notes para persistencia
function packAPUData(item: BudgetItem): string | null {
  const hasAPU = item.apu_materiales > 0 || item.apu_mano_obra > 0 || item.apu_equipo > 0 || item.apu_transporte > 0 || item.apu_indirectos > 0 || item.is_from_apu || item.tipo_item === 'apu';
  if (!hasAPU && !item.notes) return item.notes || null;

  let existingInsumos: any[] = [];
  if (item.notes) {
    try { const parsed = JSON.parse(item.notes); if (Array.isArray(parsed)) existingInsumos = parsed; else if (parsed.apu) existingInsumos = parsed.insumos || []; } catch {}
  }

  return JSON.stringify({
    apu: {
      materiales: item.apu_materiales || 0,
      mano_obra: item.apu_mano_obra || 0,
      equipo: item.apu_equipo || 0,
      transporte: item.apu_transporte || 0,
      indirectos: item.apu_indirectos || 0,
    },
    is_from_apu: item.is_from_apu ?? false,
    tipo_item: item.tipo_item || null,
    insumos: existingInsumos,
  });
}

// Desempaquetar datos APU desde notes
function unpackAPUData(notes: string | null): Partial<BudgetItem> {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes);
    // Nuevo formato: {apu: {...}, is_from_apu, tipo_item, insumos: [...]}
    if (parsed.apu && typeof parsed.apu === 'object') {
      return {
        apu_materiales: parsed.apu.materiales || 0,
        apu_mano_obra: parsed.apu.mano_obra || 0,
        apu_equipo: parsed.apu.equipo || 0,
        apu_transporte: parsed.apu.transporte || 0,
        apu_indirectos: parsed.apu.indirectos || 0,
        is_from_apu: parsed.is_from_apu ?? false,
        tipo_item: parsed.tipo_item || undefined,
        notes: JSON.stringify(parsed.insumos || []),
      };
    }
    // Legacy: array de insumos = APU de biblioteca
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Recalcular APU desde los insumos
      const mat = parsed.filter((d: any) => d.tipo === 'material').reduce((s: number, d: any) => s + (d.cantidad || 0) * (d.precio || 0), 0);
      const mo = parsed.filter((d: any) => d.tipo === 'mano_obra').reduce((s: number, d: any) => s + (d.cantidad || 0) * (d.precio || 0), 0);
      const eq = parsed.filter((d: any) => d.tipo === 'equipo').reduce((s: number, d: any) => s + (d.cantidad || 0) * (d.precio || 0), 0);
      const tr = parsed.filter((d: any) => d.tipo === 'transporte').reduce((s: number, d: any) => s + (d.cantidad || 0) * (d.precio || 0), 0);
      return {
        apu_materiales: Math.round(mat),
        apu_mano_obra: Math.round(mo),
        apu_equipo: Math.round(eq),
        apu_transporte: Math.round(tr),
        apu_indirectos: 0,
        is_from_apu: true,
        tipo_item: undefined,
        notes,
      };
    }
  } catch {}
  return {};
}

// Iconos por categoría para el catálogo
// PÁGINA PRINCIPAL
// =============================================================================

function NuevoPresupuestoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editBudgetId = searchParams.get('edit');
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

  // Clients & Projects for selects
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; client_name: string }[]>([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [ivaPct, setIvaPct] = useState(19);
  const [retencionPct, setRetencionPct] = useState(0);
  const [aiuPct, setAiuPct] = useState(0); // Administración + Imprevistos + Utilidad
  const [showAIUModal, setShowAIUModal] = useState(false);
  const [notasLegales, setNotasLegales] = useState(
    "Precios en pesos colombianos (COP). Válido por 30 días calendario. " +
    "No incluye IVA. Forma de pago: 50% anticipo, 50% contra entrega. " +
    "El instalador certificado cumple con RETIE Res. 40117/2024."
  );

  // Estados de ítems
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [calculatedItems, setCalculatedItems] = useState<BudgetItem[]>([]);
  const [subtotalGeneral, setSubtotalGeneral] = useState(0);
  const [aiuAmount, setAiuAmount] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);
  const [retencionAmount, setRetencionAmount] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);

  // Estados de UI
  const [catalogo, setCatalogo] = useState<Record<string, CatalogoItem>>({});
  const [metrosOptions, setMetrosOptions] = useState<number[]>([5, 6, 7, 8, 9, 10, 11]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(false); // loading para edición
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Auto-numeración (solo para presupuestos nuevos)
  useEffect(() => {
    if (editBudgetId) return; // no generar nuevo número si estamos editando
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
  }, [supabase, editBudgetId]); // re-ejecutar si cambia editBudgetId

  // Cargar presupuesto para edición
  useEffect(() => {
    if (!editBudgetId) return;
    setLoadingBudget(true);
    const loadBudget = async () => {
      try {
        const { data: budget } = await supabase
          .from("budgets")
          .select("*")
          .eq("id", editBudgetId)
          .single();

        if (!budget) return;

        // Poblar campos del formulario
        setNumber(budget.number);
        setClientName(budget.client_name);
        setProjectName(budget.project_name);
        if (budget.client_nit) setClientNit(budget.client_nit);
        if (budget.client_address) setClientAddress(budget.client_address);
        if (budget.client_phone) setClientPhone(budget.client_phone);
        if (budget.client_email) setClientEmail(budget.client_email);
        if (budget.project_address) setProjectAddress(budget.project_address);

        // Cargar items
        const { data: budgetItems } = await supabase
          .from("budget_items")
          .select("*")
          .eq("budget_id", editBudgetId)
          .order("sort_order");

        if (budgetItems && budgetItems.length > 0) {
          const loadedItems: BudgetItem[] = budgetItems.map((bi: any) => {
            // Preferir columnas directas (post-migración), fallback a notes para legacy
            const hasDirectAPU = (bi.apu_materiales > 0 || bi.apu_mano_obra > 0 || bi.apu_equipo > 0 || bi.apu_transporte > 0 || bi.apu_indirectos > 0);
            const apuData: Partial<BudgetItem> = hasDirectAPU
              ? {
                  apu_materiales: bi.apu_materiales || 0,
                  apu_mano_obra: bi.apu_mano_obra || 0,
                  apu_equipo: bi.apu_equipo || 0,
                  apu_transporte: bi.apu_transporte || 0,
                  apu_indirectos: bi.apu_indirectos || 0,
                  is_from_apu: bi.is_from_apu ?? false,
                  tipo_item: bi.tipo_item || undefined,
                  notes: bi.notes,
                }
              : unpackAPUData(bi.notes);

            return {
              id: bi.id?.toString() || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              category: bi.category || "otro",
              description: bi.description || "",
              pricing_mode: bi.pricing_mode || "por_salida",
              quantity: bi.quantity || 1,
              unit: bi.unit || "und",
              unit_price: bi.unit_price || 0,
              metros_por_salida: bi.metros_por_salida || null,
              apu_materiales: apuData.apu_materiales ?? 0,
              apu_mano_obra: apuData.apu_mano_obra ?? 0,
              apu_equipo: apuData.apu_equipo ?? 0,
              apu_transporte: apuData.apu_transporte ?? 0,
              apu_indirectos: apuData.apu_indirectos ?? 0,
              apu_expanded: false,
              is_from_apu: apuData.is_from_apu ?? false,
              tipo_item: apuData.tipo_item || 'insumo_directo',
              subtotal: bi.subtotal || 0,
              discount_pct: bi.discount_pct || 0,
              discount_amount: bi.discount_amount || 0,
              total: bi.total || 0,
              notes: apuData.notes || bi.notes,
            };
          });
          setItems(loadedItems);
        }
      } catch (err) {
        console.warn("Error cargando presupuesto para editar:", err);
      } finally {
        setLoadingBudget(false);
      }
    };
    loadBudget();
  }, [editBudgetId, supabase]);

  // =========================================================================
  // AUTO-CÁLCULO EN TIEMPO REAL (useEffect)
  // =========================================================================
  useEffect(() => {
    if (items.length === 0) {
      setCalculatedItems([]);
      setSubtotalGeneral(0); setAiuAmount(0); setIvaAmount(0);
      setRetencionAmount(0); setTotalFinal(0);
      return;
    }

    const itemsCalc = items.map((item) => {
      const qty = item.quantity;
      const price = item.unit_price;
      const mts = item.metros_por_salida || 7;
      let subtotal = 0;
      if (item.pricing_mode === "por_ml") subtotal = qty * mts * price;
      else subtotal = qty * price;
      const discount = subtotal * (item.discount_pct / 100);
      const total = subtotal - discount;
      return { ...item, subtotal: Math.round(subtotal * 100) / 100, discount_amount: Math.round(discount * 100) / 100, total: Math.round(total * 100) / 100 };
    });

    const sub = itemsCalc.reduce((acc, i) => acc + i.total, 0);
    const a = Math.round(sub * (aiuPct / 100));
    const base = sub + a;
    const iv = Math.round(base * (ivaPct / 100));
    const rt = Math.round(base * (retencionPct / 100));
    const tf = base + iv - rt;

    setCalculatedItems(itemsCalc);
    setSubtotalGeneral(sub);
    setAiuAmount(a);
    setIvaAmount(iv);
    setRetencionAmount(rt);
    setTotalFinal(tf);
  }, [items, ivaPct, retencionPct, aiuPct]);

  // Cargar clientes y proyectos para los selects
  useEffect(() => {
    const loadRelations = async () => {
      try {
        const [{ data: cData }, { data: pData }] = await Promise.all([
          supabase.from("clients").select("id, name").order("name", { ascending: true }),
          supabase.from("projects").select("id, name, client_name").order("name", { ascending: true }),
        ]);
        if (cData) setClients(cData);
        if (pData) setProjects(pData);
      } catch (err) {
        console.warn("No se pudieron cargar clientes/proyectos:", err);
      }
    };
    loadRelations();
  }, [supabase]);

  // =========================================================================
  // AGREGAR APU DESDE BIBLIOTECA (FASE 2)
  // =========================================================================

  const handleAgregarAPU = (apuCompleto: APUCompleto) => {
    // Calcular desglose por tipo de insumo
    const sumByType = (tipo: string) =>
      apuCompleto.detalles
        .filter((d) => d.insumos?.tipo === tipo)
        .reduce(
          (s, d) => s + (d.cantidad_rendimiento || 0) * (d.insumos?.precio_unitario || 0),
          0
        );

    const newItem: BudgetItem = {
      id: `apu-${apuCompleto.apu.id}-${Date.now()}`,
      category: "otro",
      is_from_apu: true,
      description: `${apuCompleto.apu.codigo} — ${apuCompleto.apu.descripcion}`,
      pricing_mode: "por_salida",
      quantity: 1,
      unit: apuCompleto.apu.unidad,
      unit_price: Math.round(apuCompleto.costoTotal),
      metros_por_salida: null,
      apu_materiales: Math.round(sumByType("material")),
      apu_mano_obra: Math.round(sumByType("mano_obra")),
      apu_equipo: Math.round(sumByType("equipo")),
      apu_transporte: Math.round(sumByType("transporte")),
      apu_indirectos: 0,
      apu_expanded: false,
      subtotal: 0,
      discount_pct: 0,
      discount_amount: 0,
      total: 0,
      notes: JSON.stringify(
        apuCompleto.detalles.map((d) => ({
          insumo: d.insumos?.descripcion,
          cantidad: d.cantidad_rendimiento,
          precio: d.insumos?.precio_unitario,
          tipo: d.insumos?.tipo,
        }))
      ),
    };

    setItems([...items, newItem]);
  };

  // =========================================================================
  // ACTUALIZAR ÍTEM
  // =========================================================================

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // Auto-ajustar modo de precio según unidad
        if (field === "unit") {
          updated.pricing_mode = (value === "ml" || value === "metro") ? "por_ml" : "por_salida";
          if (updated.pricing_mode === "por_ml" && !updated.metros_por_salida) {
            updated.metros_por_salida = 7;
          }
        }

        // Si cambia el tipo de ítem manual, recalcular precio y toggle panel APU
        if (field === "tipo_item" && value === "apu") {
          updated.apu_expanded = true;
          const sumAPU = updated.apu_materiales + updated.apu_mano_obra + updated.apu_equipo + updated.apu_transporte + updated.apu_indirectos;
          if (sumAPU > 0) updated.unit_price = sumAPU;
        }
        if (field === "tipo_item" && value === "insumo_directo") {
          updated.apu_expanded = false;
        }

        // Si edita componentes APU y tipo es 'apu', auto-actualizar precio
        if (field.startsWith("apu_") && (updated.is_from_apu || updated.tipo_item === "apu")) {
          const sumAPU = updated.apu_materiales + updated.apu_mano_obra + updated.apu_equipo + updated.apu_transporte + updated.apu_indirectos;
          updated.unit_price = sumAPU;
        }

        return updated;
      })
    );
  };

  // =========================================================================
  // ELIMINAR ÍTEM
  // =========================================================================

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // GUARDAR EN SUPABASE
  // =========================================================================

  const guardarPresupuesto = async () => {
    if (items.length === 0) { setError("Agregue al menos un ítem."); return; }
    setError(null);
    setGuardando(true);

    const totalConImpuestos = totalFinal;

    try {
      if (editBudgetId) {
        // ACTUALIZAR presupuesto existente
        const { error: budgetError } = await supabase
          .from("budgets")
          .update({
            number: number,
            client_name: clientName,
            project_name: projectName,
            issue_date: issueDate,
            valid_until: validUntil,
            total: totalConImpuestos,
          })
          .eq("id", editBudgetId);

        if (budgetError) throw budgetError;

        // Eliminar items viejos
        await supabase.from("budget_items").delete().eq("budget_id", editBudgetId);

        // Re-insertar items
        try {
          const itemsToInsert = items.map((item, idx) => ({
            budget_id: editBudgetId,
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
            apu_materiales: item.apu_materiales || 0,
            apu_mano_obra: item.apu_mano_obra || 0,
            apu_equipo: item.apu_equipo || 0,
            apu_transporte: item.apu_transporte || 0,
            apu_indirectos: item.apu_indirectos || 0,
            is_from_apu: item.is_from_apu ?? false,
            tipo_item: item.tipo_item || null,
            sort_order: idx,
          }));
          await supabase.from("budget_items").insert(itemsToInsert);
        } catch (itemErr: any) {
          console.warn("Items no guardados:", itemErr.message);
        }

        setSuccess("¡Presupuesto actualizado exitosamente!");
      } else {
        // CREAR nuevo presupuesto
        const { data: budgetData, error: budgetError } = await supabase
          .from("budgets")
          .insert({
            number: number,
            client_name: clientName,
            project_name: projectName,
            issue_date: issueDate,
            valid_until: validUntil,
            total: totalConImpuestos,
            status: "pendiente",
          })
          .select()
          .single();

        if (budgetError) throw budgetError;
        if (!budgetData) throw new Error("No se pudo crear el presupuesto.");

        // Insertar items
        try {
          const itemsToInsert = items.map((item, idx) => ({
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
            apu_materiales: item.apu_materiales || 0,
            apu_mano_obra: item.apu_mano_obra || 0,
            apu_equipo: item.apu_equipo || 0,
            apu_transporte: item.apu_transporte || 0,
            apu_indirectos: item.apu_indirectos || 0,
            is_from_apu: item.is_from_apu ?? false,
            tipo_item: item.tipo_item || null,
            sort_order: idx,
          }));
          await supabase.from("budget_items").insert(itemsToInsert);
        } catch (itemErr: any) {
          console.warn("Items no guardados:", itemErr.message);
        }

        setSuccess("¡Presupuesto guardado exitosamente!");
      }
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
            <FileText className="h-7 w-7 text-primary" /> {editBudgetId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h1>
        </div>
      </div>

      {/* Mensajes */}
      {error && (<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"><AlertCircle className="h-5 w-5 shrink-0 text-red-500" /><span>{error}</span></div>)}
      {success && (<div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700"><CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" /><span>{success}</span></div>)}

      {/* Loading para edición */}
      {loadingBudget && editBudgetId && (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm font-semibold text-slate-600">Cargando presupuesto...</p>
          <p className="text-xs text-slate-400 mt-1">Obteniendo ítems y datos del presupuesto</p>
        </div>
      )}

      {/* ================================================================ */}
      {/* CLIENTE + PROYECTO — Selects desde Supabase */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-3xs font-bold uppercase text-slate-400 tracking-wider mb-1">Cliente *</label>
            {clients.length === 0 ? (
              <div className="flex items-center gap-2">
                <select disabled className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-600 outline-none cursor-not-allowed">
                  <option>No hay clientes</option>
                </select>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/clientes")}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-primary-green/30 bg-primary-green/5 px-3 py-2.5 text-xs font-bold text-primary-green hover:bg-primary-green/10 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Crear Cliente
                </button>
              </div>
            ) : (
              <select
                required
                value={clientName}
                onChange={(e) => { setClientName(e.target.value); setProjectName(""); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
              >
                <option value="">-- Seleccionar cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-3xs font-bold uppercase text-slate-400 tracking-wider mb-1">Proyecto *</label>
            {!clientName ? (
              <select disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed">
                <option>Selecciona un cliente primero</option>
              </select>
            ) : (() => {
              const clientProjects = projects.filter(p => p.client_name === clientName);
              if (clientProjects.length === 0) {
                return (
                  <div className="flex items-center gap-2">
                    <select disabled className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-600 outline-none cursor-not-allowed">
                      <option>Sin proyectos para este cliente</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/clientes")}
                      className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-primary-green/30 bg-primary-green/5 px-3 py-2.5 text-xs font-bold text-primary-green hover:bg-primary-green/10 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Crear Proyecto
                    </button>
                  </div>
                );
              }
              return (
                <select
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">-- Seleccionar proyecto --</option>
                  {clientProjects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* BARRA DE ACCIONES — Añadir Ítems */}
      {/* ================================================================ */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          <Package className="w-4.5 h-4.5" />
          BIBLIOTECA DE APU
        </button>
        <button
          onClick={() => {
            const newItem: BudgetItem = {
              id: `man-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              category: 'otro', description: '', pricing_mode: 'por_salida', quantity: 1, unit: 'und',
              unit_price: 0, metros_por_salida: null,
              apu_materiales: 0, apu_mano_obra: 0, apu_equipo: 0, apu_transporte: 0, apu_indirectos: 0,
              apu_expanded: false, is_from_apu: false, tipo_item: 'insumo_directo', subtotal: 0, discount_pct: 0, discount_amount: 0, total: 0, notes: null,
            };
            setItems([...items, newItem]);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-xs font-semibold text-slate-500 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
        >
          <PenTool className="w-4 h-4" /> Ítem Personalizado
        </button>
        {items.length > 0 && (
          <span className="text-xs text-slate-400 ml-auto">{items.length} ítem{items.length !== 1 ? 'es' : ''} en el presupuesto</span>
        )}
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
                  <th className="px-4 py-2 w-28">Unidad</th>
                  <th className="px-4 py-2 text-center w-20">Cant.</th>
                  <th className="px-4 py-2 text-right w-28">P. Unitario</th>
                  <th className="px-4 py-2 text-right w-28">TOTAL</th>
                  <th className="px-4 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <Fragment key={item.id}>
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-start gap-1.5">
                        <span className="text-xs font-bold text-slate-400 mt-1 shrink-0 select-none">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <input type="text" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Descripción" className="w-full rounded border border-transparent hover:border-slate-200 focus:border-primary/50 bg-transparent px-1.5 py-0.5 text-sm text-slate-800 outline-none font-semibold" />
                          {!item.is_from_apu && (
                            <select
                              value={item.tipo_item || 'insumo_directo'}
                              onChange={(e) => updateItem(item.id, "tipo_item", e.target.value)}
                              className="rounded border border-slate-200 bg-slate-50 px-1 py-0 text-3xs text-slate-500 outline-none cursor-pointer mt-1"
                            >
                              <option value="insumo_directo">Insumo Directo</option>
                              <option value="apu">APU</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <select value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-2xs text-slate-600 outline-none focus:border-primary/50 cursor-pointer">
                        {ENGINEERING_UNITS.map(u => (<option key={u} value={u}>{u}</option>))}
                      </select>
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
                        {item.is_from_apu || item.tipo_item === 'apu' ? (
                          <span className="inline-block w-24 rounded border border-slate-100 bg-transparent pl-5 pr-1.5 py-0.5 text-sm font-bold font-mono text-slate-600 text-right">{formatCOP(item.unit_price)}</span>
                        ) : (
                          <input type="number" value={item.unit_price} onChange={(e) => { const precio = Number(e.target.value); updateItem(item.id, "unit_price", precio); const apu = calcularAPU(precio, item.category); updateItem(item.id, "apu_materiales", apu.materiales); updateItem(item.id, "apu_mano_obra", apu.mano_obra); updateItem(item.id, "apu_equipo", apu.equipo); updateItem(item.id, "apu_transporte", apu.transporte); updateItem(item.id, "apu_indirectos", apu.indirectos); }} min={0} className="w-24 rounded border border-slate-200 bg-slate-50 pl-5 pr-1.5 py-0.5 text-sm font-bold font-mono text-slate-800 outline-none focus:border-primary/50 text-right" />
                        )}
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

          {/* Footer fijo: Totales + AIU + Guardar */}
          <div className="border-t-2 border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <span className="block text-3xs text-slate-400 uppercase">Subtotal</span>
                  <span className="font-mono font-bold text-slate-800">{formatCOP(subtotalGeneral)}</span>
                </div>
                {aiuPct > 0 && (
                  <div className="text-center">
                    <span className="block text-3xs text-blue-500 uppercase">AIU ({aiuPct}%)</span>
                    <span className="font-mono font-bold text-blue-700">{formatCOP(aiuAmount)}</span>
                  </div>
                )}
                {ivaPct > 0 && (
                  <div className="text-center">
                    <span className="block text-3xs text-slate-400 uppercase">IVA ({ivaPct}%)</span>
                    <span className="font-mono font-bold text-slate-600">{formatCOP(ivaAmount)}</span>
                  </div>
                )}
                {retencionPct > 0 && (
                  <div className="text-center">
                    <span className="block text-3xs text-red-500 uppercase">Retefuente</span>
                    <span className="font-mono font-bold text-red-600">-{formatCOP(retencionAmount)}</span>
                  </div>
                )}
                <div className="text-center pl-3 border-l-2 border-slate-200">
                  <span className="block text-3xs text-slate-400 uppercase">TOTAL</span>
                  <span className="font-display font-black text-lg text-primary">{formatCOP(totalFinal)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAIUModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-2xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer">
                  <Percent className="h-3 w-3" /> AIU
                </button>
                <button onClick={guardarPresupuesto} disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-sm">
                  {guardando ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {editBudgetId ? 'Actualizando...' : 'Guardando...'}</> : <><Save className="h-3.5 w-3.5" /> {editBudgetId ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL AIU */}
      {/* ================================================================ */}
      {showAIUModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowAIUModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Settings className="h-4 w-4" /> Configuración de AIU</h3>
              <p className="text-xs text-blue-200 mt-0.5">Administración · Imprevistos · Utilidad</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">AIU (Admón + Imprevistos + Utilidad)</label>
                <div className="relative">
                  <input type="number" value={aiuPct} onChange={e => setAiuPct(Number(e.target.value))} min={0} max={100} step={0.5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                </div>
                <p className="text-3xs text-slate-400 mt-1">Porcentaje aplicado al costo directo (materiales + mano de obra + equipo + transporte)</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">IVA</label>
                <div className="relative">
                  <input type="number" value={ivaPct} onChange={e => setIvaPct(Number(e.target.value))} min={0} max={30} step={0.5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Retención en la fuente</label>
                <div className="relative">
                  <input type="number" value={retencionPct} onChange={e => setRetencionPct(Number(e.target.value))} min={0} max={20} step={0.5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAIUModal(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">Cancelar</button>
                <button onClick={() => setShowAIUModal(false)} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer">Aplicar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Añadir Ítem */}
      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddAPU={handleAgregarAPU}
      />
    </div>
  );
}

export default function NuevoPresupuestoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Cargando editor de presupuesto...</div>}>
      <NuevoPresupuestoContent />
    </Suspense>
  );
}
