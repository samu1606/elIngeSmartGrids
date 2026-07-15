import jsPDF from "jspdf";
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

/** Extract key parameters from result_data for table display */
export function getKeyParams(calc: SavedCalculation): { label: string; value: string }[] {
  const r = calc.result_data as Record<string, unknown>;
  const params: { label: string; value: string }[] = [];

  switch (calc.type) {
    case "seccion":
      params.push({ label: "Conductor", value: `${r.conductor} (${r.seccion_mm2} mm²)` });
      params.push({ label: "Corriente", value: `${r.corriente_nom} A` });
      params.push({ label: "Caída V%", value: `${r.caida_tension}%` });
      params.push({ label: "Tubería", value: String(r.diametro_canalizacion || "-") });
      break;
    case "proteccion":
      params.push({ label: "Breaker", value: `${r.breaker} A` });
      params.push({ label: "Carga", value: `${r.corriente_carga} A` });
      params.push({ label: "Factor", value: String(r.factor_usado || "-") });
      break;
    case "motor":
      params.push({ label: "Conductor", value: `${r.conductor} (${r.seccion_mm2} mm²)` });
      params.push({ label: "Breaker", value: `${r.breaker} A` });
      params.push({ label: "Térmico", value: String(r.thermal || "-") });
      params.push({ label: "Contactor", value: String(r.contactor || "-") });
      break;
    case "iluminacion":
      params.push({ label: "Luminarias", value: `${r.luminarias} uds` });
      params.push({ label: "Área", value: `${r.area} m²` });
      params.push({ label: "Distribución", value: String(r.distribucion || "-") });
      params.push({ label: "Carga", value: `${r.carga_total || 0} W` });
      break;
    case "reactiva":
      params.push({ label: "Banco", value: `${r.qc} kVAR` });
      params.push({ label: "Ahorro", value: `${r.ahorro_kva} kVA` });
      params.push({ label: "Retorno", value: `${r.retorno_inversion_meses || 0} meses` });
      break;
    case "puesta_tierra":
      params.push({ label: "Resistencia", value: `${typeof r.r_total === "number" ? (r.r_total as number).toFixed(2) : r.r_total} Ω` });
      params.push({ label: "Varillas", value: `${r.num_varillas || 0} uds` });
      params.push({ label: "Conductor", value: String(r.conductor_tierra || "-") });
      break;
    case "cuadro_cargas":
      params.push({ label: "Breaker", value: `${r.breaker_principal || "N/A"} A` });
      params.push({ label: "Alimentador", value: String(r.conductor_alimentador || "-") });
      params.push({ label: "Desbalance", value: `${r.desbalance_pct || 0}%` });
      break;
    case "caida_tension":
      params.push({ label: "Caída V", value: `${r.caida_total_v} V` });
      params.push({ label: "Caída %", value: `${r.caida_total_pct}%` });
      params.push({ label: "Cumple", value: r.cumple ? "Sí" : "No" });
      break;
    case "cortocircuito":
      params.push({ label: "Icc Punto", value: `${r.icc_punto_carga} A` });
      params.push({ label: "Icc Trafo", value: `${r.icc_trafo} A` });
      params.push({ label: "Nivel", value: String(r.nivel_cortocircuito || "-") });
      break;
    case "tuberias":
      params.push({ label: "Diámetro", value: String(r.diametro_seleccionado || "-") });
      params.push({ label: "Ocupación", value: `${r.pct_ocupacion || 0}%` });
      params.push({ label: "Tipo", value: String(r.tipo_tubo || "-") });
      break;
    case "transformadores":
      params.push({ label: "Potencia", value: `${r.kva_seleccionado} kVA` });
      params.push({ label: "Eficiencia", value: `${r.eficiencia_estimada_pct || 0}%` });
      params.push({ label: "Regulación", value: `${r.regulacion_pct || 0}%` });
      break;
    case "pararrayos":
      params.push({ label: "Nivel", value: String(r.nivel_proteccion || "-") });
      params.push({ label: "Unidades", value: `${r.num_pararrayos || 0}` });
      params.push({ label: "Radio", value: `${r.radio_proteccion_m || 0} m` });
      break;
    default:
      params.push({ label: "Resultado", value: JSON.stringify(r).slice(0, 80) });
  }

  return params;
}

