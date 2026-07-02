"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  LayoutDashboard, 
  Calculator, 
  FolderOpen, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  Shield,
  CreditCard,
  Sun,
  Wrench,
  Briefcase
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userPlan?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  userEmail = "",
  userName = "Ingeniero Eléctrico",
  userRole = "Ingeniero Eléctrico",
  userPlan = "basic",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Calculadora", href: "/dashboard/calculadora", icon: Calculator },
    { label: "Proyectos", href: "/dashboard/proyectos", icon: FolderOpen },
    { label: "Clientes", href: "/dashboard/clientes", icon: Users },
    { label: "Presupuestos", href: "/dashboard/presupuestos", icon: FileText },
    { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
    { label: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    { label: "DISEÑO RETIE 2024", href: "/dashboard/reportes/retie", icon: Shield },
    { label: "Fotovoltaico", href: "/dashboard/fotovoltaico", icon: Sun },
    { label: "Técnicos", href: "/dashboard/tecnicos", icon: Wrench },
    { label: "Trabajos", href: "/dashboard/trabajos", icon: Briefcase },
    { label: "Suscripción", href: "/dashboard/suscripcion", icon: CreditCard },
    { label: "Ajustes", href: "/dashboard/ajustes", icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-slate-200 text-slate-700 shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={handleLinkClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Zap className="h-5 w-5 fill-white/20" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-display">
            El Inge <span className="text-primary font-light text-2xs tracking-widest uppercase block -mt-1">Smart Grids</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          // Exact match for /dashboard, startsWith for others
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={index}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/10" 
                  : "hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-700"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Panel */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail || userRole}</p>
          </div>
          {userPlan === "pro" && (
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-3xs font-extrabold text-primary uppercase tracking-wide">
              PRO
            </span>
          )}
        </div>

        {/* Sign Out Button */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-red-500/20 bg-slate-900/40 hover:bg-red-500/10 py-2.5 text-xs font-bold text-slate-400 hover:text-red-200 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
