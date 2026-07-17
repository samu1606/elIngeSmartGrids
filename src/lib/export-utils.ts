import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface SavedCalculation {
  id: string;
  type: string;
  title: string;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  seccion: "Sección de Conductor",
  proteccion: "Protecciones",
  motor: "Motores",
  iluminacion: "Iluminación",
  reactiva: "Compensación Reactiva",
  puesta_tierra: "Puesta a Tierra",
  cuadro_cargas: "Cuadro de Cargas",
  caida_tension: "Caída de Tensión",
  cortocircuito: "Cortocircuito",
  tuberias: "Tuberías",
  transformadores: "Transformadores",
  pararrayos: "Pararrayos",
};

// ── Colores corporativos ──
type RGB = [number, number, number];
const BRAND: Record<string, RGB> = {
  primary: [24, 46, 88],       // #182E58 azul oscuro
  accent: [238, 160, 24],      // #EEA018 dorado
  light: [241, 245, 249],      // #F1F5F9 gris claro
  success: [16, 185, 129],     // emerald
  danger: [239, 68, 68],       // red
  text: [30, 41, 59],          // slate-800
  muted: [148, 163, 184],      // slate-400
  white: [255, 255, 255],
  border: [226, 232, 240],     // slate-200
};

/** Traducir claves técnicas a etiquetas legibles */
const INPUT_LABELS: Record<string, string> = {
  potencia_kw: "Potencia (kW)",
  configuracion: "Sistema de Tensión",
  factor_potencia: "Factor de Potencia",
  material: "Material",
  aislamiento: "Aislamiento",
  longitud: "Longitud (m)",
  caida_tension_max: "Caída de Tensión Máx. (%)",
  temperatura_ambiente: "Temperatura Ambiente (°C)",
  num_conductores_agrupados: "Conductores Agrupados",
  temperatura_terminales: "Temperatura Bornes (°C)",
  carga_continua: "Carga Continua",
  potencia_hp: "Potencia (HP)",
  tension_nominal: "Tensión Nominal (V)",
  sistema: "Sistema",
  tramos: "Número de Tramos",
  tipo_carga: "Tipo de Carga",
  nivel_tension: "Nivel de Tensión",
  tipo_suelo: "Tipo de Suelo",
  resistividad: "Resistividad (Ω·m)",
  area: "Área (m²)",
  tipo_iluminacion: "Tipo de Iluminación",
  nivel_iluminancia: "Nivel de Iluminancia (lux)",
  corriente_icc: "Icc Disponible (A)",
  longitud_circuito: "Longitud Circuito (m)",
  tipo_proteccion: "Tipo de Protección",
  factor_agrupamiento: "Factor de Agrupamiento",
};

