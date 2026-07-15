"use client";

import { Fragment, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Plus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Users,
  FolderOpen,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  FolderDot,
  Calculator,
} from "lucide-react";
import CalculationsTable from "@/components/proyectos/CalculationsTable";

/* ──────────────── TYPES ──────────────── */

interface Client {
  id: string;
  name: string;
  type: string;
  nit: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  created_at?: string;
}

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

/* ──────────────── MOCK DATA ──────────────── */

const MOCK_CLIENTS: Client[] = [
  {
    id: "mock-c1",
    name: "Alimentos del Caribe S.A.S.",
    type: "empresa",
    nit: "900.123.456-7",
    phone: "311 555 4321",
    email: "contacto@alimentoscaribe.com",
    location: "Barranquilla, Atlántico",
  },
  {
    id: "mock-c2",
    name: "Inmobiliaria El Sol",
    type: "empresa",
    nit: "830.987.654-3",
    phone: "300 444 8888",
    email: "proyectos@inmoelsol.co",
    location: "Medellín, Antioquia",
  },
  {
    id: "mock-c3",
    name: "Carlos Mario Restrepo",
    type: "particular",
    nit: "1.020.304.506",
    phone: "315 222 1111",
    email: "carlos.restrepo@gmail.com",
    location: "Envigado, Antioquia",
  },
  {
    id: "mock-c4",
    name: "Diana Gómez Trujillo",
    type: "particular",
    nit: "52.876.543",
    phone: "310 999 7777",
    email: "diana.gomez@yahoo.com",
    location: "Bogotá, D.C.",
  },
];

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
    name: "Mantenimiento Preventivo Oficinas",
    client_name: "Alimentos del Caribe S.A.S.",
    status: "completado",
    progress: 100,
  },
  {
    id: "mock-p4",
    name: "Acometida Eléctrica Bodega",
    client_name: "Inmobiliaria El Sol",
    status: "en_proceso",
    progress: 45,
  },
  {
    id: "mock-p5",
    name: "Certificación RETIE Local",
    client_name: "Carlos Mario Restrepo",
    status: "completado",
    progress: 100,
  },
];

/* ──────────────── STATUS HELPERS ──────────────── */

const statusBadges: Record<Project["status"], string> = {
  en_proceso: "bg-blue-50 text-blue-700 border border-blue-200",
  completado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cotizado: "bg-amber-50 text-amber-700 border border-amber-200",
};

const statusLabels: Record<Project["status"], string> = {
  en_proceso: "En Proceso",
  completado: "Completado",
  cotizado: "Cotizado",
};

/* ──────────────── COMPONENT ──────────────── */

