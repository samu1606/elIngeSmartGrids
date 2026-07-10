/**
 * Internationalization (i18n) translations for El Inge Smart Grids.
 * Supports ES (Spanish) and EN (English).
 * 
 * Usage: import { t, getLocale } from "@/lib/i18n";
 * Call t("key") to get translated string.
 * Locale is stored in localStorage and defaults to "es".
 */

export type Locale = "es" | "en";

export const translations = {
  es: {
    // Hero
    "hero.title": "La plataforma completa para el mundo eléctrico",
    "hero.subtitle": "Conectamos ingenieros, técnicos, clientes y proveedores en un solo lugar. Calcula, gestiona, encuentra profesionales y cotiza materiales eléctricos bajo norma.",
    "hero.cta.start": "Comenzar Gratis",
    "hero.cta.features": "Ver Funciones",
    "hero.badge": "Conforme a NTC 2050 + RETIE",
    "hero.stat.time": "Ahorro de Tiempo",
    "hero.stat.precision": "Precisión Técnica",
    "hero.stat.prices": "Precios Locales",

    // RoleSelector
    "roles.title": "Elige tu perfil",
    "roles.subtitle": "Cada usuario ve solo lo que necesita. Sin ruido, sin funciones que no vas a usar.",
    "roles.question": "¿Cómo quieres usar El Inge Smart Grids?",
    "roles.pro.title": "Para profesionales",
    "roles.pro.desc": "Calculadora, proyectos, clientes, presupuestos, reportes RETIE y mucho más. Todo en una sola plataforma.",
    "roles.pro.badge": "Para ingenieros",
    "roles.cliente.title": "Necesito un técnico",
    "roles.cliente.desc": "Publica un trabajo, busca profesionales verificados y recibe cotizaciones.",
    "roles.cliente.badge": "Para clientes",
    "roles.tecnico.title": "Soy técnico",
    "roles.tecnico.desc": "Encuentra trabajos eléctricos, crea tu perfil y recibe solicitudes.",
    "roles.tecnico.badge": "Para profesionales",
    "roles.proveedor.title": "Soy proveedor",
    "roles.proveedor.desc": "Ofrece tus materiales y equipos a proyectos eléctricos activos.",
    "roles.proveedor.badge": "Para tiendas y distribuidores",
    "roles.start": "Empezar",
    "roles.note": "¿No sabes cuál elegir? Regístrate y cámbiate cuando quieras.",

    // Navbar
    "nav.features": "Características",
    "nav.pricing": "Precios",
    "nav.testimonials": "Testimonios",
    "nav.login": "Iniciar Sesión",
    "nav.register": "Pruébalo Gratis",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.calculadora": "Calculadora",
    "dashboard.proyectos": "Proyectos",
    "dashboard.clientes": "Clientes",
    "dashboard.presupuestos": "Presupuestos",
    "dashboard.agenda": "Agenda",
    "dashboard.reportes": "Reportes",
    "dashboard.tecnicos": "Técnicos",
    "dashboard.trabajos": "Trabajos",
    "dashboard.proveedores": "Proveedores",
    "dashboard.suscripcion": "Suscripción",
    "dashboard.ajustes": "Ajustes",
    "dashboard.fotovoltaico": "Fotovoltaico",

    // Tecnicos page
    "tecnicos.title": "Técnicos e Ingenieros",
    "tecnicos.subtitle": "Encuentra profesionales verificados para tus proyectos eléctricos",
    "tecnicos.register": "Registrar como técnico",
    "tecnicos.search": "Buscar por nombre o especialidad...",
    "tecnicos.verified": "Solo verificados",
    "tecnicos.available": "Disponible",
    "tecnicos.busy": "Ocupado",
    "tecnicos.viewProfile": "Ver perfil",
    "tecnicos.verificationTitle": "Verificación profesional",
    "tecnicos.verificationDesc": "Todos nuestros técnicos verifican su matrícula profesional y certificaciones. Soporte para Colombia (RETIE), USA (NEC License), México (Cédula PROF), España (CIE) y más países.",

    // Trabajos page
    "trabajos.title": "Trabajos",
    "trabajos.subtitle": "Publica o encuentra trabajos eléctricos",
    "trabajos.publish": "Publicar trabajo",
    "trabajos.cancel": "Cancelar",
    "trabajos.apply": "Aplicar",
    "trabajos.new": "Nuevo trabajo",
  },

  en: {
    // Hero
    "hero.title": "The complete platform for the electrical world",
    "hero.subtitle": "We connect engineers, technicians, clients and suppliers in one place. Calculate, manage, find professionals and quote electrical materials up to code.",
    "hero.cta.start": "Get Started Free",
    "hero.cta.features": "See Features",
    "hero.badge": "Compliant with NEC + UL Standards",
    "hero.stat.time": "Time Saved",
    "hero.stat.precision": "Technical Precision",
    "hero.stat.prices": "Local Pricing",

    // RoleSelector
    "roles.title": "Choose your profile",
    "roles.subtitle": "Each user sees only what they need. No noise, no features you won't use.",
    "roles.question": "How do you want to use El Inge Smart Grids?",
    "roles.pro.title": "For professionals",
    "roles.pro.desc": "Calculator, projects, clients, budgets, NEC reports and much more. All in one platform.",
    "roles.pro.badge": "For engineers",
    "roles.cliente.title": "I need a technician",
    "roles.cliente.desc": "Post a job, find verified professionals and get quotes.",
    "roles.cliente.badge": "For clients",
    "roles.tecnico.title": "I'm a technician",
    "roles.tecnico.desc": "Find electrical jobs, create your profile and get requests.",
    "roles.tecnico.badge": "For professionals",
    "roles.proveedor.title": "I'm a supplier",
    "roles.proveedor.desc": "Offer your materials and equipment to active electrical projects.",
    "roles.proveedor.badge": "For stores and distributors",
    "roles.start": "Get started",
    "roles.note": "Not sure which to choose? Sign up and switch anytime.",

    // Navbar
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.testimonials": "Testimonials",
    "nav.login": "Log In",
    "nav.register": "Try Free",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.calculadora": "Calculator",
    "dashboard.proyectos": "Projects",
    "dashboard.clientes": "Clients",
    "dashboard.presupuestos": "Budgets",
    "dashboard.agenda": "Schedule",
    "dashboard.reportes": "Reports",
    "dashboard.tecnicos": "Technicians",
    "dashboard.trabajos": "Jobs",
    "dashboard.proveedores": "Suppliers",
    "dashboard.suscripcion": "Subscription",
    "dashboard.ajustes": "Settings",
    "dashboard.fotovoltaico": "Solar",

    // Tecnicos page
    "tecnicos.title": "Technicians & Engineers",
    "tecnicos.subtitle": "Find verified professionals for your electrical projects",
    "tecnicos.register": "Register as technician",
    "tecnicos.search": "Search by name or specialty...",
    "tecnicos.verified": "Verified only",
    "tecnicos.available": "Available",
    "tecnicos.busy": "Busy",
    "tecnicos.viewProfile": "View profile",
    "tecnicos.verificationTitle": "Professional verification",
    "tecnicos.verificationDesc": "All our technicians verify their professional license and certifications. Support for USA (NEC License), Colombia (RETIE), Mexico (Cédula PROF), Spain (CIE) and more countries.",

    // Trabajos page
    "trabajos.title": "Jobs",
    "trabajos.subtitle": "Post or find electrical jobs",
    "trabajos.publish": "Post a job",
    "trabajos.cancel": "Cancel",
    "trabajos.apply": "Apply",
    "trabajos.new": "New job",
  },
};

export function getLocale(): Locale {
  if (typeof window === "undefined") return "es";
  return (localStorage.getItem("locale") as Locale) || "es";
}

export function t(key: string): string {
  const locale = getLocale();
  const dict = translations[locale] || translations.es;
  return dict[key as keyof typeof dict] || translations.es[key as keyof typeof.es] || key;
}