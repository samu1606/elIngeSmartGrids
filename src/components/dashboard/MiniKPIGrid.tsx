import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Calendar, FileClock, AlertTriangle } from "lucide-react";

export default async function MiniKPIGrid() {
  const supabase = await createClient();
  
  let dynamicCitasCount = 3; // default fallback
  let dynamicBudgetsCount = 5; // default fallback
  let isMock = true;

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Fetch today's events count
    const { count: eventsCount, error: eventsErr } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("event_date", todayStr);

    // Fetch pending/enviado budgets count
    const { count: budgetsCount, error: budgetsErr } = await supabase
      .from("budgets")
      .select("*", { count: "exact", head: true })
      .in("status", ["pendiente", "enviado"]);

    if (eventsErr === null && budgetsErr === null) {
      dynamicCitasCount = eventsCount ?? 0;
      dynamicBudgetsCount = budgetsCount ?? 0;
      isMock = false;
    }
  } catch (err) {
    console.warn("Falla al conectar base de datos para KPIs, usando datos de demostración:", err);
  }

  const items = [
    {
      label: "Eficiencia RETIE",
      value: "98.5%",
      subtext: "Cumplimiento normativo",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-50",
    },
    {
      label: "Citas Hoy",
      value: `${dynamicCitasCount} Actividad(es)`,
      subtext: isMock ? "Inspecciones demo" : "Inspecciones programadas",
      icon: Calendar,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Presupuestos",
      value: `${dynamicBudgetsCount} Pendiente(s)`,
      subtext: "Esperando aprobación",
      icon: FileClock,
      color: "text-amber-500 bg-amber-50",
    },
    {
      label: "Alertas de Carga",
      value: "1 Activa",
      subtext: "Caída de tensión > 3%",
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div 
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-3xs font-semibold text-slate-500 uppercase tracking-wider block">
                {item.label}
              </span>
              <span className="text-sm font-bold text-slate-805 block mt-0.5">
                {item.value}
              </span>
              <span className="text-4xs text-slate-500 truncate block mt-0.5 font-medium">
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
