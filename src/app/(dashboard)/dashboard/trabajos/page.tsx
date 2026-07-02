"use client";

import { useState } from "react";
import { PlusCircle, MapPin, DollarSign, Clock, Wrench, Filter } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  budget_min: number | null;
  budget_max: number | null;
  address: string | null;
  created_at: string;
}

export default function TrabajosPage() {
  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "Instalación de sistema solar residencial 5kW",
      description: "Necesito instalar 12 paneles solares con inversor híbrido en casa de 2 pisos.",
      category: "Solar/Fotovoltaico",
      status: "open",
      budget_min: 3000,
      budget_max: 5000,
      address: "Bogotá, Colombia",
      created_at: "2026-07-02",
    },
    {
      id: "2",
      title: "Inspección eléctrica RETIE para local comercial",
      description: "Requiere certificación RETIE para apertura de local de 200m².",
      category: "Inspección",
      status: "open",
      budget_min: 200,
      budget_max: 400,
      address: "Medellín, Colombia",
      created_at: "2026-07-01",
    },
    {
      id: "3",
      title: "Instalación de punto de carga para vehículo eléctrico",
      description: "Instalar cargador Level 2 en garaje residencial. 240V, 32A.",
      category: "EV Charging",
      status: "assigned",
      budget_min: 300,
      budget_max: 600,
      address: "Cali, Colombia",
      created_at: "2026-06-30",
    },
  ]);

  const categories = ["Instalación", "Reparación", "Inspección", "Solar/Fotovoltaico", "EV Charging", "General"];
  const statusColors: Record<string, string> = {
    open: "bg-green-50 text-green-700 border-green-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const statusLabels: Record<string, string> = {
    open: "Abierto",
    assigned: "Asignado",
    in_progress: "En progreso",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trabajos</h1>
          <p className="text-sm text-slate-500 mt-1">Publica o encuentra trabajos eléctricos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          {showForm ? "Cancelar" : "Publicar trabajo"}
        </button>
      </div>

      {/* New Job Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Nuevo trabajo</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Título</label>
              <input type="text" placeholder="Ej: Instalación de paneles solares" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
              <textarea rows={3} placeholder="Describe el trabajo..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Presupuesto mín. (USD)</label>
              <input type="number" placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Presupuesto máx. (USD)</label>
              <input type="number" placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ubicación</label>
              <input type="text" placeholder="Ciudad, País" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          <button className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90">
            Publicar trabajo
          </button>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusColors[job.status]}`}>
                    {statusLabels[job.status]}
                  </span>
                  <span className="text-xs text-slate-400">{job.category}</span>
                </div>
                <h3 className="font-bold text-slate-900">{job.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{job.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {job.budget_min && job.budget_max && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">${job.budget_min} - ${job.budget_max}</span>
                    </div>
                  )}
                  {job.address && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {job.address}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-4 w-4" />
                    {job.created_at}
                  </div>
                </div>
              </div>
              {job.status === "open" && (
                <button className="flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-white transition-colors whitespace-nowrap">
                  <Wrench className="h-4 w-4" />
                  Aplicar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}