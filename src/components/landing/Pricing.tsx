import Link from "next/link";
import { Check, HelpCircle } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Básico",
      price: "$0",
      period: "Gratis para siempre",
      description: "Para técnicos electricistas independientes y estudiantes.",
      cta: "Comenzar Gratis",
      href: "/register",
      popular: false,
      features: [
        "Cálculos básicos de Sección (Monofásico)",
        "Hasta 3 clientes registrados",
        "Hasta 2 proyectos activos",
        "Tablas de ampacidad de referencia",
        "Soporte por correo electrónico",
      ],
    },
    {
      name: "Profesional",
      price: "$50,000",
      period: "COP / mes",
      description: "Para ingenieros consultores y contratistas de obra activos.",
      cta: "Probar Plan Pro",
      href: "/register?plan=pro",
      popular: true,
      features: [
        "Todos los cálculos (Trifásicos, Motores, Reactiva, Tierra)",
        "Clientes y proyectos ilimitados",
        "Justificación de cálculos con IA local",
        "Exportación de memorias de diseño a PDF",
        "Agenda de visitas técnicas y tareas de obra",
        "Presupuestos y cotizaciones en COP",
      ],
    },
    {
      name: "Empresarial",
      price: "$150,000",
      period: "COP / mes",
      description: "Para constructoras y firmas de diseño e ingeniería eléctrica.",
      cta: "Contactar Soporte",
      href: "mailto:soporte@elinge-smartgrids.com",
      popular: false,
      features: [
        "Todo lo incluido en Profesional",
        "Hasta 5 cuentas de usuario (colaboradores)",
        "Formatos oficiales UPME y Operadores de Red",
        "Integración con Google Calendar",
        "Soporte prioritario 24/7 y capacitaciones",
      ],
    },
  ];

  return (
    <section id="precios" className="py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Planes adaptados a tu ritmo de trabajo
          </h2>
          <p className="text-lg text-slate-400">
            Precios justos pensados para la realidad del sector eléctrico en Colombia. Sin contratos forzosos.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl border p-8 bg-white/60 transition-all duration-300 ${
                plan.popular 
                  ? "border-primary shadow-[0_0_25px_rgba(29,185,84,0.15)] md:-translate-y-4 scale-[1.02]" 
                  : "border-slate-200 hover:border-slate-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-2xs font-extrabold uppercase tracking-widest text-slate-950 select-none">
                  Recomendado
                </span>
              )}

              <div>
                {/* Plan Header */}
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{plan.name}</h3>
                <p className="text-slate-400 text-xs min-h-[40px] leading-relaxed mb-6">{plan.description}</p>
                
                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-slate-900 font-display">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-mono font-medium">{plan.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8 text-sm">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                href={plan.href}
                className={`w-full text-center py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                  plan.popular
                    ? "bg-primary text-slate-950 hover:bg-primary-dark active:scale-[0.98]"
                    : "border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