const RESULT_LABELS: Record<string, string> = {
  conductor: "Calibre Conductor",
  seccion_mm2: "Sección Transversal",
  corriente_nom: "Corriente Nominal",
  corriente_design: "Corriente de Diseño",
  ampacidad_terminales: "Ampacidad en Terminales",
  ampacidad_derated: "Ampacidad Corregida",
  columna_terminales: "Columna Terminales",
  columna_derating: "Columna Derating",
  criterio_seleccion: "Criterio de Selección",
  factor_temp: "Factor de Temperatura",
  factor_agrup: "Factor de Agrupamiento",
  caida_tension: "Caída de Tensión (%)",
  caida_cumple: "Cumple Caída",
  alerta_caida: "Alerta de Caída",
  justificacion: "Justificación Técnica",
  tabla_referencia: "Referencia Normativa",
  diametro_canalizacion: "Diámetro Tubería",
  calibre_tierra: "Calibre Conductor de Tierra",
  seccion_tierra_mm2: "Sección Tierra",
  calibre_neutro: "Calibre Conductor Neutro",
  seccion_neutro_mm2: "Sección Neutro",
  total_conductores_tuberia: "Total Conductores en Tubería",
  breaker: "Interruptor Automático",
  corriente_carga: "Corriente de Carga",
  factor_usado: "Factor de Uso",
  thermal: "Relé Térmico",
  contactor: "Contactor",
  luminarias: "Cantidad Luminarias",
  distribucion: "Distribución",
  carga_total: "Carga Total",
  qc: "Banco de Capacitores",
  ahorro_kva: "Ahorro en kVA",
  retorno_inversion_meses: "Retorno de Inversión",
  r_total: "Resistencia Total",
  num_varillas: "Número de Varillas",
  conductor_tierra: "Conductor de Tierra",
  breaker_principal: "Interruptor Principal",
  conductor_alimentador: "Conductor Alimentador",
  desbalance_pct: "Desbalance (%)",
  caida_total_v: "Caída Total (V)",
  caida_total_pct: "Caída Total (%)",
  cumple: "Cumple NTC 2050",
  cumple_ramales_3pct: "Cumple Ramales ≤3%",
  cumple_total_5pct: "Cumple Total ≤5%",
  icc_punto_carga: "Icc en Punto de Carga",
  icc_trafo: "Icc en Transformador",
  nivel_cortocircuito: "Nivel de Cortocircuito",
  pct_ocupacion: "Ocupación (%)",
  tipo_tubo: "Tipo de Tubería",
  diametro_seleccionado: "Diámetro Seleccionado",
  kva_seleccionado: "Potencia (kVA)",
  eficiencia_estimada_pct: "Eficiencia (%)",
  regulacion_pct: "Regulación (%)",
  nivel_proteccion: "Nivel de Protección",
  num_pararrayos: "Cantidad Pararrayos",
  radio_proteccion_m: "Radio de Protección (m)",
  detalle_tramos: "Detalle por Tramo",
};

const SISTEMA_LABELS: Record<string, string> = {
  mono_120: "Monofásico 120V (1F + 1N)",
  mono_208: "Bifásico 120/208V (2F + 1N)",
  mono_240: "Monofásico 120/240V (2F + 1N)",
  tri_208: "Trifásico 120/208V (3F + 1N)",
  tri_220: "Trifásico 220V (3F)",
  tri_440: "Trifásico 440V (3F)",
};

const AISLAMIENTO_LABELS: Record<string, string> = {
  tw: "TW (60°C)",
  uf: "UF (60°C)",
  thw: "THW (75°C)",
  thwn: "THWN (75°C)",
  thhn: "THHN (90°C)",
  xlpe: "XLPE (90°C)",
};

/** Format value for display */
function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(2);
  }
  return String(v);
}

function fmtUnit(v: unknown, unit: string): string {
  return `${fmt(v)} ${unit}`;
}

function inputLabel(key: string): string {
  return INPUT_LABELS[key] || key.replace(/_/g, " ");
}

function resultLabel(key: string): string {
  return RESULT_LABELS[key] || key.replace(/_/g, " ");
}

function inputVal(key: string, val: unknown): string {
  if (key === "configuracion" && typeof val === "string") return SISTEMA_LABELS[val] || val;
  if (key === "aislamiento" && typeof val === "string") return AISLAMIENTO_LABELS[val] || val;
  if (key === "material" && typeof val === "string") return val === "cu" ? "Cobre (Cu)" : "Aluminio (Al)";
  if (key === "carga_continua" && typeof val === "boolean") return val ? "Sí (125%)" : "No (100%)";
  return fmt(val);
}

// ── NTC 2050 Engineering Notes ──

interface NormRef {
  article: string;
  description: string;
  application: string;
}

