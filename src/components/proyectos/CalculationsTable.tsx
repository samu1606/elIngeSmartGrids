"use client";

import { Clock, FileText, FileSpreadsheet } from "lucide-react";
import { getKeyParams, exportToPDF, exportToExcel, TYPE_LABELS } from "@/lib/export-utils";

interface SavedCalculation {
  id: string;
  type: string;
  title: string;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  created_at: string;
}

export default function CalculationsTable({
  calculations,
  loading,
}: {
  calculations: SavedCalculation[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-3" />
        <p className="text-xs text-slate-400">Cargando cálculos...</p>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-400 font-display">Sin cálculos aún</h4>
        <p className="text-xs text-slate-350 mt-1 max-w-xs mx-auto">
          Ve a la calculadora, realiza un cálculo y usa "Guardar en Proyecto" para vincularlo aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-3xs font-bold uppercase tracking-wider text-slate-400">
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5 hidden sm:table-cell">Parámetros Clave</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Fecha</th>
              <th className="px-4 py-2.5 text-right w-24">Exportar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {calculations.map((calc) => {
              const params = getKeyParams(calc);
              return (
                <tr key={calc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-3xs font-extrabold text-primary">
                      {TYPE_LABELS[calc.type] || calc.type}
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">{calc.title}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {params.map((p, i) => (
                        <span key={i} className="text-3xs text-slate-500">
                          <span className="font-semibold text-slate-600">{p.label}:</span>{" "}
                          <span className="font-mono text-slate-700">{p.value}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-3xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(calc.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); exportToPDF(calc); }}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 py-1.5 text-3xs font-bold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Exportar PDF"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); exportToExcel(calc); }}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5 text-3xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Exportar Excel"
                      >
                        <FileSpreadsheet className="h-3 w-3" />
                        <span className="hidden sm:inline">XLSX</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
