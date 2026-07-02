"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star, BadgeCheck, Filter, Wrench } from "lucide-react";

interface Technician {
  id: string;
  specialty: string;
  hourly_rate: number | null;
  experience_years: number | null;
  availability_status: string;
  rating: number;
  total_jobs: number;
  is_verified: boolean;
  created_at: string;
}

export default function TecnicosPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterVerified, setFilterVerified] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
  setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const specialties = [
    "Residencial",
    "Industrial",
    "Solar/Fotovoltaico",
    "EV Charging",
    "Comercial",
    "General",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Técnicos e Ingenieros</h1>
          <p className="text-sm text-slate-500 mt-1">
            Encuentra profesionales verificados para tus proyectos eléctricos
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
          <Wrench className="h-4 w-4" />
          Registrar como técnico
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Todas las especialidades</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => setFilterVerified(!filterVerified)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              filterVerified
                ? "bg-primary/10 text-primary border border-primary/20"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            Solo verificados
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 h-48" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Sample technician cards — will be replaced with real data */}
          {[
            { id: "1", specialty: "Solar/Fotovoltaico", experience_years: 8, rating: 4.8, total_jobs: 47, is_verified: true, hourly_rate: 45, availability_status: "available" },
            { id: "2", specialty: "Industrial", experience_years: 12, rating: 4.9, total_jobs: 89, is_verified: true, hourly_rate: 60, availability_status: "available" },
            { id: "3", specialty: "Residencial", experience_years: 5, rating: 4.5, total_jobs: 23, is_verified: false, hourly_rate: 25, availability_status: "busy" },
          ].map((tech) => (
            <div
              key={tech.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {tech.specialty[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{tech.specialty}</p>
                    <p className="text-xs text-slate-500">{tech.experience_years} años de experiencia</p>
                  </div>
                </div>
                {tech.is_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-bold text-green-700">
                    <BadgeCheck className="h-3 w-3" />
                    Verificado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-700">{tech.rating}</span>
                  <span className="text-slate-400">({tech.total_jobs} trabajos)</span>
                </div>
                {tech.hourly_rate && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-semibold">${tech.hourly_rate}/hr</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`flex items-center gap-1 text-xs font-semibold ${
                  tech.availability_status === "available" ? "text-green-600" : "text-orange-600"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    tech.availability_status === "available" ? "bg-green-500" : "bg-orange-500"
                  }`} />
                  {tech.availability_status === "available" ? "Disponible" : "Ocupado"}
                </span>
                <button className="text-sm font-semibold text-primary group-hover:underline">
                  Ver perfil →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Verificación profesional</h3>
            <p className="text-sm text-slate-600 mt-1">
              Todos nuestros técnicos verifican su matrícula profesional y certificaciones.
              Soporte para Colombia (RETIE), USA (NEC License), México (Cédula PROF),
              España (CIE) y más países.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}