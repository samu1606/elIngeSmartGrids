import { createClient } from "@/lib/supabase/server";
import KPICard from "@/components/dashboard/KPICard";
import RecentProjects from "@/components/dashboard/RecentProjects";
import MiniKPIGrid from "@/components/dashboard/MiniKPIGrid";
import { FolderOpen, Zap, BarChart3, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch full name from profile
  let userName = "Ingeniero";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile?.full_name) {
      // Get first name only for friendly greeting
      userName = profile.full_name.split(" ")[0];
    } else if (user.user_metadata?.full_name) {
      userName = user.user_metadata.full_name.split(" ")[0];
    }
  }

  // Fetch active projects count
  let activeProjectsCount = "12";
  try {
    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "en_proceso");
    if (error === null && count !== null) {
      activeProjectsCount = String(count);
    }
  } catch (err) {
    console.warn("Falla al conectar base de datos para proyectos activos KPI:", err);
  }

  // Format current date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString('es-CO', dateOptions);
  // Capitalize first letter of day
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
            ¡Hola, {userName}!
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {displayDate}
          </p>
        </div>
        <div>
          <Link 
            href="/dashboard/proyectos"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            <span>Nuevo Proyecto</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Row (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Proyectos Activos"
          value={activeProjectsCount}
          icon={FolderOpen}
          trend="+18%"
          trendType="up"
          description="vs mes anterior"
        />
        <KPICard
          title="Capacidad Diseñada"
          value="142.5 kW"
          icon={Zap}
          trend="+8%"
          trendType="up"
          description="Total acumulado"
        />
        <KPICard
          title="Ahorro por Reactiva"
          value="$1.2M COP"
          icon={BarChart3}
          trend="+12%"
          trendType="up"
          description="Ahorro estimado clientes"
        />
      </div>

      {/* Grid: Recent Projects */}
      <div className="w-full">
        <RecentProjects />
      </div>

      {/* Operational footer summary */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-display">
          Estado Operativo Semanal
        </h3>
        <MiniKPIGrid />
      </div>

    </div>
  );
}