/** Export calculation to PDF */
export function exportToPDF(calc: SavedCalculation) {
  const doc = new jsPDF();
  const typeLabel = TYPE_LABELS[calc.type] || calc.type;
  const params = getKeyParams(calc);
  let y = 25;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Memoria de Cálculo Eléctrico", 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tipo: ${typeLabel}`, 20, y);
  y += 6;
  doc.text(`Fecha: ${new Date(calc.created_at).toLocaleString()}`, 20, y);
  y += 8;

  // Divider
  doc.setDrawColor(200);
  doc.line(20, y, 190, y);
  y += 8;

  // Key Parameters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Parámetros Clave", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const p of params) {
    doc.text(`${p.label}:`, 25, y);
    doc.text(p.value, 80, y);
    y += 5.5;
  }
  y += 4;

  // Divider
  doc.line(20, y, 190, y);
  y += 8;

  // Input Data
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Datos de Entrada", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const inputEntries = Object.entries(calc.input_data);
  for (const [key, value] of inputEntries) {
    const valStr = typeof value === "object" ? JSON.stringify(value).slice(0, 60) : String(value);
    doc.text(`${key}:`, 25, y);
    doc.text(valStr, 80, y);
    y += 5;
    if (y > 270) {
      doc.addPage();
      y = 25;
    }
  }

  // Result Data (full)
  y += 4;
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Resultados Completos", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const resultEntries = Object.entries(calc.result_data);
  for (const [key, value] of resultEntries) {
    if (key === "justificacion" || key === "tabla_referencia") continue; // handled below
    const valStr = typeof value === "object" ? JSON.stringify(value).slice(0, 80) : String(value);
    doc.text(`${key}:`, 25, y);
    doc.text(valStr, 80, y);
    y += 5;
    if (y > 270) {
      doc.addPage();
      y = 25;
    }
  }

  // Justification
  const justificacion = calc.result_data["justificacion"] as string | undefined;
  if (justificacion) {
    y += 6;
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(8);
    doc.text("Justificación:", 20, y);
    y += 5;
    const lines = doc.splitTextToSize(justificacion, 170);
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 25; }
      doc.text(line, 20, y);
      y += 4;
    }
  }

  const filename = `${calc.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.pdf`;
  doc.save(filename);
}

/** Export calculation to Excel */
export function exportToExcel(calc: SavedCalculation) {
  const typeLabel = TYPE_LABELS[calc.type] || calc.type;
  const params = getKeyParams(calc);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryRows = [
    ["Tipo de Cálculo", typeLabel],
    ["Título", calc.title],
    ["Fecha", new Date(calc.created_at).toLocaleString()],
    [""],
    ["Parámetro", "Valor"],
    ...params.map((p) => [p.label, p.value]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws1["!cols"] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Resumen");

  // Sheet 2: Inputs
  const inputRows = [["Parámetro", "Valor"]];
  for (const [key, value] of Object.entries(calc.input_data)) {
    inputRows.push([key, String(value)]);
  }
  const ws2 = XLSX.utils.aoa_to_sheet(inputRows);
  ws2["!cols"] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Datos de Entrada");

  // Sheet 3: Results
  const resultRows = [["Parámetro", "Valor"]];
  for (const [key, value] of Object.entries(calc.result_data)) {
    resultRows.push([key, String(value)]);
  }
  const ws3 = XLSX.utils.aoa_to_sheet(resultRows);
  ws3["!cols"] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Resultados");

  const filename = `${calc.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export { TYPE_LABELS };
