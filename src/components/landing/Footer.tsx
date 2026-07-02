import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/80 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-5 w-5 fill-primary/20" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 font-display">
                El Inge <span className="text-primary font-light text-2xs tracking-widest uppercase block -mt-1">Smart Grids</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Plataforma SaaS número uno en Colombia para cálculos, diseño e informes de ingeniería eléctrica conforme a la NTC 2050 y el RETIE.
            </p>
          </div>

          {/* Links Column 1: Funciones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 font-display">Herramientas</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#caracteristicas" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Cálculo de Conductor
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Dimensionamiento de Motores
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Compensación de Reactiva
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Puestas a Tierra (R)
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Gestión */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 font-display">Gestión Comercial</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Base de Clientes (CRM)
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Presupuestos y Cotizaciones
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Agenda de Obra
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-400 hover:text-slate-900 transition-colors">
                  Memorias de cálculo IA
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Contacto */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 font-display">Soporte</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400">¿Preguntas o sugerencias?</span>
              </li>
              <li>
                <a href="mailto:soporte@elinge-smartgrids.com" className="text-primary hover:underline">
                  soporte@elinge-smartgrids.com
                </a>
              </li>
              <li className="pt-2 text-3xs text-slate-400 font-mono">
                Bogotá, D.C., Colombia
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Panel */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row justify-between items-center text-3xs text-slate-400 gap-4">
          <p>
            &copy; {currentYear} El Inge - Smart Grids. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium select-none">
              Hecho con pasión en Colombia 🇨🇴
            </span>
            <span>&middot;</span>
            <span className="font-mono">NTC 2050 Ed. 2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