function getNormativeReferences(type: string, input: Record<string, unknown>, result: Record<string, unknown>): NormRef[] {
  const refs: NormRef[] = [];

  switch (type) {
    case "seccion": {
      refs.push({
        article: "NTC 2050 Art. 110-14(c)",
        description: "Limitaciones de temperatura en terminales",
        application: `Terminales evaluadas a ${input.temperatura_terminales || 60}°C. La corriente no debe exceder la ampacidad de la columna correspondiente (${result.columna_terminales || "60°C"}).`,
      });
      refs.push({
        article: "NTC 2050 Tabla 310-16",
        description: "Ampacidad de conductores aislados (0-2000V)",
        application: `Ampacidad base del conductor ${result.conductor || "N/A"} a ${result.columna_derating || "75°C"} para ${input.material === "al" ? "aluminio" : "cobre"}.`,
      });
      if (result.factor_temp && result.factor_temp !== 1) {
        refs.push({
          article: "NTC 2050 Tabla 310.15(B)(2)(a)",
          description: "Corrección por temperatura ambiente",
          application: `Factor de corrección ${result.factor_temp} para temperatura ambiente de ${input.temperatura_ambiente || 30}°C.`,
        });
      }
      if (result.factor_agrup && result.factor_agrup !== 1) {
        refs.push({
          article: "NTC 2050 Tabla 310.15(B)(3)(a)",
          description: "Factor de ajuste por agrupamiento",
          application: `Factor ${result.factor_agrup} para ${input.num_conductores_agrupados || 3} conductores portadores de corriente en canalización.`,
        });
      }
      refs.push({
        article: "NTC 2050 Art. 210-19(A) Nota 4",
        description: "Caída de tensión en circuitos ramales",
        application: `Caída de tensión calculada: ${result.caida_tension || "N/A"}%. Límite recomendado: ${input.caida_tension_max || 3}%. ${result.caida_cumple ? "CUMPLE." : "NO CUMPLE — requiere recalibración."}`,
      });
      if (input.carga_continua) {
        refs.push({
          article: "NTC 2050 Art. 210-19(A)(1)",
          description: "Carga continua — factor 125%",
          application: "Corriente de diseño = corriente nominal × 1.25 por operación ≥ 3 horas.",
        });
      }
      refs.push({
        article: "NTC 2050 Tabla 250-122",
        description: "Dimensionamiento conductor de puesta a tierra",
        application: `Conductor de tierra: ${result.calibre_tierra || "N/A"} (${result.seccion_tierra_mm2 || "—"} mm²) según capacidad del dispositivo de protección.`,
      });
      refs.push({
        article: "NTC 2050 Capítulo 9 — Tabla 4 y 5",
        description: "Dimensiones de tubos conduit y área de conductores",
        application: `Tubería calculada: Ø ${result.diametro_canalizacion || "N/A"} para ${result.total_conductores_tuberia || 0} conductores.`,
      });
      break;
    }
    case "proteccion": {
      refs.push({
        article: "NTC 2050 Art. 240-4",
        description: "Protección de conductores",
        application: `Protección seleccionada: breaker ${result.breaker || "N/A"} A. La protección debe ser ≤ ampacidad del conductor corregida.`,
      });
      refs.push({
        article: "NTC 2050 Art. 240-6(A)",
        description: "Tamaños normalizados de interruptores",
        application: `Se verifica que ${result.breaker || "N/A"} A corresponde a un tamaño normalizado.`,
      });
      refs.push({
        article: "NTC 2050 Art. 240-4(B)",
        description: "Dispositivos de protección — regla del siguiente tamaño superior",
        application: result.factor_usado ? `Factor de ajuste aplicado: ${result.factor_usado}x.` : "No se requirió ajuste adicional de factor.",
      });
      break;
    }
    case "motor": {
      refs.push({
        article: "NTC 2050 Art. 430-22",
        description: "Dimensionamiento de conductores para motores",
        application: "Conductor dimensionado al 125% de la corriente nominal del motor (FLC).",
      });
      refs.push({
        article: "NTC 2050 Art. 430-52",
        description: "Protección contra cortocircuito y falla a tierra",
        application: `Interruptor automático seleccionado: ${result.breaker || "N/A"} A según tabla 430.52.`,
      });
      refs.push({
        article: "NTC 2050 Art. 430-32",
        description: "Protección contra sobrecarga del motor",
        application: `Relé térmico ajustado a: ${result.thermal || "N/A"}. Contactor: ${result.contactor || "N/A"}.`,
      });
      refs.push({
        article: "NTC 2050 Tabla 430-250",
        description: "Corriente a plena carga (FLC) de motores trifásicos",
        application: "Valores FLC de referencia según tensión y potencia del motor.",
      });
      break;
    }
    case "puesta_tierra": {
      refs.push({
        article: "NTC 2050 Art. 250-52",
        description: "Electrodos de puesta a tierra — tipos e instalación",
        application: `Electrodos requeridos: ${result.num_varillas || "—"} varilla(s). Resistencia objetivo: ≤ 25 Ω.`,
      });
      refs.push({
        article: "NTC 2050 Art. 250-66",
        description: "Dimensionamiento del conductor del electrodo de puesta a tierra",
        application: `Conductor de electrodo: ${result.conductor_tierra || "N/A"}.`,
      });
      refs.push({
        article: "NTC 2050 Art. 250-53(A)(2)",
        description: "Electrodo suplementario si R > 25 Ω",
        application: Number(result.r_total) > 25 ? "Se requiere electrodo suplementario (resistencia > 25 Ω)." : "No requiere electrodo suplementario (resistencia ≤ 25 Ω).",
      });
      refs.push({
        article: "RETIE Art. 15",
        description: "Requisitos de puesta a tierra en instalaciones eléctricas",
        application: "Cumplimiento de valores máximos de resistencia según RETIE para sistemas de baja tensión.",
      });
      break;
    }
    case "caida_tension": {
      refs.push({
        article: "NTC 2050 Art. 210-19(A) Nota 4",
        description: "Caída de tensión en circuitos ramales — máximo 3%",
        application: `Cumple ramales ≤ 3%: ${result.cumple_ramales_3pct ? "Sí ✓" : "No ✗"}`,
      });
      refs.push({
        article: "NTC 2050 Art. 215-2(A)(3) Nota 2",
        description: "Caída de tensión en alimentadores — máximo 5% total",
        application: `Cumple total ≤ 5%: ${result.cumple_total_5pct ? "Sí ✓" : "No ✗"}. Caída total: ${result.caida_total_pct || "N/A"}%.`,
      });
      refs.push({
        article: "RETIE Art. 20.2.1",
        description: "Regulación de tensión en instalaciones eléctricas",
        application: "La caída de tensión no debe afectar el funcionamiento de los equipos conectados.",
      });
      break;
    }
    case "cortocircuito": {
      refs.push({
        article: "NTC 2050 Art. 110-9",
        description: "Capacidad interruptiva — corriente de cortocircuito",
        application: `Icc en punto de carga: ${result.icc_punto_carga || "N/A"} A. El equipo debe tener capacidad interruptiva ≥ Icc calculada.`,
      });
      refs.push({
        article: "NTC 2050 Art. 110-10",
        description: "Protección contra corrientes de falla",
        application: "Los componentes del circuito deben soportar los esfuerzos térmicos y mecánicos de la Icc disponible.",
      });
      break;
    }
    case "cuadro_cargas": {
      refs.push({
        article: "NTC 2050 Art. 220",
        description: "Cálculo de cargas de circuitos ramales y alimentadores",
        application: `Interruptor principal: ${result.breaker_principal || "N/A"} A. Alimentador: ${result.conductor_alimentador || "N/A"}.`,
      });
      refs.push({
        article: "NTC 2050 Art. 408",
        description: "Tableros de distribución — requisitos de instalación",
        application: "El desbalance entre fases no debe exceder los límites de diseño del tablero.",
      });
      break;
    }
    case "iluminacion": {
      refs.push({
        article: "NTC 2050 Art. 220-12",
        description: "Cargas de alumbrado general por metro cuadrado",
        application: `Área de diseño: ${result.area || "N/A"} m². Carga total de iluminación: ${result.carga_total || "N/A"} W.`,
      });
      refs.push({
        article: "RETIE Art. 17",
        description: "Requisitos de iluminación en edificaciones",
        application: "Cumplimiento de niveles mínimos de iluminancia según tipo de espacio.",
      });
      break;
    }
    case "reactiva": {
      refs.push({
        article: "NTC 2050 Art. 460",
        description: "Bancos de capacitores — instalación y dimensionamiento",
        application: `Banco de ${result.qc || "N/A"} kVAR. Ahorro estimado: ${result.ahorro_kva || "N/A"} kVA.`,
      });
      refs.push({
        article: "RETIE Art. 20.2.2",
        description: "Factor de potencia en instalaciones eléctricas",
        application: "El factor de potencia debe ser ≥ 0.90 para evitar penalización por energía reactiva.",
      });
      break;
    }
    case "tuberias": {
      refs.push({
        article: "NTC 2050 Capítulo 9 — Tablas 4 y 5",
        description: "Dimensiones de tuberías y área ocupada por conductores",
        application: `Tubería: ${result.diametro_seleccionado || "N/A"}, ocupación: ${result.pct_ocupacion || "N/A"}%. Tipo: ${result.tipo_tubo || "PVC"}.`,
      });
      refs.push({
        article: "NTC 2050 Art. 352",
        description: "Tubo conduit rígido de PVC — usos permitidos",
        application: "Se verifica que la ocupación máxima no exceda los límites establecidos para el tipo de instalación.",
      });
      break;
    }
    case "transformadores": {
      refs.push({
        article: "NTC 2050 Art. 450-3",
        description: "Protección de transformadores — sobrecorriente",
        application: `Transformador: ${result.kva_seleccionado || "N/A"} kVA, eficiencia: ${result.eficiencia_estimada_pct || "N/A"}%.`,
      });
      refs.push({
        article: "NTC 2050 Art. 450-21",
        description: "Transformadores tipo seco — ventilación",
        application: "Se debe garantizar ventilación adecuada según las pérdidas del transformador.",
      });
      break;
    }
    case "pararrayos": {
      refs.push({
        article: "NTC 2050 Art. 280",
        description: "Descargadores de sobretensión (SPD) — requisitos generales",
        application: `Nivel de protección: ${result.nivel_proteccion || "N/A"}. Pararrayos requeridos: ${result.num_pararrayos || "N/A"}.`,
      });
      refs.push({
        article: "RETIE Art. 16",
        description: "Protección contra sobretensiones transitorias",
        application: `Radio de protección: ${result.radio_proteccion_m || "N/A"} m según método de esfera rodante.`,
      });
      break;
    }
    default: {
      refs.push({
        article: "NTC 2050",
        description: "Código Eléctrico Colombiano",
        application: "Este cálculo se ha realizado con base en los requisitos de la NTC 2050 y el RETIE vigente.",
      });
    }
  }

  return refs;
}

