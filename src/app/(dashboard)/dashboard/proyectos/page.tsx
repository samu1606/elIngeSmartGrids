"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Grid, 
  List, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  FolderOpen,
  CheckCircle,
  Loader2,
  TrendingUp,
  Settings,
  FolderDot,
  Calculator,
  Clock
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  client_name: string;
  status: "en_proceso" | "completado" | "cotizado";
  progress: number;
  created_at?: string;
}

interface SavedCalculation {
  id: string;
  type: string;
  title: string;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  created_at: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "mock-p1",
    name: "Instalación Solar Residencial",
    client_name: "Inmobiliaria El Sol",
    status: "en_proceso",
    progress: 65,
  },
  {
    id: "mock-p2",
    name: "Diseño Red Trifásica - Bodega C",
    client_name: "Alimentos del Caribe S.A.S.",
    status: "cotizado",
    progress: 20,
  },
  {
    id: "mock-p3",
    name: "Acometida Eléctrica Edificio",
    client_name: "Constructora Andes",
    status: "completado",
    progress: 100,
  },
  {
    id: "mock-p4",
    name: "Certificación RETIE Oficinas Centrales",
    client_name: "Bancolombia S.A.",
    status: "en_proceso",
    progress: 45,
  }
];

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newStatus, setNewStatus] = useState<"en_proceso" | "completado" | "cotizado">("en_proceso");
  const [newProgress, setNewProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>([]);
  const [calcsLoading, setCalcsLoading] = useState(false);

  const supabase = createClient();

  // Load projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setProjects(data as Project[]);
        setIsMock(false);
      }
    } catch (err: any) {
      console.warn("Falla de base de datos remota, cargando en modo local:", err.message);
      setProjects(MOCK_PROJECTS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCalcs = async (projectId: string) => {
    setCalcsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_calculations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedCalcs(data || []);
    } catch (err: any) {
      console.warn("Error fetching saved calcs:", err.message);
      setSavedCalcs([]);
    } finally {
      setCalcsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Add Project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const projectData = {
      name: newName,
      client_name: newClientName,
      status: newStatus,
      progress: newStatus === "completado" ? 100 : newProgress,
    };

    if (isMock) {
      const newProject: Project = {
        id: `mock-p-${Date.now()}`,
        ...projectData,
      };
      setProjects([newProject, ...projects]);
      closeModal();
    } else {
      try {
        const { data, error } = await supabase
          .from("projects")
          .insert([projectData])
          .select();

        if (error) throw error;

        if (data) {
          setProjects([data[0] as Project, ...projects]);
        }
        closeModal();
      } catch (err: any) {
        setSubmitError(err.message || "Error al guardar el proyecto.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este proyecto?")) {
      if (isMock || id.startsWith("mock-")) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        try {
          const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", id);
          if (error) throw error;
          setProjects(projects.filter(p => p.id !== id));
        } catch (err: any) {
          alert(`No se pudo eliminar el proyecto de la base de datos: ${err.message}`);
        }
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewName("");
    setNewClientName("");
    setNewStatus("en_proceso");
    setNewProgress(0);
    setSubmitting(false);
    setSubmitError(null);
  };

  // KPI calculations
  const totalCount = projects.length;
  const inProgressCount = projects.filter(p => p.status === "en_proceso").length;
  const completedCount = projects.filter(p => p.status === "completado").length;
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) 
    : 0;

  const statusBadges = {
    en_proceso: "bg-blue-50 text-blue-700 border border-blue-200",
    completado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cotizado: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  const statusLabels = {
    en_proceso: "En Proceso",
    completado: "Completado",
    cotizado: "Cotizado",
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <span>Listado de Proyectos</span>
            {isMock && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-4xs font-bold text-slate-500 uppercase tracking-wide">
                Modo Local (Mock)
              </span>
            )}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Visualiza, gestiona y crea proyectos de diseño y mantenimiento eléctrico.
          </p>
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Sync success notice */}
      {!isMock && (
        <div className="rounded-xl border border-emerald-150 bg-emerald-50 px-4 py-3 flex items-center gap-3 text-emerald-800 text-xs font-medium">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>Sincronizado con Supabase Cloud en tiempo real.</span>
        </div>
      )}

      {/* Project KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Proyectos Totales</span>
          <span className="text-2xl font-black text-slate-850 font-display block mt-1">{totalCount}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">En Ejecución</span>
          <span className="text-2xl font-black text-blue-500 font-display block mt-1">{inProgressCount}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Completados</span>
          <span className="text-2xl font-black text-emerald-600 font-display block mt-1">{completedCount}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Progreso Promedio</span>
          <span className="text-2xl font-black text-slate-850 font-display block mt-1 flex items-center gap-1.5">
            {averageProgress}%
            <TrendingUp className="h-4.5 w-4.5 text-primary-green" />
          </span>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-primary-green/60 focus:bg-white transition-all"
            placeholder="Buscar por nombre, cliente..."
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-755 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="en_proceso">En Proceso</option>
              <option value="cotizado">Cotizado</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          {/* View Toggles */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setViewType("grid")}
              className={`px-3 py-2 flex items-center justify-center hover:bg-slate-200 transition-colors ${
                viewType === "grid" ? "text-primary-green bg-white shadow-sm font-bold" : "text-slate-400"
              }`}
            >
              <Grid className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`px-3 py-2 flex items-center justify-center hover:bg-slate-200 transition-colors ${
                viewType === "list" ? "text-primary-green bg-white shadow-sm font-bold" : "text-slate-400"
              }`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-green mb-4" />
          <p className="text-xs text-slate-400">Cargando proyectos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50/50 p-12 text-center text-slate-455">
          <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h4 className="font-bold text-slate-500 font-display">No se encontraron proyectos</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Intenta cambiar el filtro o registra un nuevo proyecto.
          </p>
        </div>
      ) : viewType === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => { setSelectedProject(project); fetchSavedCalcs(project.id); }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
                      <FolderDot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 font-display text-sm leading-tight max-w-[150px] truncate" title={project.name}>
                        {project.name}
                      </h4>
                      <span className="text-3xs font-medium text-slate-450 block mt-0.5">
                        {project.client_name}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 mt-4">
                  <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Avance de obra</span>
                    <span className="font-mono text-slate-700">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.status === "completado" ? "bg-emerald-500" : "bg-primary-green"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-6 border-t border-slate-100">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-extrabold ${statusBadges[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
                <span className="text-4xs font-semibold text-slate-400 font-mono">
                  {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Reciente"}
                </span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Proyecto</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Progreso</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredProjects.map((project) => (
                  <tr key={project.id} onClick={() => { setSelectedProject(project); fetchSavedCalcs(project.id); }} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {project.name}
                    </td>
                    <td className="px-6 py-4">
                      {project.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-extrabold ${statusBadges[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              project.status === "completado" ? "bg-emerald-500" : "bg-primary-green"
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-3xs text-slate-400 w-8 text-right">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-slate-350 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">Crear Nuevo Proyecto</h3>
              <button 
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProject} className="mt-4 space-y-4">
              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-650">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="p-name" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre del Proyecto
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Ej. Red de Acometidas Trifásicas"
                />
              </div>

              {/* Client Name */}
              <div>
                <label htmlFor="p-client" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre del Cliente
                </label>
                <input
                  id="p-client"
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Ej. Alimentos del Caribe S.A.S."
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="p-status" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Estado Inicial
                </label>
                <select
                  id="p-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                >
                  <option value="en_proceso">En Proceso</option>
                  <option value="cotizado">Cotizado</option>
                  <option value="completado">Completado</option>
                </select>
              </div>

              {/* Progress Slider (Only if not completed) */}
              {newStatus !== "completado" && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="p-progress" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400">
                      Avance de obra
                    </label>
                    <span className="font-mono text-xs font-bold text-slate-700">{newProgress}%</span>
                  </div>
                  <input
                    id="p-progress"
                    type="range"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full accent-primary-green cursor-pointer"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Proyecto"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedProject(null); setSavedCalcs([]); }} }
        >
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display">{selectedProject.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProject.client_name} · {selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : "Reciente"}</p>
              </div>
              <button
                onClick={() => { setSelectedProject(null); setSavedCalcs([]); }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-4.5 w-4.5 text-primary-green" />
                <h4 className="text-sm font-bold text-slate-700">Cálculos Guardados</h4>
                <span className="text-xs text-slate-400">({savedCalcs.length})</span>
              </div>

              {calcsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-green mb-3" />
                  <p className="text-xs text-slate-400">Cargando cálculos...</p>
                </div>
              ) : savedCalcs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calculator className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-400 font-display">Sin cálculos aún</h4>
                  <p className="text-xs text-slate-350 mt-1 max-w-xs mx-auto">
                    Ve a la calculadora, realiza un cálculo y usa "Guardar en Proyecto" para vincularlo aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCalcs.map((calc) => {
                    const TYPE_LABELS: Record<string, string> = {
    "seccion": "Sección de Conductor",
    "proteccion": "Protecciones",
    "motor": "Motores",
    "iluminacion": "Iluminación",
    "reactiva": "Compensación Reactiva",
    "puesta_tierra": "Puesta a Tierra",
    "cuadro_cargas": "Cuadro de Cargas",
    "caida_tension": "Caída de Tensión",
    "cortocircuito": "Cortocircuito",
    "tuberias": "Tuberías",
    "transformadores": "Transformadores",
    "pararrayos": "Pararrayos",
                    };
                    return (
                      <div key={calc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-3xs font-extrabold text-primary mb-1.5">
                              {TYPE_LABELS[calc.type] || calc.type}
                            </span>
                            <h5 className="text-sm font-semibold text-slate-700 truncate">{calc.title}</h5>
                            <div className="flex items-center gap-1.5 mt-1.5 text-4xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(calc.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const data = JSON.stringify({ inputs: calc.input_data, resultados: calc.result_data }, null, 2);
                              const blob = new Blob([data], { type: "application/json" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${calc.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="shrink-0 text-slate-300 hover:text-primary-green p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer"
                            title="Exportar como JSON"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
