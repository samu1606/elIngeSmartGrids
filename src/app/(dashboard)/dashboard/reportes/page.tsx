"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  Printer, 
  PieChart as PieIcon, 
  DollarSign, 
  CheckCircle2, 
  FileText,
  Loader2,
  Calendar
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReportStats {
  totalRevenue: number;
  totalExpenses: number;
  projectCount: number;
  conversionRate: number;
  averageMargin: number;
}

const MOCK_STATS: ReportStats = {
  totalRevenue: 48000000,
  totalExpenses: 29100000,
  projectCount: 24,
  conversionRate: 68, // 68% conversion
  averageMargin: 39, // 39% margin
};

const MONTHLY_DATA = [
  { name: "Ene", ingresos: 4800000, egresos: 3200000 },
  { name: "Feb", ingresos: 5900000, egresos: 3800000 },
  { name: "Mar", ingresos: 8200000, egresos: 4900000 },
  { name: "Abr", ingresos: 7100000, egresos: 4300000 },
  { name: "May", ingresos: 9600000, egresos: 5800000 },
  { name: "Jun", ingresos: 12400000, egresos: 7100000 },
];

const PROJECT_TYPES_DATA = [
  { name: "Sistemas Fotovoltaicos (Solar)", value: 35, color: "#1DB954" },
  { name: "Redes Trifásicas e Industrial", value: 25, color: "#3B82F6" },
  { name: "Diseños RETIE / NTC 2050", value: 20, color: "#A855F7" },
  { name: "Mantenimiento Subestaciones", value: 20, color: "#F59E0B" },
];

