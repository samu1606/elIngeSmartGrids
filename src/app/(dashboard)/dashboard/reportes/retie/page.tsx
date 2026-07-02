"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  BarChart3,
  ClipboardCheck,
  UserCheck,
  Calculator,
  Wrench,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Target,
  ExternalLink,
  Filter,
  ChevronDown,
} from "lucide-react";

// =============================================================================
// TIPOS
// =============================================================================

interface RetieItem {
  id: string;
  titulo: string;
  norma_ref: string;
  calculable_por_app: boolean;
  aplica: boolean;
  estado: string;
  contenido: string | null;
}

interface RetieDocumento {
  tipo_documento: string;
  clasificacion: {
    tipo_diseno: string;
    razon: string;
    articulo_aplicable: string;
  };
  datos_proyecto: {
    nombre: string;
    direccion: string;
    tipo_instalacion: string;
    kva_instalados: number;
    num_cuentas: number;
    fecha_emision: string;
  };
  items_diseno: RetieItem[];
  resumen_cumplimiento: {
    total_items_retie: number;
    items_aplican: number;
    items_calculados_por_app: number;
    items_requieren_profesional: number;
    porcentaje_automatizado: number;
  };
  declaracion_responsabilidad: string;
  firma_digital: {
    nombre_disenador: string;
    matricula_profesional: string;
    requiere_firma: boolean;
  };
}

const TIPOS_INSTALACION: Record<string, string> = {
  vivienda_unifamiliar: "Vivienda Unifamiliar",
  vivienda_multifamiliar: "Vivienda Multifamiliar",
  comercial: "Comercial",
  industrial: "Industrial",
  institucional: "Institucional (Educación/Salud)",
  grandes_superficies: "Grandes Superficies",
  urbanizacion: "Urbanización/Conjunto",
  generacion_fncer: "Generación FNCER (Solar/Eólica)",
  subestacion: "Subestación Eléctrica",
  provisional: "Instalación Provisional",
  otro: "Otro",
};

// Mapeo de ítems calculables a las tabs de la calculadora
const CALC_LINKS: Record<string, { label: string; tab: string }> = {
  c: { label: "Calcular Cargas", tab: "seccion" },
  f: { label: "Calcular Tensión", tab: "seccion" },
  i: { label: "Calcular Puesta a Tierra", tab: "puesta_tierra" },
  j: { label: "Calcular Conductor Económico", tab: "seccion" },
  k: { label: "Dimensionar Conductor", tab: "seccion" },
  m: { label: "Coordinar Protecciones", tab: "protecciones" },
  n: { label: "Calcular Canalización", tab: "seccion" },
  o: { label: "Calcular Reactiva", tab: "reactiva" },
  p: { label: "Verificar Regulación", tab: "seccion" },
};

type FilterType = "todos" | "calculable" | "profesional";