// ── Drawing helpers ──

function drawHeader(doc: jsPDF, typeLabel: string, date: string, yStart: number): number {
  let y = yStart;

  // Superior rectangle (brand bar)
  doc.setFillColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.rect(0, 0, 210, 28, "F");

  // Accent line
  doc.setFillColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.rect(0, 28, 210, 3, "F");

  // Logo text (styled as SVG-like text brand)
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("EL INGE", 14, 14);
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text("SMART GRIDS", 45.5, 14);
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 210);
  doc.setFont("helvetica", "normal");
  doc.text("INGENIERIA ELECTRICA — DISENO Y CONSULTORIA", 14, 21);

  y = 40;

  // Title block
  doc.setFillColor(BRAND.light[0], BRAND.light[1], BRAND.light[2]);
  doc.roundedRect(14, y, 182, 22, 2, 2, "F");

  doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("MEMORIA DE CALCULO ELECTRICO", 18, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text(`Tipo: ${typeLabel}`, 18, y + 18);

  // Date and metadata right-aligned
  doc.setFontSize(7.5);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text(`Fecha: ${date}`, 196, y + 8, { align: "right" });
  doc.text("Norma: NTC 2050 / RETIE", 196, y + 14, { align: "right" });
  doc.text("Elaborado por: El Inge SMART GRIDS", 196, y + 19, { align: "right" });

  return y + 28;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.roundedRect(14, y, 182, 8, 1.5, 1.5, "F");
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title, 18, y + 5.6);
  return y + 12;
}