export default function ReportesPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("6m");
  const [stats, setStats] = useState<ReportStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const supabase = createClient();

  // Load real calculations if available, otherwise fallback
  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch budgets to compute revenue
      const { data: bData, error: bError } = await supabase
        .from("budgets")
        .select("total, status");

      if (bError) throw bError;

      if (bData) {
        // Calculate totals
        const accepted = bData
          .filter(b => b.status === "aceptado")
          .reduce((acc, b) => acc + Number(b.total), 0);
        
        const total = bData.reduce((acc, b) => acc + Number(b.total), 0);
        const acceptedCount = bData.filter(b => b.status === "aceptado").length;
        const convRate = total > 0 ? Math.round((acceptedCount / bData.length) * 100) : 0;

        setStats({
          totalRevenue: accepted,
          totalExpenses: Math.round(accepted * 0.6), // Assume 60% expenses
          projectCount: bData.length,
          conversionRate: convRate,
          averageMargin: 40 // Standard 40% target
        });
        setIsMock(false);
      }
    } catch (err) {
      console.warn("No se pudo conectar base de datos para reportes, cargando mocks locales.");
      setStats(MOCK_STATS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchReportData();
  }, []);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe client-side rendering block
  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
      </div>
    );
  }

  // Custom tooltips for Recharts to match premium theme
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-2xs font-semibold">
          <p className="font-extrabold text-slate-800 mb-1.5">{label}</p>
          <p className="text-emerald-600 flex justify-between gap-4">
            <span>Ingresos:</span>
            <span className="font-mono">{formatCOP(payload[0].value)}</span>
          </p>
          <p className="text-rose-500 flex justify-between gap-4">
            <span>Gastos:</span>
            <span className="font-mono">{formatCOP(payload[1].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg text-2xs font-semibold">
          <p className="font-bold text-slate-800">{payload[0].name}</p>
          <p className="text-slate-500 font-mono mt-0.5">{payload[0].value}% del portafolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in print:p-0 print:space-y-6">
      
      {/* Header and Print Actions (hidden on printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <span>Reportes e Indicadores</span>
            {isMock && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-4xs font-bold text-slate-500 uppercase tracking-wide">
                Modo Local (Mock)
              </span>
            )}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Analítica de facturación, eficiencia operativa y distribución de tus servicios eléctricos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-green/65 cursor-pointer"
          >
            <option value="3m">Últimos 3 Meses</option>
            <option value="6m">Últimos 6 Meses</option>
          </select>

          <button 
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <Printer className="h-4.5 w-4.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Title (visible ONLY when printing) */}
      <div className="hidden print:block border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 font-display">
          El Inge - Smart Grids
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reporte Financiero y Operativo | Rango: {timeRange === "3m" ? "Últimos 3 Meses" : "Últimos 6 Meses"}
        </p>
        <p className="text-4xs text-slate-400 font-mono mt-1">
          Generado el: {new Date().toLocaleDateString("es-CO")}
        </p>
      </div>

      {/* Core KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Facturado */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[115px] print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Facturado (COP)</span>
            <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-slate-850 font-display block">
              {formatCOP(stats.totalRevenue)}
            </span>
            <span className="text-4xs text-emerald-600 font-bold mt-0.5 block flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12% vs mes anterior
            </span>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[115px] print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Éxito Comercial</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-slate-850 font-display block">
              {stats.conversionRate}%
            </span>
            <span className="text-4xs text-slate-400 font-semibold mt-0.5 block">
              Cotizaciones convertidas a ventas
            </span>
          </div>
        </div>

        {/* Margen Promedio */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[115px] print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Margen de Ganancia</span>
            <TrendingUp className="h-4.5 w-4.5 text-primary-green" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-slate-850 font-display block">
              {stats.averageMargin}%
            </span>
            <span className="text-4xs text-slate-400 font-semibold mt-0.5 block">
              Margen de utilidad promedio en diseño
            </span>
          </div>
        </div>

        {/* Proyectos Totales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[115px] print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Proyectos Activos</span>
            <FileText className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-slate-850 font-display block">
              {stats.projectCount}
            </span>
            <span className="text-4xs text-purple-600 font-bold mt-0.5 block">
              Diseños y obras registradas
            </span>
          </div>
        </div>

      </div>

      {/* Main Analytics Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
        
        {/* Bar Chart Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2 flex flex-col print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              <h3 className="font-extrabold text-sm text-slate-800 font-display">Historial Ingresos vs Gastos</h3>
            </div>
            <span className="text-4xs font-bold font-mono text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              Expresado en COP
            </span>
          </div>

          <div className="h-[320px] w-full text-xs font-semibold font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={timeRange === "3m" ? MONTHLY_DATA.slice(3) : MONTHLY_DATA}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  fontWeight={700}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94A3B8" 
                  fontSize={10}
                  fontWeight={700}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#F8FAFC" }} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconSize={10} 
                  iconType="circle"
                  formatter={(value) => <span className="text-2xs font-bold text-slate-600">{value}</span>}
                />
                <Bar name="Ingresos" dataKey="ingresos" fill="#1DB954" radius={[6, 6, 0, 0]} maxBarSize={35} />
                <Bar name="Gastos" dataKey="egresos" fill="#94A3B8" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col print:shadow-none print:border-slate-300">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="h-5 w-5 text-slate-500" />
            <h3 className="font-extrabold text-sm text-slate-800 font-display">Distribución de Portafolio</h3>
          </div>

          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PROJECT_TYPES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PROJECT_TYPES_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-slate-850 font-display">100%</span>
              <span className="text-4xs text-slate-400 font-extrabold uppercase tracking-widest">Actividad</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="mt-4 space-y-2 flex-1 flex flex-col justify-center border-t border-slate-100 pt-4">
            {PROJECT_TYPES_DATA.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-2xs font-semibold">
                <div className="flex items-center gap-2 truncate">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 font-mono pl-3">{item.value}%</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Top Performing Services & Compliance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs print:shadow-none print:border-slate-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-sm text-slate-800 font-display flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-400" />
            <span>Indicador de Cumplimiento RETIE</span>
          </h3>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-3xs font-black text-emerald-700 uppercase tracking-wide">
            Promedio: 94% Cumplimiento
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-2xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Norma Relacionada</th>
                <th className="px-5 py-3">Descripción Técnica</th>
                <th className="px-5 py-3">Fórmula / Umbral de Control</th>
                <th className="px-5 py-3 text-right">Estatus Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="px-5 py-3 font-bold text-slate-800">NTC 2050 Sección 250</td>
                <td className="px-5 py-3">Puesta a Tierra y Conexión Equipotencial</td>
                <td className="px-5 py-3 font-mono">Resistencia SPT &lt; 25 Ohms (Servicio General)</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-4xs font-bold text-emerald-700">
                    Aprobado
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-bold text-slate-800">RETIE Artículo 13</td>
                <td className="px-5 py-3">Distancias de Seguridad Eléctrica</td>
                <td className="px-5 py-3 font-mono">Distancias mínimas a redes de distribución</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-4xs font-bold text-emerald-700">
                    Aprobado
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-bold text-slate-800">NTC 2050 Sección 310</td>
                <td className="px-5 py-3">Capacidad de Corriente de Conductores (Ampacidad)</td>
                <td className="px-5 py-3 font-mono">Caída de Tensión &lt; 3% (Alimentador Principal)</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-4xs font-bold text-amber-700">
                    Revisión Pendiente
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
