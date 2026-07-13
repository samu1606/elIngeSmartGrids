"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Plus, 
  X, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  FileText, 
  CheckCircle, 
  FileClock, 
  XCircle,
  TrendingUp,
  FileCheck,
  FilePlus,
  FlaskConical,
  Pencil
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Budget {
  id: string;
  number: string;
  client_name: string;
  project_name: string;
  issue_date: string;
  valid_until: string | null;
  total: number;
  status: "pendiente" | "enviado" | "aceptado" | "rechazado";
  created_at?: string;
}

interface Project {
  id: string;
  name: string;
  client_name: string;
}

interface Client {
  id: string;
  name: string;
}

const MOCK_BUDGETS: Budget[] = [
  {
    id: "mock-b1",
    number: "PRE-001",
    client_name: "Alimentos del Caribe S.A.S.",
    project_name: "Diseño Red Trifásica Bodega C",
    issue_date: "2026-06-01",
    valid_until: "2026-07-01",
    total: 8500000,
    status: "aceptado"
  },
  {
    id: "mock-b2",
    number: "PRE-002",
    client_name: "Inmobiliaria El Sol",
    project_name: "Instalación Solar Residencial",
    issue_date: "2026-06-05",
    valid_until: "2026-07-05",
    total: 4200000,
    status: "pendiente"
  },
  {
    id: "mock-b3",
    number: "PRE-003",
    client_name: "Carlos Mario Restrepo",
    project_name: "Acometida e Instalación 220V",
    issue_date: "2026-06-10",
    valid_until: "2026-07-10",
    total: 1800000,
    status: "enviado"
  },
  {
    id: "mock-b4",
    number: "PRE-004",
    client_name: "Diana Gómez Trujillo",
    project_name: "Diseño Subestación Eléctrica 75kVA",
    issue_date: "2026-06-12",
    valid_until: "2026-07-12",
    total: 12400000,
    status: "aceptado"
  },
  {
    id: "mock-b5",
    number: "PRE-005",
    client_name: "Constructora Andes",
    project_name: "Estudio y Planos de Red Eléctrica",
    issue_date: "2026-06-15",
    valid_until: "2026-07-15",
    total: 3600000,
    status: "rechazado"
  }
];

const MOCK_CLIENTS: Client[] = [
  { id: "mock-1", name: "Alimentos del Caribe S.A.S." },
  { id: "mock-2", name: "Inmobiliaria El Sol" },
  { id: "mock-3", name: "Carlos Mario Restrepo" },
  { id: "mock-4", name: "Diana Gómez Trujillo" },
  { id: "mock-5", name: "Constructora Andes" }
];

const MOCK_PROJECTS: Project[] = [
  { id: "mock-p1", name: "Diseño Red Trifásica Bodega C", client_name: "Alimentos del Caribe S.A.S." },
  { id: "mock-p2", name: "Instalación Solar Residencial", client_name: "Inmobiliaria El Sol" },
  { id: "mock-p3", name: "Acometida e Instalación 220V", client_name: "Carlos Mario Restrepo" },
  { id: "mock-p4", name: "Diseño Subestación Eléctrica 75kVA", client_name: "Diana Gómez Trujillo" },
  { id: "mock-p5", name: "Estudio y Planos de Red Eléctrica", client_name: "Constructora Andes" }
];

