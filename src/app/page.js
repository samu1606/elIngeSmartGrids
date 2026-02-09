'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Icons as SVG components
const ZapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const CalculatorIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

const ClipboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <CalculatorIcon />,
      title: 'Calculadora Eléctrica',
      description: 'Calcula secciones de cables, caídas de tensión, potencias y corrientes según normativa REBT e IEC.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <ClipboardIcon />,
      title: 'Gestión de Proyectos',
      description: 'Organiza tus instalaciones, documenta con fotos y notas, y genera informes profesionales.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <DocumentIcon />,
      title: 'Presupuestos y Facturas',
      description: 'Genera presupuestos profesionales al instante y conviértelos en facturas con un clic.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <UsersIcon />,
      title: 'CRM de Clientes',
      description: 'Gestiona tu cartera de clientes, historial de trabajos y programación de mantenimientos.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <ChartIcon />,
      title: 'Dashboard Analítico',
      description: 'Visualiza el rendimiento de tu negocio con métricas en tiempo real y reportes detallados.',
      color: 'from-rose-500 to-red-500'
    },
    {
      icon: <ZapIcon />,
      title: 'Cumplimiento Normativo',
      description: 'Mantente al día con REBT, normas UNE e IEC integradas en cada cálculo y documento.',
      color: 'from-violet-500 to-indigo-500'
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: 'Gratis',
      period: 'para siempre',
      description: 'Perfecto para empezar',
      features: [
        'Calculadora eléctrica básica',
        '5 proyectos activos',
        '10 clientes',
        '5 presupuestos/mes',
        'Soporte por email'
      ],
      cta: 'Empezar Gratis',
      featured: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/mes',
      description: 'Para profesionales activos',
      features: [
        'Todo de Starter',
        'Calculadoras avanzadas',
        'Proyectos ilimitados',
        'Clientes ilimitados',
        'Facturación integrada',
        'Generador de informes',
        'Soporte prioritario'
      ],
      cta: 'Prueba 14 días gratis',
      featured: true
    },
    {
      name: 'Enterprise',
      price: '$79',
      period: '/mes',
      description: 'Para empresas y equipos',
      features: [
        'Todo de Professional',
        'Usuarios ilimitados',
        'API personalizada',
        'Integraciones avanzadas',
        'White-label disponible',
        'SLA garantizado',
        'Account manager dedicado'
      ],
      cta: 'Contactar Ventas',
      featured: false
    }
  ]

  const stats = [
    { value: '5,000+', label: 'Electricistas Activos' },
    { value: '50,000+', label: 'Proyectos Completados' },
    { value: '€2M+', label: 'Facturado por usuarios' },
    { value: '99.9%', label: 'Uptime garantizado' }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass bg-slate-900 shadow-xl py-4' : 'bg-transparent py-6'
        }`}>
        <div className="container-custom mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ZapIcon />
              </div>
              <span className="text-xl font-bold text-white">ElectriPro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Características</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Precios</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonios</a>
              <Link href="/dashboard" className="btn-secondary py-2 px-4 text-sm">
                Iniciar Sesión
              </Link>
              <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                Empezar Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass mt-4 mx-4 rounded-2xl p-6 animate-fadeIn">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors py-2">Características</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors py-2">Precios</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors py-2">Testimonios</a>
              <hr className="border-gray-700" />
              <Link href="/dashboard" className="btn-secondary text-center">
                Iniciar Sesión
              </Link>
              <Link href="/dashboard" className="btn-primary text-center">
                Empezar Gratis
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient w-full flex flex-col justify-center pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="container-custom mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Nueva versión 2.0 disponible
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                El Software que
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Potencia</span>
                <br />tu Negocio Eléctrico
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-xl">
                Gestiona proyectos, calcula instalaciones, genera presupuestos y facturas.
                Todo lo que necesitas para hacer crecer tu empresa de instalaciones eléctricas.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-12">
                <Link href="/dashboard" className="btn-primary text-center text-lg py-5 px-10 shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">
                  Comenzar Gratis
                  <span className="ml-2">→</span>
                </Link>
                <a href="#demo" className="btn-secondary text-center text-lg py-5 px-10 hover:bg-slate-800 transition-all">
                  Ver Demo
                </a>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">+5,000 profesionales activos</p>
                </div>
              </div>
            </div>

            {/* Hero Visuals */}
            <div className="relative animate-fadeIn flex flex-col gap-6 mt-12 lg:mt-0" style={{ animationDelay: '0.2s' }}>
              {/* Floating Dashboard Card */}
              <div className="glass-card p-6 animate-float z-10 relative backdrop-blur-xl border border-white/10 shadow-2xl mt-10 md:mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-xl border border-white/5">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Facturación Mensual</p>
                      <p className="text-2xl font-bold text-green-400">€12,450</p>
                    </div>
                    <div className="text-green-400 bg-green-400/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">
                      +23.5%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Proyectos</p>
                      <p className="text-xl font-bold text-white">24</p>
                    </div>
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Clientes</p>
                      <p className="text-xl font-bold text-white">156</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Plan Image */}
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-blue-600/20 rounded-3xl blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
                <img
                  src="/images/hero-engineer-v2.png"
                  alt="Ingeniero en obra gestionando proyectos eléctricos con ElectriPro"
                  className="w-full h-auto rounded-3xl shadow-2xl border border-white/10 relative z-0 transform group-hover:scale-[1.02] transition-all duration-700 brightness-110 object-cover"
                />
              </div>

              {/* Decorative Glows */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-slate-800 bg-slate-900/30 backdrop-blur-sm w-full">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                  {stat.value}
                </p>
                <p className="text-gray-400 mt-3 font-medium uppercase tracking-widest text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative overflow-hidden bg-slate-950/20 scroll-mt-24 w-full">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="container-custom mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Todo lo que necesitas en
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> una plataforma</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Herramientas profesionales diseñadas específicamente para electricistas e instaladores.
              Ahorra tiempo y aumenta tu productividad con tecnología de vanguardia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="feature-card group p-8 bg-slate-800/20 hover:bg-slate-800/40 transition-all border border-white/5 hover:border-blue-500/30">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative w-full">
        <div className="absolute inset-0 bg-blue-600/5 -skew-y-3 transform origin-right"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card p-16 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
                ¿Listo para transformar tu negocio?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Únete a miles de profesionales que ya están optimizando sus instalaciones
                eléctricas con ElectriPro. La herramienta definitiva para el electricista moderno.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/dashboard" className="btn-primary text-xl py-5 px-10 shadow-2xl shadow-blue-600/30">
                  Empezar Gratis Ahora
                </Link>
                <a href="#pricing" className="btn-secondary text-xl py-5 px-10 border-2">
                  Ver Planes
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-950/40 relative scroll-mt-24 w-full">
        <div className="container-custom mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Planes que se adaptan a
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent italic"> tu éxito</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl leading-relaxed">
              Comienza gratis hoy mismo. Escala a medida que tu negocio crece.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-stretch pb-12">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card group p-12 bg-slate-900/40 border border-white/5 hover:border-blue-500/40 transition-all duration-500 rounded-[40px] relative flex flex-col ${plan.featured ? 'featured lg:scale-105 shadow-2xl shadow-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/20' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm font-semibold">
                    Más Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <span className="text-green-400"><CheckIcon /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`block text-center w-full py-3 rounded-xl font-semibold transition-all ${plan.featured
                    ? 'btn-primary'
                    : 'btn-secondary'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 relative overflow-hidden scroll-mt-24 w-full">
        <div className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent top-0"></div>
        <div className="container-custom mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
              Lo que dicen nuestros
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> usuarios</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Carlos Rodríguez',
                role: 'Instalador Autónomo',
                text: 'ElectriPro me ha permitido triplicar mi productividad. Los cálculos que antes me tomaban horas ahora los hago en minutos.'
              },
              {
                name: 'María González',
                role: 'Directora Técnica, ElecPro SL',
                text: 'La gestión de proyectos y la facturación integrada nos ha ahorrado contratar a una persona adicional para administración.'
              },
              {
                name: 'Antonio Martínez',
                role: 'Electricista Industrial',
                text: 'Los cálculos cumplen con toda la normativa REBT. Me da tranquilidad saber que mis instalaciones están bien dimensionadas.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 w-full">
        <div className="container-custom mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <ZapIcon />
                </div>
                <span className="text-xl font-bold text-white">ElectriPro</span>
              </Link>
              <p className="text-gray-400 text-sm">
                La plataforma todo-en-uno para profesionales de instalaciones eléctricas.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Actualizaciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Empleo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 ElectriPro. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
