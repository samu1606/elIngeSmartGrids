"use client";

import Link from "next/link";
import { Wrench, Briefcase, Package, Zap, ArrowRight } from "lucide-react";

const roles = [
  {
    id: "pro",
    icon: Zap,
    title: "Para profesionales",
    description: "Calculadora, proyectos, clientes, presupuestos, reportes RETIE y mucho más. Todo en una sola plataforma.",
    href: "/dashboard",
    badge: "Para ingenieros",
    color: "from-violet-500 to-purple-400",
    border: "border-violet-200 hover:border-violet-400",
    bg: "hover:bg-violet-50",
  },
  {
    id: "cliente",
    icon: Briefcase,
    title: "Necesito un técnico",
    description: "Publica un trabajo, busca profesionales verificados y recibe cotizaciones.",
    href: "/dashboard/trabajos",
    badge: "Para clientes",
    color: "from-blue-500 to-cyan-400",
    border: "border-blue-200 hover:border-blue-400",
    bg: "hover:bg-blue-50",
  },
  {
    id: "tecnico",
    icon: Wrench,
    title: "Soy técnico",
    description: "Encuentra trabajos eléctricos, crea tu perfil y recibe solicitudes.",
    href: "/dashboard/tecnicos",
    badge: "Para profesionales",
    color: "from-emerald-500 to-green-400",
    border: "border-emerald-200 hover:border-emerald-400",
    bg: "hover:bg-emerald-50",
  },
  {
    id: "proveedor",
    icon: Package,
    title: "Soy proveedor",
    description: "Ofrece tus materiales y equipos a proyectos eléctricos activos.",
    href: "/dashboard/proveedores",
    badge: "Para tiendas y distribuidores",
    color: "from-amber-500 to-orange-400",
    border: "border-amber-200 hover:border-amber-400",
    bg: "hover:bg-amber-50",
  },
];

export default function RoleSelector() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            ¿Cómo quieres usar El Inge Smart Grids?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Elige tu perfil
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Cada usuario ve solo lo que necesita. Sin ruido, sin funciones que no vas a usar.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.id}
                href={role.href}
                className={`group relative flex flex-col items-center text-center rounded-2xl border-2 ${role.border} ${role.bg} bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
              >
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {role.badge}
                </span>

                {/* Icon */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} mb-5 shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {role.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  {role.description}
                </p>

                {/* CTA arrow */}
                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                  Empezar
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-slate-400 mt-10">
          ¿No sabes cuál elegir? <Link href="/register" className="font-semibold text-primary hover:underline">Regístrate</Link> y cámbiate cuando quieras.
        </p>
      </div>
    </section>
  );
}