// ── Main export functions ──

/** Extract key parameters from result_data for table display */
export function getKeyParams(calc: SavedCalculation): { label: string; value: string }[] {
  const r = calc.result_data as Record<string, unknown>;
  const params: { label: string; value: string }[] = [];

  switch (calc.type) {
    case "seccion":
      params.push({ label: "Conductor", value: `${r.conductor || "—"} (${r.seccion_mm2 || "—"} mm²)` });
      params.push({ label: "Corriente", value: `${r.corriente_nom || "—"} A` });
      params.push({ label: "Caída V%", value: `${r.caida_tension ?? "—"}%` });
      params.push({ label: "Tubería", value: String(r.diametro_canalizacion || "—") });
      break;
    case "proteccion":
      params.push({ label: "Breaker", value: `${r.breaker || "—"} A` });
      params.push({ label: "Carga", value: `${r.corriente_carga || "—"} A` });
      params.push({ label: "Factor", value: String(r.factor_usado || "—") });
      break;
    case "motor":
      params.push({ label: "Conductor", value: `${r.conductor || "—"} (${r.seccion_mm2 || "—"} mm²)` });
      params.push({ label: "Breaker", value: `${r.breaker || "—"} A` });
      params.push({ label: "Térmico", value: String(r.thermal || "—") });
      params.push({ label: "Contactor", value: String(r.contactor || "—") });
      break;
    case "iluminacion":
      params.push({ label: "Luminarias", value: `${r.luminarias || "—"} uds` });
      params.push({ label: "Área", value: `${r.area || "—"} m²` });
      params.push({ label: "Distribución", value: String(r.distribucion || "—") });
      params.push({ label: "Carga", value: `${r.carga_total || 0} W` });
      break;
    case "reactiva":
      params.push({ label: "Banco", value: `${r.qc || "—"} kVAR` });
      params.push({ label: "Ahorro", value: `${r.ahorro_kva || "—"} kVA` });
      params.push({ label: "Retorno", value: `${r.retorno_inversion_meses || 0} meses` });
      break;
    case "puesta_tierra":
      params.push({
        label: "Resistencia",
        value: `${typeof r.r_total === "number" ? (r.r_total as number).toFixed(2) : r.r_total || "—"} Ω`,
      });
      params.push({ label: "Varillas", value: `${r.num_varillas || 0} uds` });
      params.push({ label: "Conductor", value: String(r.conductor_tierra || "—") });
      break;
    case "cuadro_cargas":
      params.push({ label: "Breaker Gral", value: `${r.breaker_principal || "N/A"} A` });
      params.push({ label: "Alimentador", value: String(r.conductor_alimentador || "—") });
      params.push({ label: "Desbalance", value: `${r.desbalance_pct || 0}%` });
      break;
    case "caida_tension":
      params.push({ label: "Caída V", value: `${r.caida_total_v || "—"} V` });
      params.push({ label: "Caída %", value: `${r.caida_total_pct || "—"}%` });
      params.push({ label: "Cumple", value: r.cumple ? "Sí" : "No" });
      break;
    case "cortocircuito":
      params.push({ label: "Icc Punto", value: `${r.icc_punto_carga || "—"} A` });
      params.push({ label: "Icc Trafo", value: `${r.icc_trafo || "—"} A` });
      params.push({ label: "Nivel", value: String(r.nivel_cortocircuito || "—") });
      break;
    case "tuberias":
      params.push({ label: "Diámetro", value: String(r.diametro_seleccionado || "—") });
      params.push({ label: "Ocupación", value: `${r.pct_ocupacion || 0}%` });
      params.push({ label: "Tipo", value: String(r.tipo_tubo || "—") });
      break;
    case "transformadores":
      params.push({ label: "Potencia", value: `${r.kva_seleccionado || "—"} kVA` });
      params.push({ label: "Eficiencia", value: `${r.eficiencia_estimada_pct || 0}%` });
      params.push({ label: "Regulación", value: `${r.regulacion_pct || 0}%` });
      break;
    case "pararrayos":
      params.push({ label: "Nivel", value: String(r.nivel_proteccion || "—") });
      params.push({ label: "Unidades", value: `${r.num_pararrayos || 0}` });
      params.push({ label: "Radio", value: `${r.radio_proteccion_m || 0} m` });
      break;
    default:
      params.push({ label: "Resultado", value: JSON.stringify(r).slice(0, 80) });
  }

  return params;
}

