"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Grid, 
  List, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Trash2, 
  X, 
  AlertCircle, 
  Building2, 
  User,
  ShieldCheck,
  CheckCircle,
  Loader2
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  type: string;
  nit: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  projects_count?: number;
  billed_amount?: string;
  created_at?: string;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: "mock-1",
    name: "Alimentos del Caribe S.A.S.",
    type: "empresa",
    nit: "900.123.456-7",
    phone: "311 555 4321",
    email: "contacto@alimentoscaribe.com",
    location: "Barranquilla, Atlántico",
    projects_count: 3,
    billed_amount: "$8,500,000 COP"
  },
  {
    id: "mock-2",
    name: "Inmobiliaria El Sol",
    type: "empresa",
    nit: "830.987.654-3",
    phone: "300 444 8888",
    email: "proyectos@inmoelsol.co",
    location: "Medellín, Antioquia",
    projects_count: 2,
    billed_amount: "$4,200,000 COP"
  },
  {
    id: "mock-3",
    name: "Carlos Mario Restrepo",
    type: "particular",
    nit: "1.020.304.506",
    phone: "315 222 1111",
    email: "carlos.restrepo@gmail.com",
    location: "Envigado, Antioquia",
    projects_count: 1,
    billed_amount: "$1,800,000 COP"
  },
  {
    id: "mock-4",
    name: "Diana Gómez Trujillo",
    type: "particular",
    nit: "52.876.543",
    phone: "310 999 7777",
    email: "diana.gomez@yahoo.com",
    location: "Bogotá, D.C.",
    projects_count: 2,
    billed_amount: "$3,600,000 COP"
  }
];

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("empresa");
  const [newNit, setNewNit] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const supabase = createClient();

  // Load clients
  const fetchClients = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data) {
        // Map database projects count or mock them for visual consistency
        const mappedData = data.map(item => ({
          ...item,
          projects_count: item.projects_count ?? 0,
          billed_amount: item.billed_amount ?? `$0 COP`
        }));
        setClients(mappedData);
        setIsMock(false);
      }
    } catch (err: any) {
      console.warn("Falla de base de datos remota, cargando en modo local:", err.message);
      setDbError(err.message || String(err));
      setClients(MOCK_CLIENTS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filter clients by search query
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add Client CRUD
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const clientData = {
      name: newName,
      type: newType,
      nit: newNit || null,
      phone: newPhone || null,
      email: newEmail || null,
      location: newLocation || null,
    };

    if (isMock) {
      // Local state add
      const newClient: Client = {
        id: `mock-${Date.now()}`,
        ...clientData,
        projects_count: 0,
        billed_amount: "$0 COP"
      };
      setClients([newClient, ...clients]);
      closeModal();
    } else {
      // Supabase database insert
      try {
        const { data, error } = await supabase
          .from("clients")
          .insert([clientData])
          .select();

        if (error) throw error;

        if (data) {
          const insertedClient = {
            ...data[0],
            projects_count: 0,
            billed_amount: "$0 COP"
          };
          setClients([insertedClient, ...clients]);
        }
        closeModal();
      } catch (err: any) {
        setSubmitError(err.message || "Error al guardar el cliente.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Delete Client CRUD
  const handleDeleteClient = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este cliente?")) {
      if (isMock || id.startsWith("mock-")) {
        // Local state delete
        setClients(clients.filter(c => c.id !== id));
      } else {
        // Supabase database delete
        try {
          const { error } = await supabase
            .from("clients")
            .delete()
            .eq("id", id);
          if (error) throw error;
          setClients(clients.filter(c => c.id !== id));
        } catch (err: any) {
          alert(`No se pudo eliminar el cliente de la base de datos: ${err.message}`);
        }
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewName("");
    setNewType("empresa");
    setNewNit("");
    setNewPhone("");
    setNewEmail("");
    setNewLocation("");
    setSubmitting(false);
    setSubmitError(null);
  };

  // KPI calculations
  const totalClients = clients.length;
  const totalCompanies = clients.filter(c => c.type === "empresa").length;
  const totalParticulars = clients.filter(c => c.type === "particular").length;
  const totalBilled = clients.reduce((acc, c) => {
    const numericStr = (c.billed_amount || "$0").replace(/[^0-9]/g, "");
    return acc + Number(numericStr);
  }, 0);
  const formattedBilled = `$${(totalBilled / 1000000).toFixed(1)}M COP`;

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <span>Directorio de Clientes</span>
            {isMock && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-4xs font-bold text-slate-500 uppercase tracking-wide">
                Modo Local (Mock)
              </span>
            )}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Gestiona la información de contacto y facturación de tus contratantes.
          </p>
          {isMock && dbError && (
            <div className="text-red-500 text-xs font-semibold mt-2 bg-red-50 border border-red-150 rounded-xl px-3 py-2 inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>Error de Base de Datos: {dbError}</span>
            </div>
          )}
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Database sync success notice */}
      {!isMock && (
        <div className="rounded-xl border border-emerald-150 bg-emerald-50 px-4 py-3 flex items-center gap-3 text-emerald-800 text-xs font-medium">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>Sincronizado con Supabase Cloud en tiempo real.</span>
        </div>
      )}

      {/* Client KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Clientes Totales</span>
          <span className="text-2xl font-black text-slate-850 font-display block mt-1">{totalClients}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Empresas (S.A.S/Ltda)</span>
          <span className="text-2xl font-black text-slate-850 font-display block mt-1 text-primary-green">{totalCompanies}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Particulares</span>
          <span className="text-2xl font-black text-slate-850 font-display block mt-1 text-blue-500">{totalParticulars}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Facturación Acumulada</span>
          <span className="text-2xl font-black text-slate-850 font-display block mt-1">{formattedBilled}</span>
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
            placeholder="Buscar por nombre, email o ciudad..."
          />
        </div>

        {/* View Toggles */}
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden self-stretch sm:self-auto shrink-0 bg-slate-50">
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

      {/* Clients Display Panel */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-green mb-4" />
          <p className="text-xs text-slate-400">Cargando directorio de clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50/50 p-12 text-center text-slate-450">
          <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h4 className="font-bold text-slate-500 font-display">No se encontraron clientes</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Intenta cambiar el término de búsqueda o registra un nuevo cliente en el botón superior.
          </p>
        </div>
      ) : viewType === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 font-bold text-slate-500 text-sm uppercase">
                      {client.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-805 font-display text-sm leading-tight max-w-[150px] truncate">
                        {client.name}
                      </h4>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-4xs font-extrabold uppercase mt-1 ${
                        client.type === "empresa" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {client.type === "empresa" ? "S.A.S / Empresa" : "Particular"}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-2xs text-slate-500 border-t border-slate-100 pt-4 font-medium">
                  {client.nit && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 tracking-wider text-3xs font-mono uppercase">NIT/CC:</span>
                      <span className="font-mono">{client.nit}</span>
                    </div>
                  )}
                  {client.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.location}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Billed footer */}
              <div className="flex justify-between items-center pt-4 mt-6 border-t border-slate-100 text-3xs font-bold uppercase tracking-wider text-slate-400">
                <span>{client.projects_count || 0} Proyectos</span>
                <span className="text-slate-700">{client.billed_amount || "$0 COP"}</span>
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
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Identificación</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Facturado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                        <span className={`inline-flex items-center rounded px-1 text-4xs font-extrabold uppercase ${
                          client.type === "empresa" 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-blue-50 text-blue-600"
                        }`}>
                          {client.type === "empresa" ? "Emp" : "Part"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {client.nit || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {client.location || "-"}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {client.phone || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {client.email || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {client.billed_amount || "$0 COP"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
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

      {/* CREATE CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">Registrar Nuevo Cliente</h3>
              <button 
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddClient} className="mt-4 space-y-4">
              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-650">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="modal-name" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre Completo / Razón Social
                </label>
                <input
                  id="modal-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Instalaciones Eléctricas S.A.S."
                />
              </div>

              {/* Type & Identificacion */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-type" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Tipo de Persona
                  </label>
                  <select
                    id="modal-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  >
                    <option value="empresa">Jurídica (Empresa)</option>
                    <option value="particular">Natural (Particular)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="modal-nit" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    NIT / Cédula
                  </label>
                  <input
                    id="modal-nit"
                    type="text"
                    value={newNit}
                    onChange={(e) => setNewNit(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="900.231.411-2"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-phone" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Teléfono Celular
                  </label>
                  <input
                    id="modal-phone"
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="315 123 4567"
                  />
                </div>
                <div>
                  <label htmlFor="modal-email" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                    placeholder="correo@empresa.com"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="modal-location" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ubicación (Ciudad, Departamento)
                </label>
                <input
                  id="modal-location"
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Bogotá, D.C."
                />
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
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cliente"
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
