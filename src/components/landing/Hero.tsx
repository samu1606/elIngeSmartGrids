import Link from "next/link";
import { Zap, ShieldCheck, ArrowRight, Play, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-white">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-[#10b981]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          
          {/* Hero Left Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
            
            {/* Trust Badge */}
            <div className="inline-flex self-center lg:self-start items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 select-none">
              <ShieldCheck className="h-4 w-4" />
              <span>Conforme a NTC 2050 (Segunda Actualización) + RETIE</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              La plataforma completa <br className="hidden sm:inline" />
              para el mundo <span className="text-primary">eléctrico</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Conectamos ingenieros, técnicos, clientes y proveedores en un solo lugar. Calcula, gestiona, encuentra profesionales y cotiza materiales eléctricos bajo norma.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <Link
                href="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-slate-950 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
              >
                Comenzar Gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#caracteristicas"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/40 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-white hover:text-slate-900 transition-colors"
              >
                <Play className="h-4 w-4 fill-slate-400" />
                Ver Funciones
              </a>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-8 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-3xl font-bold text-slate-900 font-display">90%</p>
                <p className="text-xs text-slate-500 mt-1">Ahorro de Tiempo</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 font-display">100%</p>
                <p className="text-xs text-slate-500 mt-1">Precisión Técnica</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 font-display">COP</p>
                <p className="text-xs text-slate-500 mt-1">Precios Locales</p>
              </div>
            </div>
          </div>

          {/* Hero Right Mockup */}
          <div className="col-span-12 lg:col-span-6 mt-12 lg:mt-0">
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              
              {/* Decorative Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 opacity-20 blur-xl" />

              {/* Glassmorphic Mockup Dashboard */}
              <div className="relative rounded-2xl border border-slate-200 bg-white/90 shadow-2xl overflow-hidden glass-panel">
                
                {/* Mockup Header/Chrome */}
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="mx-auto text-xs text-slate-400 select-none font-mono">elinge-smartgrids.com/dashboard/calculadora</span>
                </div>

                {/* Mockup Content */}
                <div className="p-5 sm:p-6 text-left">
                  
                  {/* Title & Tabs */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-slate-800">Dimensionamiento de Conductor (NTC 2050)</span>
                    </div>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-3xs font-medium text-primary select-none border border-primary/20">RETIE OK</span>
                  </div>

                  {/* Tabs simulation */}
                  <div className="flex border-b border-slate-200 gap-4 text-xs pb-2 mb-4">
                    <span className="text-primary border-b-2 border-primary pb-2 font-medium">Sección</span>
                    <span className="text-slate-400 pb-2">Protecciones</span>
                    <span className="text-slate-400 pb-2">Motores</span>
                    <span className="text-slate-400 pb-2">Reactiva</span>
                  </div>

                  {/* Mock Input Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-3xs text-slate-400 uppercase tracking-wider mb-1">Carga (Watts)</label>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800">15000 W</div>
                    </div>
                    <div>
                      <label className="block text-3xs text-slate-400 uppercase tracking-wider mb-1">Tensión (V)</label>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800">208 V (Trifásico)</div>
                    </div>
                    <div>
                      <label className="block text-3xs text-slate-400 uppercase tracking-wider mb-1">Aislamiento</label>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800">XLPE / 90°C</div>
                    </div>
                    <div>
                      <label className="block text-3xs text-slate-400 uppercase tracking-wider mb-1">Material</label>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800">Cobre (Cu)</div>
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <div className="w-full rounded-lg bg-primary/10 border border-primary/20 text-center py-2.5 text-xs font-semibold text-primary mb-5 select-none">
                    Calcular Sección Recomendada
                  </div>

                  {/* Mock Result Output Panel */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xs text-slate-400 uppercase tracking-wider">Conductor Recomendado</span>
                      <span className="text-3xs text-slate-400 font-mono">NTC 2050 Tab. 310-16</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-extrabold text-slate-900 font-display">8 AWG</span>
                      <span className="text-xs text-primary font-semibold">Cu - XLPE</span>
                    </div>
                    
                    {/* Details lines */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 text-2xs font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>Corriente de Diseño (I):</span>
                        <span className="text-slate-800">52.04 A (1.25x)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Caída de Tensión Calculada:</span>
                        <span className="text-emerald-400">1.48% (L=15m)</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
