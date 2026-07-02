import { Zap, Users, FileText, Sparkles, Check } from "lucide-react";

export default function Features() {
  const features = [
    {
      name: "Cálculos NTC 2050 Precisos",
      description: "Dimensiona calibres de conductores, ampacidades, caídas de tensión y protecciones. Diseñado conforme a las tablas de la NTC 2050 (incluyendo limitaciones del Art. 110-14).",
      icon: Zap,
      details: ["Tablas de ampacidad Cu/Al", "Cálculo de caída de tensión %", "Dimensionamiento de Motores y ITM"],
    },
    {
      name: "Gestión de Obras y Clientes",
      description: "Controla tu portafolio de clientes y proyectos eléctricos en un solo lugar. Asigna tareas, registra ubicaciones y mantén organizada tu cartera de obras.",
      icon: Users,
      details: ["Base de datos de Clientes", "Estados de Proyectos", "Agenda y Visitas Técnicas"],
    },
    {
      name: "Presupuestos y Cotizaciones",
      description: "Crea ofertas comerciales detalladas en pesos colombianos (COP). Administra el estado de tus presupuestos y exporta cotizaciones formales para tus clientes.",
      icon: FileText,
      details: ["Formatos listos para cliente", "Seguimiento de estados (Aceptado/Pendiente)", "Control de costos de materiales"],
    },
    {
      name: "Justificación RETIE con IA",
      description: "Genera automáticamente la memoria de cálculo y la justificación técnica requerida por dictámenes RETIE usando IA local adaptada a las normas nacionales.",
      icon: Sparkles,
      details: ["Redacción técnica automatizada", "Citas de artículos de la norma", "Exportación de memoria de diseño"],
    },
  ];

  return (
    <section id="caracteristicas" className="py-20 sm:py-28 bg-white/50 border-y border-slate-200/60 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Optimiza todo tu flujo de trabajo eléctrico
          </h2>
          <p className="text-lg text-slate-400">
            De la matemática técnica a la entrega de la propuesta comercial, centralizado en una única plataforma web moderna.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="relative rounded-2xl border border-slate-200 bg-white/40 p-6 sm:p-8 hover:border-slate-200/80 transition-all duration-300 group"
              >
                {/* Feature Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300 mb-6">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Feature Name */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">
                  {feature.name}
                </h3>

                {/* Feature Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Mini Features List */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200/60 text-xs font-mono text-slate-600">
                  {feature.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
