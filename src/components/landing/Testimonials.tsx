import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "El Inge me ha ahorrado días enteros en memorias de cálculo. La justificación técnica generada bajo la NTC 2050 es impecable y los inspectores RETIE la aprueban sin objeciones.",
      author: "Ing. Carlos Restrepo",
      role: "Consultor RETIE y Constructor",
      location: "Medellín, Col",
      stars: 5,
    },
    {
      quote: "Cotizar en segundos y llevar la agenda de mis visitas en obra en un solo sitio web ha organizado mi flujo. El retorno de inversión del Plan Pro se pagó en el primer proyecto.",
      author: "Diana Gómez",
      role: "Diseñadora de Redes Eléctricas",
      location: "Bogotá, Col",
      stars: 5,
    },
    {
      quote: "La calculadora trifásica y el dimensionamiento de conductores son rápidos y precisos. Es genial tener los calibres a 60°C de la Tabla 310-16 incorporados automáticamente.",
      author: "Ing. Mateo Chaves",
      role: "Ingeniero Contratista",
      location: "Cali, Col",
      stars: 5,
    },
  ];

  return (
    <section id="testimonios" className="py-20 sm:py-28 bg-slate-900/50 border-t border-slate-800/60 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Testimonios reales del sector
          </h2>
          <p className="text-lg text-slate-400">
            Ingenieros y electricistas en Colombia confían en nuestra precisión técnica para agilizar sus proyectos.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 hover:border-slate-700/60 transition-all duration-300"
            >
              {/* Review Quote */}
              <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                "{t.quote}"
              </p>

              <div>
                {/* Stars Rating */}
                <div className="flex gap-1 mb-4 text-amber-400">
                  {Array.from({ length: t.stars }).map((_, sIdx) => (
                    <Star key={sIdx} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>

                {/* Author Info */}
                <div className="border-t border-slate-800/60 pt-4">
                  <p className="text-sm font-bold text-white font-display">{t.author}</p>
                  <div className="flex justify-between items-center text-2xs text-slate-400 mt-1">
                    <span>{t.role}</span>
                    <span className="font-mono text-slate-500">{t.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
