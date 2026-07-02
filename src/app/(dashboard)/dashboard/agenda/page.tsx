"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  X, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Info,
  Check
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  category: "visita" | "mantenimiento" | "auditoria";
  client_name?: string;
  created_at?: string;
}

// Helper to get formatted date string YYYY-MM-DD
const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Generates dynamic mock events relative to the current week
const generateMockEvents = (baseDate: Date): Event[] => {
  const currentDay = baseDate.getDay();
  // Calculate Monday of the current week
  const mondayOffset = baseDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(baseDate);
  monday.setDate(mondayOffset);

  const getRelativeDateStr = (daysFromMonday: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + daysFromMonday);
    return formatDateString(d);
  };

  return [
    {
      id: "mock-e1",
      title: "Visita Técnica Bodega C",
      description: "Inspección de acometidas trifásicas y verificación de cargabilidad de tableros.",
      event_date: getRelativeDateStr(0), // Lunes
      start_time: "09:00",
      end_time: "11:00",
      category: "visita",
      client_name: "Alimentos del Caribe S.A.S."
    },
    {
      id: "mock-e2",
      title: "Mantenimiento Preventivo Transformador",
      description: "Pruebas de aislamiento, limpieza de bornes y ajuste de conexiones.",
      event_date: getRelativeDateStr(1), // Martes
      start_time: "14:00",
      end_time: "17:30",
      category: "mantenimiento",
      client_name: "Inmobiliaria El Sol"
    },
    {
      id: "mock-e3",
      title: "Auditoría Dictamen RETIE",
      description: "Inspección final del sistema de puesta a tierra y rotulación de tableros para certificación.",
      event_date: getRelativeDateStr(2), // Miércoles
      start_time: "10:00",
      end_time: "13:00",
      category: "auditoria",
      client_name: "Diana Gómez Trujillo"
    },
    {
      id: "mock-e4",
      title: "Revisión Planos de Redes",
      description: "Reunión de aprobación para el trazado de la canalización subterránea.",
      event_date: getRelativeDateStr(4), // Viernes
      start_time: "08:30",
      end_time: "10:30",
      category: "visita",
      client_name: "Constructora Andes"
    },
    {
      id: "mock-e5",
      title: "Pruebas de Termografía",
      description: "Escaneo térmico de tableros principales para identificar puntos calientes.",
      event_date: getRelativeDateStr(4), // Viernes
      start_time: "14:00",
      end_time: "16:00",
      category: "mantenimiento",
      client_name: "Alimentos del Caribe S.A.S."
    }
  ];
};

