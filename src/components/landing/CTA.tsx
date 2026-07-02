import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-t border-slate-200/80 bg-slate-50/20">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[400px] w-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-850 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-6 py-12 sm:px-12 sm:py-16 text-center shadow-2xl relative overflow-hidden">
          
          {/* Subtle lightning bolt watermarks */}
          <div className="absolute -top-12 -right-12 text-slate-800/20 opacity-30 select-none pointer-events-none">
            <Zap className="h-48 w-48 stroke-[1px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              ¿Listo para digitalizar tus proyectos?
            </h2>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              Únete a cientos de electricistas e ingenieros colombianos. Realiza cálculos, gestiona obras, presupuestos y genera reportes RETIE en una sola herramienta.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-slate-950 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
              >
                Crear Cuenta Gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Note */}
            <p className="text-xs text-slate-400 mt-4 select-none font-medium">
              No requiere tarjeta de crédito · Registro en 1 minuto
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