export default function RetieReportPage() {
  const router = useRouter();
  const apiUrl = getApiUrl();

  // Form state
  const [tipoInstalacion, setTipoInstalacion] = useState("vivienda_unifamiliar");
  const [kvaInstalados, setKvaInstalados] = useState(8);
  const [numCuentas, setNumCuentas] = useState(1);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [direccionProyecto, setDireccionProyecto] = useState("");
  const [nombreDisenador, setNombreDisenador] = useState("Edwin Quintero");
  const [matriculaProfesional, setMatriculaProfesional] = useState("EL-");
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split("T")[0]);

  // Results
  const [documento, setDocumento] = useState<RetieDocumento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<FilterType>("todos");

  const generarDocumento = async () => {
    setError(null);
    setLoading(true);

    if (!nombreProyecto.trim()) {
      setError("El nombre del proyecto es obligatorio.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/retie/generar-documento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_instalacion: tipoInstalacion,
          kva_instalados: kvaInstalados,
          num_cuentas: numCuentas,
          nombre_proyecto: nombreProyecto,
          direccion_proyecto: direccionProyecto || null,
          nombre_disenador: nombreDisenador,
          matricula_profesional: matriculaProfesional,
          fecha_emision: fechaEmision,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al generar documento.");
      }

      const data = await res.json();
      setDocumento(data);
      setFilterTipo("todos");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const imprimirDocumento = () => {
    window.print();
  };

  const abrirCalculadora = (tab: string) => {
    router.push(`/dashboard/calculadora?tab=${tab}`);
  };

  // Filtrar items
  const itemsFiltrados = documento?.items_diseno.filter((item) => {
    if (!item.aplica) return false;
    if (filterTipo === "calculable") return item.calculable_por_app;
    if (filterTipo === "profesional") return !item.calculable_por_app;
    return true;
  }) || [];

  // Estado visual para items
  const estadoConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    calculado_por_app: {
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      icon: CheckCircle2,
      label: "Calculado por App",
    },
    requiere_profesional: {
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      icon: UserCheck,
      label: "Requiere Profesional",
    },
    no_aplica_diseno_simplificado: {
      color: "text-slate-500",
      bg: "bg-white border-slate-200",
      icon: Shield,
      label: "No Aplica",
    },
    no_aplica_tipo_instalacion: {
      color: "text-slate-500",
      bg: "bg-white border-slate-200",
      icon: Shield,
      label: "No Aplica",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Reportes
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Shield className="h-6 w-6" />
            </div>
            Memoria de Diseño RETIE 2024
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Documento oficial de cumplimiento conforme al RETIE 2024 Título 3 — Artículo 3.3.1.1.
            Clasifica automáticamente entre diseño simplificado y detallado según carga y tipo de instalación.
          </p>
        </div>

        {documento && (
          <button
            onClick={imprimirDocumento}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-blue-600/20 print:hidden"
          >
            <Printer className="h-5 w-5" />
            Imprimir / Guardar PDF
          </button>
        )}
      </div>

      {/* ================================================================ */}
      {/* FORMULARIO */}
      {/* ================================================================ */}
      {!documento && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Datos del Proyecto</h2>
              <p className="text-xs text-slate-500 mt-0.5">Complete la información para generar la memoria de diseño</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tipo de Instalación */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipo de Instalación
              </label>
              <select
                value={tipoInstalacion}
                onChange={(e) => setTipoInstalacion(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                {Object.entries(TIPOS_INSTALACION).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Carga Instalada */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Carga Instalada (kVA)
              </label>
              <input
                type="number"
                value={kvaInstalados}
                onChange={(e) => setKvaInstalados(Number(e.target.value))}
                min={1}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="text-2xs text-slate-400 mt-1">
                ≤10 kVA = Diseño Simplificado | &gt;10 kVA = Diseño Detallado
              </p>
            </div>

            {/* Nº Cuentas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nº de Cuentas / Medidores
              </label>
              <input
                type="number"
                value={numCuentas}
                onChange={(e) => setNumCuentas(Number(e.target.value))}
                min={1}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="text-2xs text-slate-400 mt-1">
                &gt;4 cuentas requiere Diseño Detallado (Art. 10.1.2)
              </p>
            </div>

            {/* Nombre Proyecto */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre del Proyecto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombreProyecto}
                onChange={(e) => setNombreProyecto(e.target.value)}
                placeholder="Ej: Instalación Eléctrica Local Comercial Centro"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dirección del Proyecto
              </label>
              <input
                type="text"
                value={direccionProyecto}
                onChange={(e) => setDireccionProyecto(e.target.value)}
                placeholder="Cra 10 # 20-30, Bogotá D.C."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Diseñador */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ingeniero Diseñador
              </label>
              <input
                type="text"
                value={nombreDisenador}
                onChange={(e) => setNombreDisenador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Matrícula Profesional
              </label>
              <input
                type="text"
                value={matriculaProfesional}
                onChange={(e) => setMatriculaProfesional(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fecha de Emisión
              </label>
              <input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={generarDocumento}
              disabled={loading}
              className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3 text-base font-bold text-white hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-blue-600/25 min-h-[48px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generando documento...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Generar Documento RETIE
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* DOCUMENTO GENERADO */}
      {/* ================================================================ */}
      {documento && (
        <div className="space-y-6 print:space-y-4">
          {/* PORTADA */}
          <div className="rounded-2xl border border-blue-200 bg-white shadow-md overflow-hidden">
            {/* Encabezado */}
            <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-white p-8 sm:p-10 border-b border-blue-200 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-600/20 px-5 py-1.5 text-sm font-bold text-blue-700 mb-4">
                <Shield className="h-4 w-4" />
                REPÚBLICA DE COLOMBIA — RETIE 2024
              </div>
              <h2 className="text-3xl font-black text-slate-900 font-display leading-tight">
                {documento.tipo_documento}
              </h2>
              <h3 className="text-xl font-bold text-slate-700 mt-3 font-display">
                {documento.datos_proyecto.nombre}
              </h3>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-4 text-sm text-slate-500 font-medium">
                {documento.datos_proyecto.direccion && <span>📍 {documento.datos_proyecto.direccion}</span>}
                <span>📅 {documento.datos_proyecto.fecha_emision}</span>
                <span>⚡ {documento.datos_proyecto.kva_instalados} kVA</span>
                <span>🔢 {documento.datos_proyecto.num_cuentas} cuenta(s)</span>
              </div>
            </div>

            {/* CLASIFICACIÓN */}
            <div className={`p-6 ${
              documento.clasificacion.tipo_diseno === "detallado"
                ? "bg-red-50/80 border-b border-red-200"
                : "bg-emerald-50/80 border-b border-emerald-200"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  documento.clasificacion.tipo_diseno === "detallado"
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className={`text-lg font-bold font-display ${
                    documento.clasificacion.tipo_diseno === "detallado" ? "text-red-700" : "text-emerald-700"
                  }`}>
                    Diseño {documento.clasificacion.tipo_diseno === "detallado" ? "Detallado" : "Simplificado"}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{documento.clasificacion.razon}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1 font-mono">{documento.clasificacion.articulo_aplicable}</p>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Progreso del Diseño
                </span>
                <span className="text-xs font-bold text-blue-600 font-mono">
                  {documento.resumen_cumplimiento.items_calculados_por_app} de {documento.resumen_cumplimiento.items_aplican} items automatizados
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${documento.resumen_cumplimiento.porcentaje_automatizado}%` }}
                />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 bg-white/50">
              <div className="p-5 text-center">
                <span className="text-3xl font-black text-slate-800 font-display block">
                  {documento.resumen_cumplimiento.items_aplican}
                </span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">Items Aplican</span>
              </div>
              <div className="p-5 text-center">
                <span className="text-3xl font-black text-emerald-600 font-display block">
                  {documento.resumen_cumplimiento.items_calculados_por_app}
                </span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">Calc. Automático</span>
              </div>
              <div className="p-5 text-center">
                <span className="text-3xl font-black text-amber-600 font-display block">
                  {documento.resumen_cumplimiento.items_requieren_profesional}
                </span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">Req. Profesional</span>
              </div>
              <div className="p-5 text-center">
                <span className="text-3xl font-black text-blue-600 font-display block">
                  {documento.resumen_cumplimiento.porcentaje_automatizado}%
                </span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">Automatizado</span>
              </div>
            </div>

            {/* ITEMS DEL DISEÑO */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h4 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  Items del Diseño — RETIE Art. 3.3.1.1 (a-x)
                </h4>

                {/* Filtros */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  {([
                    { key: "todos", label: "Todos", icon: Filter },
                    { key: "calculable", label: "Automático", icon: Calculator },
                    { key: "profesional", label: "Profesional", icon: UserCheck },
                  ] as const).map((f) => {
                    const Icon = f.icon;
                    const active = filterTipo === f.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => setFilterTipo(f.key as FilterType)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer min-h-[36px] ${
                          active
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {itemsFiltrados.map((item) => {
                  const config = estadoConfig[item.estado] || estadoConfig.requiere_profesional;
                  const Icon = config.icon;
                  const calcLink = item.calculable_por_app ? CALC_LINKS[item.id] : null;
                  const isCalculable = item.estado === "calculado_por_app";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-sm ${
                        isCalculable
                          ? "border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white"
                          : "border-amber-200 bg-gradient-to-r from-amber-50/60 to-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header del item */}
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="inline-flex items-center justify-center rounded-lg bg-slate-800 text-white w-8 h-8 text-sm font-black font-mono uppercase shrink-0">
                              {item.id}
                            </span>
                            <h5 className="text-base font-bold text-slate-800 leading-snug flex-1 min-w-0">
                              {item.titulo}
                            </h5>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-2xs font-extrabold border whitespace-nowrap ${config.bg} ${config.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {config.label}
                            </span>
                          </div>

                          {/* Referencia normativa */}
                          <p className="text-sm text-slate-500 italic mb-3 font-medium">
                            📋 {item.norma_ref}
                          </p>

                          {/* Contenido / Explicación */}
                          {item.contenido && (
                            <div className={`p-4 rounded-lg border text-sm leading-relaxed ${
                              isCalculable
                                ? "bg-white border-emerald-200 text-slate-700"
                                : "bg-white border-amber-200 text-slate-700"
                            }`}>
                              {item.contenido}
                            </div>
                          )}

                          {/* Botón Ir a Calculadora */}
                          {calcLink && (
                            <button
                              onClick={() => abrirCalculadora(calcLink.tab)}
                              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                            >
                              <Calculator className="h-3.5 w-3.5" />
                              {calcLink.label}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {itemsFiltrados.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Filter className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No hay items que mostrar con este filtro</p>
                  </div>
                )}
              </div>
            </div>

            {/* DECLARACIÓN DE RESPONSABILIDAD */}
            <div className="border-t-2 border-slate-200 p-6">
              <h4 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2 font-display">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Declaración de Responsabilidad Profesional
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-amber-400 pl-4 py-1">
                {documento.declaracion_responsabilidad}
              </p>
            </div>

            {/* FIRMA */}
            <div className="border-t-2 border-slate-200 p-8 bg-slate-50/80">
              <div className="max-w-md mx-auto text-center">
                <div className="border-b-2 border-slate-300 w-full mb-4"></div>
                <span className="text-base font-bold text-slate-800 font-display block">
                  {documento.firma_digital.nombre_disenador}
                </span>
                <p className="text-sm text-slate-500 mt-1.5">
                  Matrícula Profesional: {documento.firma_digital.matricula_profesional}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Ingeniero Electricista — Ley 51/1986, Ley 842/2003
                </p>
                {documento.firma_digital.requiere_firma && (
                  <p className="text-xs text-red-600 font-semibold mt-3 bg-red-50 inline-block px-3 py-1 rounded-full border border-red-200">
                    ⚠️ Requiere firma digital para presentación oficial
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BOTÓN IMPRIMIR (abajo) */}
          <div className="text-center print:hidden pb-4">
            <button
              onClick={imprimirDocumento}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-blue-600/25 min-h-[48px]"
            >
              <Printer className="h-5 w-5" />
              Imprimir / Guardar como PDF
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Use Ctrl+P (Cmd+P) y seleccione &ldquo;Guardar como PDF&rdquo; en el destino de impresión
            </p>
          </div>
        </div>
      )}

      {/* ESTILOS DE IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:space-y-4 > * + * { margin-top: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
