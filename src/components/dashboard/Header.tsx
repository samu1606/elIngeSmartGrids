"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, User, X, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
  userPlan?: string;
}

export default function Header({
  onMenuClick,
  userPlan = "basic",
}: HeaderProps) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      router.push(`/dashboard/proyectos?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "Presupuesto Aceptado",
      desc: "Alimentos del Caribe S.A.S. aceptó la propuesta PRE-001.",
      time: "Hace 10 min",
      type: "success",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-50"
    },
    {
      id: 2,
      title: "Actividad Programada",
      desc: "Visita Técnica programada para hoy a las 09:00 AM.",
      time: "Hace 1 hora",
      type: "info",
      icon: Calendar,
      color: "text-blue-500 bg-blue-50"
    },
    {
      id: 3,
      title: "Alerta de Carga",
      desc: "Caída de tensión calculada supera el 3% en alimentador.",
      time: "Hace 3 horas",
      type: "warning",
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-50"
    }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 md:px-8">
      
      {/* Mobile Drawer Trigger & Search */}
      <div className="flex flex-1 items-center gap-4">
        {/* Menu Hamburger Button for Mobile */}
        <button
          onClick={onMenuClick}
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none md:hidden transition-colors cursor-pointer"
        >
          <span className="sr-only">Abrir sidebar</span>
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-xs md:max-w-sm hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-primary/60 focus:bg-white transition-all"
            placeholder="Buscar proyectos... (Presiona Enter)"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4 relative">
        
        {/* Plan status badge */}
        <div className="hidden xs:block">
          {userPlan === "pro" ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-3xs font-extrabold text-primary uppercase tracking-wide">
              Plan Profesional
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-3xs font-bold text-slate-500 uppercase tracking-wide">
              Plan Básico
            </span>
          )}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            type="button"
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="sr-only">Ver notificaciones</span>
            <Bell className="h-5 w-5" />
            {/* Notification bubble indicator */}
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl py-2 z-50 animate-scale-in">
              <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 font-display">Notificaciones</span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-650 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notif.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-2xs font-bold text-slate-800 leading-tight">{notif.title}</p>
                        <p className="text-4xs text-slate-400 font-medium leading-relaxed mt-0.5">{notif.desc}</p>
                        <span className="text-5xs text-slate-400 font-semibold mt-1 block font-mono">{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-250" />

        {/* User Quick View */}
        <Link 
          href="/dashboard/ajustes"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
          title="Ver Ajustes / Perfil"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            <User className="h-4.5 w-4.5" />
          </div>
        </Link>

      </div>
    </header>
  );
}