/** Export calculation to professional PDF "Memoria de Cálculo Técnico" */
export function exportToPDF(calc: SavedCalculation) {
  const doc = new jsPDF();
  const typeLabel = TYPE_LABELS[calc.type] || calc.type;
  const date = new Date(calc.created_at).toLocaleString("es-CO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const resultData = calc.result_data as Record<string, unknown>;
  const inputData = calc.input_data as Record<string, unknown>;
  const params = getKeyParams(calc);
  const normRefs = getNormativeReferences(calc.type, inputData, resultData);

  let y = drawHeader(doc, typeLabel, date, 0);

  // ── 1. RESUMEN / PROYECTO ──
  // Build a summary table
  y = drawSectionTitle(doc, "1.  RESUMEN DE RESULTADOS", y);

  const summaryRows = params.map((p) => [p.label, p.value]);
  autoTable(doc, {
    startY: y,
    head: [["Parametro", "Valor"]],
    body: summaryRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: BRAND.text,
      lineColor: BRAND.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND.primary as [number, number, number],
      textColor: BRAND.white as [number, number, number],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    tableWidth: 182,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 2. PARÁMETROS DE DISEÑO ──
  y = drawSectionTitle(doc, "2.  PARAMETROS DE DISENO (DATOS DE ENTRADA)", y);

  const inputRows = Object.entries(inputData)
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([key, val]) => [inputLabel(key), inputVal(key, val)]);

  autoTable(doc, {
    startY: y,
    head: [["Parametro de Diseno", "Valor / Especificacion"]],
    body: inputRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 3,
      textColor: BRAND.text,
      lineColor: BRAND.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND.primary as [number, number, number],
      textColor: BRAND.white as [number, number, number],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 64 },
      1: { cellWidth: 118 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 182,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 3. RESULTADOS DE CÁLCULO ──
  y = drawSectionTitle(doc, "3.  RESULTADOS DE CALCULO", y);

  // Exclude justification/reference fields (shown in their own section)
  const resultRows = Object.entries(resultData)
    .filter(([key]) => key !== "justificacion" && key !== "tabla_referencia" && !key.startsWith("_"))
    .map(([key, val]) => {
      const lbl = resultLabel(key);
      let displayVal: string;
      if (key === "detalle_tramos" && Array.isArray(val)) {
        displayVal = `${val.length} tramo(s)`;
      } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        displayVal = JSON.stringify(val).slice(0, 80);
      } else {
        displayVal = fmt(val);
      }
      return [lbl, displayVal];
    });

  autoTable(doc, {
    startY: y,
    head: [["Variable Calculada", "Resultado"]],
    body: resultRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 3,
      textColor: BRAND.text,
      lineColor: BRAND.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND.primary as [number, number, number],
      textColor: BRAND.white as [number, number, number],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 64 },
      1: { cellWidth: 118 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 182,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 4. JUSTIFICACIÓN NORMATIVA ──
  y = drawSectionTitle(doc, "4.  NOTAS DE INGENIERIA — REFERENCIAS NORMATIVAS", y);

  // Normative references table
  const normRows = normRefs.map((ref) => [
    ref.article,
    ref.description,
    ref.application,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Articulo NTC 2050 / RETIE", "Descripcion", "Aplicacion en este Calculo"]],
    body: normRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 3,
      textColor: BRAND.text,
      lineColor: BRAND.border,
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: BRAND.primary as [number, number, number],
      textColor: BRAND.white as [number, number, number],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 52 },
      1: { cellWidth: 46 },
      2: { cellWidth: 84 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 182,
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ── 5. JUSTIFICACIÓN TÉCNICA (texto libre) ──
  const justificacion = resultData["justificacion"] as string | undefined;
  const tablaRef = resultData["tabla_referencia"] as string | undefined;

  if (justificacion || tablaRef) {
    y = drawSectionTitle(doc, "5.  MEMORIA JUSTIFICATIVA", y);

    if (justificacion) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(BRAND.text[0], BRAND.text[1], BRAND.text[2]);
      const lines = doc.splitTextToSize(`"${justificacion}"`, 178);
      for (const line of lines) {
        if (y > 272) { doc.addPage(); y = 25; }
        doc.text(line, 16, y);
        y += 4.5;
      }
      y += 4;
    }

    if (tablaRef) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
      doc.text(`Referencia: ${tablaRef}`, 16, y);
      y += 6;
    }
  }

  // ── FOOTER ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Bottom line
    doc.setDrawColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 284, 196, 284);
    // Footer text
    doc.setFontSize(6.5);
    doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
    doc.setFont("helvetica", "normal");
    doc.text("El Inge SMART GRIDS — Memoria de Cálculo Eléctrico — NTC 2050 / RETIE", 14, 289);
    doc.text(`Página ${i} de ${pageCount}`, 196, 289, { align: "right" });
  }

  const filename = `${calc.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.pdf`;
  doc.save(filename);
}

/** Export calculation to Excel */
export function exportToExcel(calc: SavedCalculation) {
  const typeLabel = TYPE_LABELS[calc.type] || calc.type;
  const params = getKeyParams(calc);
  const resultData = calc.result_data as Record<string, unknown>;
  const inputData = calc.input_data as Record<string, unknown>;
  const normRefs = getNormativeReferences(calc.type, inputData, resultData);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryRows = [
    ["EL INGE SMART GRIDS — MEMORIA DE CÁLCULO ELÉCTRICO"],
    [""],
    ["Tipo de Cálculo", typeLabel],
    ["Título", calc.title],
    ["Fecha", new Date(calc.created_at).toLocaleString()],
    ["Norma Aplicable", "NTC 2050 / RETIE"],
    [""],
    ["RESUMEN DE RESULTADOS"],
    ["Parámetro", "Valor"],
    ...params.map((p) => [p.label, p.value]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws1["!cols"] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Resumen");

  // Sheet 2: Design Parameters
  const inputRows: string[][] = [["Parámetro de Diseño", "Valor"]];
  for (const [key, value] of Object.entries(inputData)) {
    inputRows.push([inputLabel(key), inputVal(key, value)]);
  }
  const ws2 = XLSX.utils.aoa_to_sheet(inputRows);
  ws2["!cols"] = [{ wch: 35 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Parámetros de Diseño");

  // Sheet 3: Results
  const resultRows: string[][] = [["Variable Calculada", "Resultado"]];
  for (const [key, value] of Object.entries(resultData)) {
    if (key === "justificacion" || key === "tabla_referencia") continue;
    resultRows.push([resultLabel(key), fmt(value)]);
  }
  const ws3 = XLSX.utils.aoa_to_sheet(resultRows);
  ws3["!cols"] = [{ wch: 35 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Resultados");

  // Sheet 4: Normative References
  const normRows: string[][] = [
    ["Artículo NTC 2050 / RETIE", "Descripción", "Aplicación en este Cálculo"],
    ...normRefs.map((r) => [r.article, r.description, r.application]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(normRows);
  ws4["!cols"] = [{ wch: 40 }, { wch: 45 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Referencias Normativas");

  const filename = `${calc.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export { TYPE_LABELS };