export default function PresupuestosPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [newValidUntil, setNewValidUntil] = useState("");
  const [newTotal, setNewTotal] = useState("");
  const [newStatus, setNewStatus] = useState<"pendiente" | "enviado" | "aceptado" | "rechazado">("pendiente");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const supabase = createClient();

  // Load budgets and clients
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch budgets
      const { data: bData, error: bError } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Fetch clients (for select input)
      const { data: cData } = await supabase
        .from("clients")
        .select("id, name")
        .order("name", { ascending: true });

      // 3. Fetch projects
      const { data: pData } = await supabase
        .from("projects")
        .select("id, name, client_name")
        .order("name", { ascending: true });

      if (bError) throw bError;

      if (bData) {
        // Map database response to Budget interface
        const mappedBudgets: Budget[] = bData.map(item => ({
          id: item.id,
          number: item.number,
          client_name: item.client_name || "Cliente General",
          project_name: item.project_name || "Proyecto General",
          issue_date: item.issue_date,
          valid_until: item.valid_until,
          total: Number(item.total),
          status: item.status as any,
        }));
        setBudgets(mappedBudgets);
        setIsMock(false);
      }

      if (cData) {
        setClients(cData);
      }

      if (pData) {
        setProjects(pData as Project[]);
      }
    } catch (err: any) {
      console.warn("Falla al conectar base de datos, cargando datos locales:", err.message);
      setBudgets(MOCK_BUDGETS);
      setClients(MOCK_CLIENTS);
      setProjects(MOCK_PROJECTS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default valid_until: 30 days from now
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setNewValidUntil(nextMonth.toISOString().split("T")[0]);
  }, []);

  // Set default budget number when opening modal
  useEffect(() => {
    if (isModalOpen && !newNumber) {
      const nextNum = budgets.length + 1;
      setNewNumber(`PRE-${String(nextNum).padStart(3, "0")}`);
    }
  }, [isModalOpen, budgets, newNumber]);

  // Formats amounts to COP
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Add Budget CRUD
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const budgetData = {
      number: newNumber,
      client_name: newClientName || "Cliente Particular",
      project_name: newProjectName,
      issue_date: newIssueDate,
      valid_until: newValidUntil || null,
      total: Number(newTotal),
      status: newStatus,
    };

    if (isMock) {
      const newBudget: Budget = {
        id: `mock-b-${Date.now()}`,
        ...budgetData,
      };
      setBudgets([newBudget, ...budgets]);
      closeModal();
    } else {
      try {
        const { data, error } = await supabase
          .from("budgets")
          .insert([budgetData])
          .select();

        if (error) throw error;

        if (data) {
          const insertedBudget: Budget = {
            id: data[0].id,
            number: data[0].number,
            client_name: data[0].client_name,
            project_name: data[0].project_name,
            issue_date: data[0].issue_date,
            valid_until: data[0].valid_until,
            total: Number(data[0].total),
            status: data[0].status as any,
          };
          setBudgets([insertedBudget, ...budgets]);
        }
        closeModal();
      } catch (err: any) {
        setSubmitError(err.message || "Error al registrar el presupuesto.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Delete Budget CRUD
  const handleDeleteBudget = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este presupuesto?")) {
      if (isMock || id.startsWith("mock-")) {
        setBudgets(budgets.filter(b => b.id !== id));
      } else {
        try {
          const { error } = await supabase
            .from("budgets")
            .delete()
            .eq("id", id);
          if (error) throw error;
          setBudgets(budgets.filter(b => b.id !== id));
        } catch (err: any) {
          alert(`No se pudo eliminar de la base de datos: ${err.message}`);
        }
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewNumber("");
    setNewClientName("");
    setNewProjectName("");
    setNewTotal("");
    setNewStatus("pendiente");
    setSubmitting(false);
    setSubmitError(null);
  };

  // Filtering
  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = 
      b.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.project_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredBudgets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBudgets = filteredBudgets.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Financial KPIs
  const totalCount = budgets.length;
  const totalValue = budgets.reduce((acc, b) => acc + b.total, 0);
  
  const totalAccepted = budgets
    .filter(b => b.status === "aceptado")
    .reduce((acc, b) => acc + b.total, 0);

  const totalPending = budgets
    .filter(b => b.status === "pendiente" || b.status === "enviado")
    .reduce((acc, b) => acc + b.total, 0);

  // Status Badge configurations
  const statusBadges = {
    pendiente: "bg-amber-50 text-amber-700 border border-amber-200",
    enviado: "bg-blue-50 text-blue-700 border border-blue-200",
    aceptado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rechazado: "bg-rose-50 text-rose-700 border border-rose-200",
  };

  const statusLabels = {
    pendiente: "Pendiente",
    enviado: "Enviado",
    aceptado: "Aceptado",
    rechazado: "Rechazado",
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <span>Presupuestos y Ofertas</span>
            {isMock && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-4xs font-bold text-slate-500 uppercase tracking-wide">
                Modo Local (Mock)
              </span>
            )}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Genera, envía y haz seguimiento a tus propuestas comerciales de diseño eléctrico.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2px]" />
            <span>Registrar externo</span>
          </button>
          <button 
            onClick={() => router.push("/dashboard/presupuestos/constructor-apu")}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <FlaskConical className="h-4.5 w-4.5 stroke-[2px]" />
            <span>Constructor de APU</span>
          </button>
          <button 
            onClick={() => router.push("/dashboard/presupuestos/nuevo")}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            <FilePlus className="h-4.5 w-4.5 stroke-[2.5px]" />
            <span>Nuevo Presupuesto Detallado</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Propuestas Totales</span>
            <FileText className="h-4.5 w-4.5 text-slate-300" />
          </div>
          <span className="text-2xl font-black text-slate-850 font-display block mt-2">{totalCount}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Pendientes/Enviados</span>
            <FileClock className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-slate-850 font-display block mt-2 text-blue-600">
            {formatCOP(totalPending)}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Aceptados (Ventas)</span>
            <FileCheck className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-slate-850 font-display block mt-2 text-emerald-600">
            {formatCOP(totalAccepted)}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Valor Total</span>
            <TrendingUp className="h-4.5 w-4.5 text-primary-green" />
          </div>
          <span className="text-2xl font-black text-slate-850 font-display block mt-2">
            {formatCOP(totalValue)}
          </span>
        </div>
      </div>

      {/* Toolbar Filters */}
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
            placeholder="Buscar presupuesto, cliente..."
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">Filtrar por:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>

      </div>

      {/* Budget Table Panel */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-green mb-4" />
          <p className="text-xs text-slate-400">Cargando presupuestos...</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50/50 p-12 text-center text-slate-450">
          <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h4 className="font-bold text-slate-500 font-display">No se encontraron cotizaciones</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Ajusta los términos de búsqueda o registra una nueva cotización en el botón superior.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between min-h-[350px]">
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Nº Presupuesto</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Proyecto</th>
                  <th className="px-6 py-4">Fecha Emisión</th>
                  <th className="px-6 py-4">Válido Hasta</th>
                  <th className="px-6 py-4">VALOR TOTAL</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                {paginatedBudgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 font-mono">
                      {budget.number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {budget.client_name}
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">
                      {budget.project_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {budget.issue_date}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {budget.valid_until || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 font-mono">
                      {formatCOP(budget.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-extrabold ${statusBadges[budget.status]}`}>
                        {statusLabels[budget.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          console.log('🔗 Navegando a editar presupuesto:', budget.id);
                          // Usar window.location.href en vez de router.push para forzar
                          // una recarga COMPLETA de página. Esto garantiza que el query
                          // param ?edit= llegue al servidor y useSearchParams funcione.
                          // router.push (client-side) puede ser interceptado por
                          // middleware/Suspense/Dokploy y perder los query params.
                          window.location.href = `/dashboard/presupuestos/nuevo?edit=${budget.id}`;
                        }}
                        className="text-slate-350 hover:text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Editar presupuesto"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between text-xs text-slate-450 bg-slate-50/30 select-none">
              <span>
                Mostrando <strong className="font-semibold text-slate-700">{startIndex + 1}</strong> a{" "}
                <strong className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, totalItems)}
                </strong>{" "}
                de <strong className="font-semibold text-slate-700">{totalItems}</strong> propuestas
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                
                <span className="font-mono text-slate-700">
                  Pág {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* CREATE BUDGET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">Crear Nuevo Presupuesto</h3>
              <button 
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddBudget} className="mt-4 space-y-4">
              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-650">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Number & Client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="b-number" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Número de Cotización
                  </label>
                  <input
                    id="b-number"
                    type="text"
                    required
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="PRE-006"
                  />
                </div>
                <div>
                  <label htmlFor="b-client" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Cliente
                  </label>
                  {clients.length === 0 ? (
                    <div className="flex items-center gap-2">
                      <select
                        disabled
                        className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600 outline-none cursor-not-allowed"
                      >
                        <option>No hay clientes registrados</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard/clientes")}
                        className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-primary-green/30 bg-primary-green/5 px-3 py-2 text-xs font-bold text-primary-green hover:bg-primary-green/10 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Crear Cliente
                      </button>
                    </div>
                  ) : (
                    <select
                      id="b-client"
                      required
                      value={newClientName}
                      onChange={(e) => {
                        setNewClientName(e.target.value);
                        setNewProjectName("");
                      }}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                    >
                      <option value="">-- Seleccionar --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Project Name → Select de proyectos del cliente */}
              <div>
                <label htmlFor="b-project" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Proyecto
                </label>
                {!newClientName ? (
                  <select
                    disabled
                    className="block w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 outline-none cursor-not-allowed"
                  >
                    <option>Selecciona un cliente primero</option>
                  </select>
                ) : (() => {
                  const clientProjects = projects.filter(p => p.client_name === newClientName);
                  if (clientProjects.length === 0) {
                    return (
                      <div className="flex items-center gap-2">
                        <select
                          disabled
                          className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600 outline-none cursor-not-allowed"
                        >
                          <option>Sin proyectos para este cliente</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/clientes")}
                          className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-primary-green/30 bg-primary-green/5 px-3 py-2 text-xs font-bold text-primary-green hover:bg-primary-green/10 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Crear Proyecto
                        </button>
                      </div>
                    );
                  }
                  return (
                    <select
                      id="b-project"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                    >
                      <option value="">-- Seleccionar proyecto --</option>
                      {clientProjects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="b-issue" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Fecha Emisión
                  </label>
                  <input
                    id="b-issue"
                    type="date"
                    required
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="b-valid" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Válido Hasta
                  </label>
                  <input
                    id="b-valid"
                    type="date"
                    required
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Total & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="b-total" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Monto Total (COP)
                  </label>
                  <input
                    id="b-total"
                    type="number"
                    required
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="3500000"
                  />
                </div>
                <div>
                  <label htmlFor="b-status" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Estado Inicial
                  </label>
                  <select
                    id="b-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
              </div>

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
                      Registrando...
                    </>
                  ) : (
                    "Crear Presupuesto"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
