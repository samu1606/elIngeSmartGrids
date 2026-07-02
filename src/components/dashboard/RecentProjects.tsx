import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  client_name: string;
  status: "en_proceso" | "completado" | "cotizado";
  progress: number;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Instalación Solar Residencial",
    client_name: "Inmobiliaria El Sol",
    status: "en_proceso",
    progress: 65,
  },
  {
    id: "2",
    name: "Diseño Red Trifásica - Bodega C",
    client_name: "Alimentos del Caribe S.A.S.",
    status: "cotizado",
    progress: 20,
  },
  {
    id: "3",
    name: "Acometida Eléctrica Edificio",
    client_name: "Constructora Andes",
    status: "completado",
    progress: 100,
  },
  {
    id: "4",
    name: "Certificación RETIE Oficinas Centrales",
    client_name: "Bancolombia S.A.",
    status: "en_proceso",
    progress: 45,
  },
];

export default async function RecentProjects() {
  const supabase = await createClient();
  let projects: Project[] = [];

  try {
    const { data } = await supabase
      .from("projects")
      .select("id, name, client_name, status, progress")
      .order("created_at", { ascending: false })
      .limit(4);

    if (data && data.length > 0) {
      projects = data as Project[];
    } else {
      projects = MOCK_PROJECTS;
    }
  } catch (err) {
    console.warn("Falla al cargar proyectos del servidor, cargando locales:", err);
    projects = MOCK_PROJECTS;
  }

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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 font-display">Proyectos Recientes</h3>
        <Link 
          href="/dashboard/proyectos"
          className="text-xs font-bold text-primary hover:text-primary-dark"
        >
          Ver todos
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Proyecto</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Progreso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800 truncate max-w-[200px]" title={project.name}>
                  {project.name}
                </td>
                <td className="px-6 py-4 truncate max-w-[150px]" title={project.client_name}>
                  {project.client_name}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-extrabold ${statusBadges[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </td>
                <td className="px-6 py-4 w-44">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.status === "completado" ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="font-mono font-medium text-slate-500 text-3xs w-8 text-right">
                      {project.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