export default function ClientesProyectosPage() {
  /* ---------- state ---------- */
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // expanded client row (accordion)
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  // tab inside expanded row
  const [expandedTab, setExpandedTab] = useState<"info" | "projects">("projects");

  // modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // client form
  const [cfName, setCfName] = useState("");
  const [cfType, setCfType] = useState("empresa");
  const [cfNit, setCfNit] = useState("");
  const [cfPhone, setCfPhone] = useState("");
  const [cfEmail, setCfEmail] = useState("");
  const [cfLocation, setCfLocation] = useState("");

  // project form
  const [pfName, setPfName] = useState("");
  const [pfClientName, setPfClientName] = useState("");
  const [pfStatus, setPfStatus] = useState<Project["status"]>("en_proceso");
  const [pfProgress, setPfProgress] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>([]);
  const [calcsLoading, setCalcsLoading] = useState(false);

  const supabase = createClient();

  /* ---------- data fetching ---------- */

  const fetchData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [clientRes, projectRes] = await Promise.all([
        supabase.from("clients").select("*").order("name", { ascending: true }),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
      ]);

      if (clientRes.error) throw clientRes.error;
      if (projectRes.error) throw projectRes.error;

      if (clientRes.data) setClients(clientRes.data as Client[]);
      if (projectRes.data) setProjects(projectRes.data as Project[]);
      setIsMock(false);
    } catch (err: any) {
      console.warn("Falla de base de datos, cargando modo local:", err.message);
      setDbError(err.message || String(err));
      setClients(MOCK_CLIENTS);
      setProjects(MOCK_PROJECTS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  /* ---------- derived ---------- */

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const projectsFor = (clientName: string) =>
    projects.filter((p) => p.client_name === clientName);

  const totalClients = clients.length;
  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status === "en_proceso").length;
  const completed = projects.filter((p) => p.status === "completado").length;

  /* ---------- CRUD: Client ---------- */

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const data = {
      name: cfName,
      type: cfType,
      nit: cfNit || null,
      phone: cfPhone || null,
      email: cfEmail || null,
      location: cfLocation || null,
    };
    if (isMock) {
      setClients([{ id: `mock-c-${Date.now()}`, ...data } as Client, ...clients]);
      closeClientModal();
    } else {
      try {
        const { data: inserted, error } = await supabase.from("clients").insert([data]).select();
        if (error) throw error;
        if (inserted) setClients([inserted[0] as Client, ...clients]);
        closeClientModal();
      } catch (err: any) {
        setSubmitError(err.message || "Error al guardar cliente.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("¿Eliminar este cliente y sus proyectos asociados?")) return;
    if (isMock || id.startsWith("mock-")) {
      setClients(clients.filter((c) => c.id !== id));
      setProjects(projects.filter((p) => p.client_name !== clients.find((c) => c.id === id)?.name));
    } else {
      try {
        const { error } = await supabase.from("clients").delete().eq("id", id);
        if (error) throw error;
        setClients(clients.filter((c) => c.id !== id));
        fetchData();
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  /* ---------- CRUD: Project ---------- */

  const openProjectModal = (clientName: string) => {
    setPfClientName(clientName);
    setShowProjectModal(true);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const data = {
      name: pfName,
      client_name: pfClientName,
      status: pfStatus,
      progress: pfStatus === "completado" ? 100 : pfProgress,
    };
    if (isMock) {
      setProjects([{ id: `mock-p-${Date.now()}`, ...data } as Project, ...projects]);
      closeProjectModal();
    } else {
      try {
        const { data: inserted, error } = await supabase.from("projects").insert([data]).select();
        if (error) throw error;
        if (inserted) setProjects([inserted[0] as Project, ...projects]);
        closeProjectModal();
      } catch (err: any) {
        setSubmitError(err.message || "Error al guardar proyecto.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    if (isMock || id.startsWith("mock-")) {
      setProjects(projects.filter((p) => p.id !== id));
    } else {
      try {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
        setProjects(projects.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  /* ---------- modal helpers ---------- */

  const closeClientModal = () => {
    setShowClientModal(false);
    setCfName("");
    setCfType("empresa");
    setCfNit("");
    setCfPhone("");
    setCfEmail("");
    setCfLocation("");
    setSubmitting(false);
    setSubmitError(null);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setPfName("");
    setPfClientName("");
    setPfStatus("en_proceso");
    setPfProgress(0);
    setSubmitting(false);
    setSubmitError(null);
  };

  /* ---------- expand toggle ---------- */

  const toggleExpand = (clientId: string) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
      setExpandedTab("projects");
    }
  };

  /* ──────────────── RENDER ──────────────── */

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <span>Clientes y Proyectos</span>
            {isMock && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-4xs font-bold text-slate-500 uppercase tracking-wide">
                Modo Local
              </span>
            )}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Gestiona tus clientes y sus proyectos desde un solo lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openProjectModal("")}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-green/30 bg-white px-4 py-2.5 text-xs font-bold text-primary-green hover:bg-primary-green/5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Nuevo Proyecto</span>
          </button>
          <button
            onClick={() => setShowClientModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* ── Sync notice ── */}
      {!isMock && (
        <div className="rounded-xl border border-emerald-150 bg-emerald-50 px-4 py-3 flex items-center gap-3 text-emerald-800 text-xs font-medium">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>Sincronizado con Supabase Cloud en tiempo real.</span>
        </div>
      )}
      {isMock && dbError && (
        <div className="rounded-xl border border-red-150 bg-red-50 px-4 py-3 flex items-center gap-3 text-red-700 text-xs font-medium">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>Error DB: {dbError}</span>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Clientes</span>
          <span className="text-2xl font-black text-slate-800 font-display block mt-1 flex items-center gap-1.5">
            <Users className="h-5 w-5 text-slate-400" /> {totalClients}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Proyectos Totales</span>
          <span className="text-2xl font-black text-slate-800 font-display block mt-1 flex items-center gap-1.5">
            <FolderOpen className="h-5 w-5 text-primary-green" /> {totalProjects}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">En Ejecución</span>
          <span className="text-2xl font-black text-blue-500 font-display block mt-1">{inProgress}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Completados</span>
          <span className="text-2xl font-black text-emerald-600 font-display block mt-1 flex items-center gap-1.5">
            {completed} <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-primary-green/60 focus:bg-white transition-all"
            placeholder="Buscar por nombre, email o ciudad..."
          />
        </div>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-green mb-4" />
          <p className="text-xs text-slate-400">Cargando clientes y proyectos...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h4 className="font-bold text-slate-500 font-display">No se encontraron clientes</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Intenta cambiar el término de búsqueda o registra un nuevo cliente.
          </p>
        </div>
      ) : (
        /* ── Unified Clients Table ── */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 hidden md:table-cell">Identificación</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Ubicación</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Contacto</th>
                  <th className="px-6 py-4 text-center">Proyectos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const clientProjects = projectsFor(client.name);
                  const isExpanded = expandedClientId === client.id;
                  return (
                    <Fragment key={client.id}>
                      {/* ── Client Row ── */}
                      <tr
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? "bg-slate-50" : ""}`}
                        onClick={() => toggleExpand(client.id)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-slate-400">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 font-bold text-slate-500 text-xs uppercase">
                              {client.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-tight">{client.name}</p>
                              <span
                                className={`inline-flex items-center rounded px-1.5 py-0.5 text-4xs font-extrabold uppercase mt-0.5 ${
                                  client.type === "empresa"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-blue-50 text-blue-600 border border-blue-100"
                                }`}
                              >
                                {client.type === "empresa" ? "Empresa" : "Particular"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell font-mono text-xs text-slate-500">
                          {client.nit || "-"}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-xs text-slate-500">
                          {client.location ? (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              {client.location}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-xs text-slate-500">
                          {client.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="font-mono">{client.phone}</span>
                            </div>
                          ) : client.email ? (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px] block">{client.email}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {clientProjects.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectModal(client.name);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary-green/10 hover:bg-primary-green/20 text-primary-green px-2.5 py-1.5 text-3xs font-bold transition-colors cursor-pointer"
                              title="Añadir proyecto"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Proyecto</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
                              className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded Sub-row ── */}
                      {isExpanded && (
                        <tr key={`${client.id}-expanded`}>
                          <td colSpan={7} className="px-0 py-0 bg-slate-50/80">
                            <div className="px-6 py-4 border-t border-slate-200">
                              {/* Tabs */}
                              <div className="flex gap-1 mb-4 border-b border-slate-200 pb-0">
                                <button
                                  onClick={() => setExpandedTab("info")}
                                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
                                    expandedTab === "info"
                                      ? "bg-white text-slate-800 border border-slate-200 border-b-white -mb-px"
                                      : "text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  Información
                                </button>
                                <button
                                  onClick={() => setExpandedTab("projects")}
                                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 ${
                                    expandedTab === "projects"
                                      ? "bg-white text-primary-green border border-slate-200 border-b-white -mb-px"
                                      : "text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                  Proyectos ({clientProjects.length})
                                </button>
                              </div>

                              {/* Tab Content */}
                              {expandedTab === "info" ? (
                                /* ── Info Tab ── */
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Tipo</span>
                                    <span className="font-semibold text-slate-700">{client.type === "empresa" ? "Jurídica (Empresa)" : "Natural (Particular)"}</span>
                                  </div>
                                  <div>
                                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1">NIT / CC</span>
                                    <span className="font-mono font-semibold text-slate-700">{client.nit || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Teléfono</span>
                                    <span className="font-mono font-semibold text-slate-700">{client.phone || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</span>
                                    <span className="font-semibold text-slate-700">{client.email || "-"}</span>
                                  </div>
                                  <div className="sm:col-span-2 lg:col-span-4">
                                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Ubicación</span>
                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                      {client.location || "No especificada"}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                /* ── Projects Tab ── */
                                <div>
                                  {clientProjects.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                      <FolderDot className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-xs font-medium">Sin proyectos aún</p>
                                      <button
                                        onClick={() => openProjectModal(client.name)}
                                        className="inline-flex items-center gap-1 mt-2 text-primary-green text-xs font-bold hover:underline cursor-pointer"
                                      >
                                        <Plus className="h-3.5 w-3.5" /> Añadir primer proyecto
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {/* Projects mini-table */}
                                      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-slate-50 border-b border-slate-100 text-3xs font-bold uppercase tracking-wider text-slate-400">
                                            <tr>
                                              <th className="px-4 py-2.5">Proyecto</th>
                                              <th className="px-4 py-2.5 hidden sm:table-cell">Estado</th>
                                              <th className="px-4 py-2.5 hidden md:table-cell">Progreso</th>
                                              <th className="px-4 py-2.5 text-right w-10"></th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-50">
                                            {clientProjects.map((proj) => (
                                              <tr key={proj.id} onClick={() => { setSelectedProject(proj); fetchSavedCalcs(proj.id); }} className="hover:bg-slate-50/50 hover:bg-primary/5 transition-colors cursor-pointer">
                                                <td className="px-4 py-3 font-semibold text-slate-700">
                                                  {proj.name}
                                                </td>
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-extrabold ${statusBadges[proj.status]}`}>
                                                    {statusLabels[proj.status]}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                      <div
                                                        className={`h-full rounded-full transition-all ${
                                                          proj.status === "completado" ? "bg-emerald-500" : "bg-primary-green"
                                                        }`}
                                                        style={{ width: `${proj.progress}%` }}
                                                      />
                                                    </div>
                                                    <span className="font-mono text-3xs text-slate-400">{proj.progress}%</span>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                  <button
                                                    onClick={() => handleDeleteProject(proj.id)}
                                                    className="text-slate-300 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Add project button inside expanded row */}
                                      <button
                                        onClick={() => openProjectModal(client.name)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-green hover:underline cursor-pointer"
                                      >
                                        <Plus className="h-3.5 w-3.5" /> Añadir proyecto a {client.name}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MODALS
          ══════════════════════════════════════ */}

      {/* ── ADD CLIENT MODAL ── */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">Registrar Nuevo Cliente</h3>
              <button onClick={closeClientModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="mt-4 space-y-4">
              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nombre / Razón Social</label>
                <input
                  type="text" required value={cfName} onChange={(e) => setCfName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Instalaciones Eléctricas S.A.S."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Tipo de Persona</label>
                  <select
                    value={cfType} onChange={(e) => setCfType(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  >
                    <option value="empresa">Jurídica (Empresa)</option>
                    <option value="particular">Natural (Particular)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">NIT / Cédula</label>
                  <input
                    type="text" value={cfNit} onChange={(e) => setCfNit(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="900.231.411-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Teléfono</label>
                  <input
                    type="text" value={cfPhone} onChange={(e) => setCfPhone(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="315 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Correo</label>
                  <input
                    type="email" value={cfEmail} onChange={(e) => setCfEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="correo@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Ubicación</label>
                <input
                  type="text" value={cfLocation} onChange={(e) => setCfLocation(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Bogotá, D.C."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeClientModal} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Guardando...</> : "Guardar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD PROJECT MODAL ── */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">Nuevo Proyecto</h3>
              <button onClick={closeProjectModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="mt-4 space-y-4">
              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Cliente</label>
                {pfClientName ? (
                  <input
                    type="text" value={pfClientName}
                    readOnly
                    className="block w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 outline-none cursor-default"
                  />
                ) : (
                  <select
                    required
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__new__") {
                        closeProjectModal();
                        setShowClientModal(true);
                      } else if (val) {
                        setPfClientName(val);
                      }
                    }}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  >
                    <option value="" disabled>Seleccionar cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option disabled>──────────────</option>
                    <option value="__new__" className="text-primary-green font-bold">+ Crear nuevo cliente</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nombre del Proyecto</label>
                <input
                  type="text" required value={pfName} onChange={(e) => setPfName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Ej. Instalación Solar Residencial"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Estado</label>
                <select
                  value={pfStatus} onChange={(e) => setPfStatus(e.target.value as Project["status"])}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                >
                  <option value="en_proceso">En Proceso</option>
                  <option value="cotizado">Cotizado</option>
                  <option value="completado">Completado</option>
                </select>
              </div>

              {pfStatus !== "completado" && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400">Avance</label>
                    <span className="font-mono text-xs font-bold text-slate-700">{pfProgress}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={pfProgress}
                    onChange={(e) => setPfProgress(Number(e.target.value))}
                    className="w-full accent-primary-green cursor-pointer"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeProjectModal} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Guardando...</> : "Guardar Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedProject(null); setSavedCalcs([]); }}}>
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display">{selectedProject.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProject.client_name} · {selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : "Reciente"}</p>
              </div>
              <button onClick={() => { setSelectedProject(null); setSavedCalcs([]); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-4.5 w-4.5 text-primary-green" />
                <h4 className="text-sm font-bold text-slate-700">Cálculos</h4>
                <span className="text-xs text-slate-400">({savedCalcs.length})</span>
              </div>
              <CalculationsTable calculations={savedCalcs} loading={calcsLoading} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