export default function AgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  
  // Date states for the active week
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    return mon;
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [newCategory, setNewCategory] = useState<"visita" | "mantenimiento" | "auditoria">("visita");
  const [newClientName, setNewClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const supabase = createClient();

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      if (data) {
        const mappedEvents: Event[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          event_date: item.event_date,
          start_time: item.start_time.substring(0, 5),
          end_time: item.end_time.substring(0, 5),
          category: item.category as any,
          client_name: item.client_name || ""
        }));
        setEvents(mappedEvents);
        setIsMock(false);
      }
    } catch (err: any) {
      console.warn("Falla al conectar base de datos de agenda, cargando datos locales:", err.message);
      setEvents(generateMockEvents(new Date()));
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Set default event date in modal to current week's Monday if empty
  useEffect(() => {
    if (isModalOpen && !newEventDate) {
      setNewEventDate(formatDateString(new Date()));
    }
  }, [isModalOpen, newEventDate]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStartDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStartDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStartDate);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStartDate(next);
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    setCurrentWeekStartDate(mon);
  };

  // Helper to construct the 7 days of the active week
  const getWeekDays = () => {
    const days = [];
    const names = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStartDate);
      d.setDate(currentWeekStartDate.getDate() + i);
      days.push({
        dateStr: formatDateString(d),
        dayName: names[i],
        dayNumber: d.getDate(),
        monthLabel: d.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""),
        isToday: formatDateString(d) === formatDateString(new Date()),
        fullDate: d
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekRangeLabel = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.dayNumber} ${start.monthLabel} - ${end.dayNumber} ${end.monthLabel} (${currentWeekStartDate.getFullYear()})`;
  };

  // Add Event CRUD
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const eventData = {
      title: newTitle,
      description: newDescription || null,
      event_date: newEventDate,
      start_time: newStartTime,
      end_time: newEndTime,
      category: newCategory,
      client_name: newClientName || null
    };

    if (isMock) {
      const newEvent: Event = {
        id: `mock-e-${Date.now()}`,
        ...eventData,
        description: eventData.description || "",
        client_name: eventData.client_name || ""
      };
      
      const updated = [...events, newEvent].sort((a, b) => {
        if (a.event_date !== b.event_date) {
          return a.event_date.localeCompare(b.event_date);
        }
        return a.start_time.localeCompare(b.start_time);
      });
      setEvents(updated);
      closeModal();
    } else {
      try {
        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select();

        if (error) throw error;

        if (data) {
          const inserted: Event = {
            id: data[0].id,
            title: data[0].title,
            description: data[0].description || "",
            event_date: data[0].event_date,
            start_time: data[0].start_time.substring(0, 5),
            end_time: data[0].end_time.substring(0, 5),
            category: data[0].category as any,
            client_name: data[0].client_name || ""
          };
          const updated = [...events, inserted].sort((a, b) => {
            if (a.event_date !== b.event_date) {
              return a.event_date.localeCompare(b.event_date);
            }
            return a.start_time.localeCompare(b.start_time);
          });
          setEvents(updated);
        }
        closeModal();
      } catch (err: any) {
        setSubmitError(err.message || "Error al programar la actividad.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Delete Event CRUD
  const handleDeleteEvent = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta actividad de la agenda?")) {
      if (isMock || id.startsWith("mock-")) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        try {
          const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id);
          if (error) throw error;
          setEvents(events.filter(e => e.id !== id));
        } catch (err: any) {
          alert(`No se pudo eliminar de la base de datos: ${err.message}`);
        }
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewStartTime("09:00");
    setNewEndTime("10:00");
    setNewCategory("visita");
    setNewClientName("");
    setSubmitting(false);
    setSubmitError(null);
  };

  // Render cards by categories
  const categoryStyles = {
    visita: {
      bg: "bg-blue-50/90 border-l-[4px] border-l-blue-500 border border-blue-200 text-blue-900 hover:bg-blue-100/60",
      badge: "bg-blue-100 text-blue-800",
      dot: "bg-blue-500",
      label: "Visita"
    },
    mantenimiento: {
      bg: "bg-emerald-50/90 border-l-[4px] border-l-emerald-500 border border-emerald-200 text-emerald-900 hover:bg-emerald-100/60",
      badge: "bg-emerald-100 text-emerald-800",
      dot: "bg-emerald-500",
      label: "Mantenimiento"
    },
    auditoria: {
      bg: "bg-purple-50/90 border-l-[4px] border-l-purple-500 border border-purple-200 text-purple-900 hover:bg-purple-100/60",
      badge: "bg-purple-100 text-purple-800",
      dot: "bg-purple-500",
      label: "Auditoría / RETIE"
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <span>Agenda Semanal</span>
            {isMock && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-4xs font-bold text-slate-500 uppercase tracking-wide">
                Modo Local (Mock)
              </span>
            )}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Gestión y calendarización de visitas, inspecciones RETIE y mantenimientos eléctricos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Programar Actividad</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Week Navigation */}
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={handlePrevWeek}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            title="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleCurrentWeek}
            className="px-3 py-2 border border-slate-200 text-2xs font-bold uppercase rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            Hoy
          </button>
          
          <button
            onClick={handleNextWeek}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            title="Siguiente semana"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="ml-2 font-display text-sm font-extrabold text-slate-700">
            {weekRangeLabel()}
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Filtrar:</span>
          <div className="flex gap-1.5">
            {[
              { id: "todos", label: "Todos" },
              { id: "visita", label: "Visitas" },
              { id: "mantenimiento", label: "Mantenimiento" },
              { id: "auditoria", label: "Auditorías" }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setCategoryFilter(filter.id)}
                className={`px-3 py-1.5 text-3xs font-bold rounded-lg border transition-all cursor-pointer shrink-0 ${
                  categoryFilter === filter.id
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-550 hover:bg-slate-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 7-Day Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-h-[500px]">
        {weekDays.map((day) => {
          // Filter events for this specific day
          const dayEvents = events.filter(e => {
            const matchesDate = e.event_date === day.dateStr;
            const matchesCategory = categoryFilter === "todos" || e.category === categoryFilter;
            return matchesDate && matchesCategory;
          });

          return (
            <div 
              key={day.dateStr} 
              className={`rounded-2xl border bg-white p-3.5 shadow-xs flex flex-col min-h-[300px] transition-all ${
                day.isToday 
                  ? "border-primary-green ring-1 ring-primary-green/20 bg-emerald-50/5" 
                  : "border-slate-200"
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                <div>
                  <h4 className={`text-2xs font-extrabold uppercase tracking-wide ${day.isToday ? "text-primary-green" : "text-slate-450"}`}>
                    {day.dayName}
                  </h4>
                  <span className="text-lg font-black text-slate-800 font-display">
                    {day.dayNumber} <span className="text-3xs font-semibold text-slate-400 capitalize">{day.monthLabel}</span>
                  </span>
                </div>
                {day.isToday && (
                  <span className="rounded-full bg-primary-green/10 px-2 py-0.5 text-4xs font-black text-primary-green uppercase tracking-wider">
                    Hoy
                  </span>
                )}
              </div>

              {/* Events List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <CalendarIcon className="h-5 w-5 text-slate-200 mb-1" />
                    <span className="text-4xs font-bold text-slate-350 uppercase tracking-wider">Libre</span>
                  </div>
                ) : (
                  dayEvents.map((event) => {
                    const style = categoryStyles[event.category];
                    return (
                      <div 
                        key={event.id}
                        className={`group relative rounded-xl p-3 flex flex-col justify-between transition-all select-none ${style.bg}`}
                      >
                        {/* Event Title & Delete button */}
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-bold text-2xs leading-tight tracking-tight pr-4">
                            {event.title}
                          </h5>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-450 hover:text-rose-500 p-0.5 rounded transition-all cursor-pointer"
                            title="Eliminar evento"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-4xs text-slate-500 font-medium leading-relaxed mt-1 mb-2.5 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Event Metadata */}
                        <div className="space-y-1 mt-auto pt-2 border-t border-slate-900/5">
                          <div className="flex items-center gap-1 text-4xs font-semibold font-mono text-slate-500">
                            <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                            <span>{event.start_time} - {event.end_time}</span>
                          </div>
                          {event.client_name && (
                            <div className="flex items-center gap-1 text-4xs font-bold text-slate-600 truncate">
                              <User className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate">{event.client_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-3.5 items-start max-w-3xl">
        <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500">
          <p className="font-bold text-slate-700 mb-0.5">Gestión Normativa y de Auditorías</p>
          <p className="leading-relaxed">
            Las tareas tipo <strong className="text-purple-800">Auditoría / RETIE</strong> corresponden a revisiones técnicas obligatorias del Código Eléctrico Colombiano (NTC 2050). Asegúrese de programarlas con tiempo y cargar los planos aprobados.
          </p>
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800 font-display">Programar Actividad en Agenda</h3>
              <button 
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEvent} className="mt-4 space-y-4">
              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-650">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="ev-title" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Título de la Actividad
                </label>
                <input
                  id="ev-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Ej. Inspección RETIE Tableros"
                />
              </div>

              {/* Client Name */}
              <div>
                <label htmlFor="ev-client" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cliente (Opcional)
                </label>
                <input
                  id="ev-client"
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white"
                  placeholder="Ej. Alimentos del Caribe S.A.S."
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="ev-date" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Fecha
                </label>
                <input
                  id="ev-date"
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                />
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ev-start" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Hora Inicio
                  </label>
                  <input
                    id="ev-start"
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="ev-end" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Hora Fin
                  </label>
                  <input
                    id="ev-end"
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Tipo de Actividad
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "visita", label: "Visita", class: "border-blue-300 text-blue-800 bg-blue-50/50 hover:bg-blue-50 focus:ring-blue-200" },
                    { id: "mantenimiento", label: "Mantenimiento", class: "border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 focus:ring-emerald-200" },
                    { id: "auditoria", label: "Auditoría RETIE", class: "border-purple-300 text-purple-800 bg-purple-50/50 hover:bg-purple-50 focus:ring-purple-200" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`py-2 px-1 text-4xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        newCategory === cat.id
                          ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-900"
                          : `border-slate-200 text-slate-650 bg-slate-50 hover:bg-slate-100`
                      }`}
                    >
                      {newCategory === cat.id && <Check className="h-3 w-3" />}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="ev-desc" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Descripción / Notas
                </label>
                <textarea
                  id="ev-desc"
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-primary-green/65 focus:bg-white resize-none"
                  placeholder="Detalles sobre las herramientas requeridas, normas RETIE aplicables..."
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
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
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cita"
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
