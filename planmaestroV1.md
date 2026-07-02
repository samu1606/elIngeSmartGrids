# Plan Maestro V1: El Inge — Smart Grids

> Plataforma SaaS para ingenieros eléctricos en Colombia. NTC 2050 + RETIE.
> **Fecha:** 16 Feb 2026 · **Versión:** 1.0

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología | Función |
|------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + Lucide Icons | UI, routing, SSR landing |
| **Backend** | FastAPI (Python) | Cálculos técnicos NTC 2050, lógica de negocio |
| **Auth & DB** | Supabase (PostgreSQL + Auth) | Autenticación, base de datos, RLS |
| **Gráficos** | Recharts | Charts en dashboard y reportes |
| **Repositorio** | GitHub | Versionamiento, CI/CD trigger |
| **Deploy** | Dokploy en VPS Hostinger | Contenedores Docker (Next.js + FastAPI), auto-deploy desde `main` |

### Arquitectura de Servicios

```
┌──────────────────────────────────────────────────────────┐
│                    VPS Hostinger (Dokploy)                │
│  ┌─────────────────────┐   ┌──────────────────────────┐  │
│  │  Next.js (Puerto 3000) │   │  FastAPI (Puerto 8000)    │  │
│  │  - Landing pública    │   │  - /api/calculos/seccion  │  │
│  │  - Dashboard UI       │──▶│  - /api/calculos/motor    │  │
│  │  - Auth pages         │   │  - /api/calculos/protec.  │  │
│  │  - API proxy routes   │   │  - Tablas NTC 2050        │  │
│  └─────────┬───────────┘   └──────────────────────────┘  │
│            │                                              │
│            ▼                                              │
│  ┌─────────────────────────┐                              │
│  │  Supabase (Cloud/Self)   │                              │
│  │  - Auth (JWT)            │                              │
│  │  - PostgreSQL (RLS)      │                              │
│  └─────────────────────────┘                              │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
elingesmartgridsV3/
├── frontend/                       # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing)/          # Rutas públicas
│   │   │   │   ├── page.tsx        # Landing / Hero
│   │   │   │   └── layout.tsx      # Navbar + Footer
│   │   │   ├── (auth)/             # Login / Register
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/        # Rutas protegidas
│   │   │   │   ├── layout.tsx      # Sidebar + Header
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── calculadora/page.tsx
│   │   │   │   ├── proyectos/page.tsx
│   │   │   │   ├── clientes/page.tsx
│   │   │   │   ├── presupuestos/page.tsx
│   │   │   │   ├── agenda/page.tsx
│   │   │   │   ├── reportes/page.tsx
│   │   │   │   └── ajustes/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                 # Button, Card, Input, Badge, Modal
│   │   │   ├── landing/            # Hero, Features, Pricing, Testimonials
│   │   │   ├── dashboard/          # KPICard, QuickCalc, RecentProjects
│   │   │   ├── sidebar/            # Sidebar, SidebarItem
│   │   │   └── shared/             # Header, Loader, SearchBar
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts       # Browser client
│   │   │   │   ├── server.ts       # Server client
│   │   │   │   └── middleware.ts   # Auth middleware
│   │   │   ├── api.ts              # Fetch wrapper → FastAPI
│   │   │   └── utils.ts
│   │   ├── hooks/                  # useAuth, useClients, useBudgets
│   │   └── types/                  # TypeScript interfaces
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   ├── Dockerfile
│   └── package.json
│
├── backend/                        # FastAPI App
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point + CORS
│   │   ├── routers/
│   │   │   ├── calculos.py         # Endpoints de cálculos
│   │   │   └── health.py           # Health check
│   │   ├── services/
│   │   │   ├── conductores.py      # Lógica Tabla 310-16 NTC 2050
│   │   │   ├── protecciones.py     # Protecciones térmicas
│   │   │   ├── motores.py          # Dimensionamiento motores
│   │   │   ├── iluminacion.py      # Cálculos iluminación
│   │   │   ├── reactiva.py         # Compensación reactiva
│   │   │   └── puesta_tierra.py    # Puesta a tierra
│   │   ├── data/
│   │   │   └── ntc2050_tables.py   # Tablas NTC 2050 como dicts
│   │   └── schemas/
│   │       └── calculos.py         # Pydantic models (request/response)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
│       └── test_calculos.py
│
├── docker-compose.yml              # Orquestación Next.js + FastAPI
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD → push main → Dokploy
├── docs/
│   └── IMAGENES/                   # Mockups de referencia
└── .env.example
```

---

## 🎯 Fases de Ejecución

---

### Fase 0: Scaffold & Configuración Base ⚙️
> Objetivo: Ambos servicios corriendo en localhost.

**Frontend (Next.js):**
- [ ] Inicializar proyecto Next.js 14 con `create-next-app` (App Router + TS + Tailwind)
- [ ] Instalar deps: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `recharts`
- [ ] `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Configurar Supabase clients (browser + server)
- [ ] Crear `lib/api.ts` — wrapper para llamadas a FastAPI
- [ ] Root layout con fuentes Inter + Outfit (Google Fonts)

**Backend (FastAPI):**
- [ ] Crear estructura `backend/` con `main.py`
- [ ] `requirements.txt`: `fastapi`, `uvicorn`, `pydantic`
- [ ] Configurar CORS para permitir `localhost:3000`
- [ ] Endpoint de health check: `GET /api/health`
- [ ] `Dockerfile` para FastAPI

**Docker:**
- [ ] `docker-compose.yml` con servicios `frontend` (puerto 3000) y `backend` (puerto 8000)
- [ ] Verificar que ambos servicios se levanten juntos

---

### Fase 1: Landing Page 🏠
> Referencia: `portada.png` · Acceso público, sin login requerido.

**Secciones a crear:**

| # | Sección | Descripción |
|---|---------|-------------|
| 1 | **Navbar** | Logo + links (Características, Precios, Testimonios) + Login + CTA |
| 2 | **Hero** | Título bold + subtítulo + CTAs + badge "50,000+" + stats |
| 3 | **Características** | Grid 2x2: Cálculos, Gestión de Obras, Facturación, Normativa |
| 4 | **Precios** | 3 planes: Básico $0, Pro $50.000, Enterprise $150.000 COP |
| 5 | **Testimonios** | 3 cards con estrellas, texto y avatar |
| 6 | **CTA Final** | "¿Listo para Digitalizar tu Negocio?" + botones |
| 7 | **Footer** | Links por categoría + newsletter + redes |

**Tareas:**
- [ ] `(landing)/layout.tsx` — Navbar + Footer
- [ ] `(landing)/page.tsx` — Todas las secciones
- [ ] Componentes: `Navbar`, `Hero`, `Features`, `PricingCards`, `Testimonials`, `CTABanner`, `Footer`
- [ ] Diseño responsive mobile-first
- [ ] Paleta de colores: fondo oscuro `#0F172A`, verde `#1DB954`, tarjetas blancas

---

### Fase 2: Autenticación 🔐
> Login/Register con Supabase Auth.

- [ ] Página `/login` — email + password + link a register
- [ ] Página `/register` — nombre + email + password
- [ ] Integrar `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`
- [ ] Middleware de protección: rutas `(dashboard)/*` requieren sesión activa
- [ ] Redirect post-login → `/dashboard`
- [ ] Manejo de sesión con `@supabase/ssr`
- [ ] Crear tabla `profiles` en Supabase (trigger on auth.users insert)

---

### Fase 3: Dashboard Layout (Sidebar + Header) 📐
> Referencia: Sidebar visible en todos los mockups.

**Sidebar:**

| Icono (Lucide) | Label | Ruta |
|----------------|-------|------|
| `LayoutDashboard` | Dashboard | `/dashboard` |
| `Calculator` | Calculadora | `/dashboard/calculadora` |
| `FolderOpen` | Proyectos | `/dashboard/proyectos` |
| `Users` | Clientes | `/dashboard/clientes` |
| `FileText` | Presupuestos | `/dashboard/presupuestos` |
| `Calendar` | Agenda | `/dashboard/agenda` |
| `BarChart3` | Reportes | `/dashboard/reportes` |
| `Settings` | Ajustes | `/dashboard/ajustes` |

**Tareas:**
- [ ] `(dashboard)/layout.tsx` — Sidebar izq + Header top + área de contenido
- [ ] Sidebar: logo, nav, usuario (avatar + nombre + rol), cerrar sesión
- [ ] Header: barra búsqueda, campana notificaciones, perfil
- [ ] Sidebar colapsable en mobile
- [ ] Item activo resaltado en verde `#1DB954`
- [ ] Fondo general `#F8FAFC`, sidebar `#0F172A`

---

### Fase 4: Dashboard Principal 📊
> Referencia: `dashboard.png`

**Componentes:**

| Widget | Descripción |
|--------|-------------|
| **Bienvenida** | "Bienvenido de nuevo, {nombre}" + fecha + btn Nuevo Proyecto |
| **KPI Cards ×3** | Proyectos Activos, Capacidad Total, Ahorro Mensual |
| **Calculadora Rápida** | V × I = Potencia (Watts) — llama a FastAPI |
| **Proyectos Recientes** | Tabla: Proyecto, Cliente, Estado (badge), Progreso (barra) |
| **KPI Footer ×4** | Eficiencia RETIE, Citas Hoy, Presupuestos, Alertas |

**Tareas:**
- [ ] Página `/dashboard`
- [ ] `KPICard` reutilizable (icono, valor, label, badge de tendencia)
- [ ] `QuickCalculator` — inputs V + I, botón calcular, POST a FastAPI `/api/calculos/potencia`
- [ ] `RecentProjects` — tabla con datos mock
- [ ] `BottomKPIs` — 4 mini cards
- [ ] Grid responsive: 1 col mobile → 3 cols desktop

---

### Fase 5: Calculadora de Conductores ⚡
> Referencia: `calculadora.png` · Lógica pesada en FastAPI.

**6 Tabs:**

| Tab | Endpoint FastAPI |
|-----|-----------------|
| Sección | `POST /api/calculos/seccion` |
| Protecciones | `POST /api/calculos/protecciones` |
| Motores | `POST /api/calculos/motores` |
| Iluminación | `POST /api/calculos/iluminacion` |
| Reactiva | `POST /api/calculos/reactiva` |
| Puesta a Tierra | `POST /api/calculos/puesta-tierra` |

**Tab Sección (principal) — Parámetros:**
- Potencia (W), Tensión (V): 120/208/220/440
- Factor de Potencia: 0.90 default
- Sistema: Trifásico / Monofásico (toggle)
- Material: Cobre (Cu) / Aluminio (Al)
- Aislamiento: XLPE (90°C) / THHN
- Longitud (m), Caída de tensión máx (%)

**Resultados:** Calibre sugerido, corriente, caída real, ref. Tabla 310-16.

**Tareas Frontend:**
- [ ] Página `/dashboard/calculadora`
- [ ] Sistema de tabs con navegación
- [ ] Formulario de entrada (tab Sección)
- [ ] Panel de resultados con loading state
- [ ] Nota técnica al pie
- [ ] Tabs 2-6: placeholder "Próximamente" (se habilitan en iteraciones)

**Tareas Backend (FastAPI):**
- [ ] `data/ntc2050_tables.py` — Tabla 310-16 como diccionario Python
- [ ] `schemas/calculos.py` — Pydantic models para request/response
- [ ] `services/conductores.py` — Lógica de cálculo de sección
- [ ] `routers/calculos.py` — Endpoints REST
- [ ] Test básico: `tests/test_calculos.py`

---

### Fase 6: Gestión de Clientes 👥
> Referencia: `clientes.png`

**Componentes:**
- **KPIs ×4:** Total Clientes, Empresas, Particulares, Facturado Total
- **Toolbar:** Buscador + vista grid/lista + btn "+ Nuevo Cliente"
- **ClientCard:** Avatar (iniciales), nombre, tipo badge, teléfono, email, ubicación, proyectos, facturado, acciones
- **Modal:** Formulario nuevo cliente

**Tareas:**
- [ ] Página `/dashboard/clientes`
- [ ] `ClientCard` + `ClientList` (dos vistas)
- [ ] Buscador con filtro local
- [ ] Toggle grid/lista
- [ ] Modal "Nuevo Cliente"
- [ ] Datos mock iniciales (4 clientes)
- [ ] CRUD contra Supabase (tabla `clients`)

---

### Fase 7: Presupuestos 📄
> Referencia: `presupuestos.png`

**Componentes:**
- **KPIs ×4:** Total, Pendientes, Aceptados, Valor Total COP
- **Tabla:** Nº Presupuesto, Cliente, Proyecto, Fecha, Válido Hasta, Total, Estado
- **Badges de estado:** Pendiente 🟡, Aceptado 🟢, Enviado 🔵, Rechazado 🔴
- **Paginación:** "Mostrando 1 a 5 de X" + prev/next

**Tareas:**
- [ ] Página `/dashboard/presupuestos`
- [ ] `BudgetTable` con paginación
- [ ] Badges de estado con colores
- [ ] Modal "Nuevo Presupuesto"
- [ ] Datos mock (5 presupuestos)

---

### Fase 8: Agenda 📅
> Referencia: `agenda.png`

**Componentes:**
- **Calendario semanal:** Mes/Semana/Día toggle + nav ← Hoy →
- **Event blocks** coloreados por tipo: Visita Técnica (verde), Mantenimiento (naranja), Instalación (morado), Auditoría (azul)
- **Citas de Hoy (panel derecho):** Cards con tipo, hora, título, ubicación, avatar
- **Resumen Semanal:** Completas + Pendientes
- **Btn "Nueva Cita"**

**Tareas:**
- [ ] Página `/dashboard/agenda`
- [ ] `WeekCalendar` — grid 7 columnas con bloques
- [ ] `EventBlock` — bloque individual coloreado
- [ ] `TodayEvents` — panel lateral
- [ ] `WeeklySummary` — contadores
- [ ] Datos mock de eventos

---

### Fase 9: Reportes 📈
> Referencia: `reportes.png` · Charts con Recharts.

**Componentes:**
- **Header:** "Análisis Operativo" + badge PRO + filtro período + btn Exportar
- **KPIs ×4:** Proyectos Completados, Margen Utilidad, Eficiencia Materiales, Tiempo Entrega
- **Ingresos vs Gastos:** Bar chart dual (Recharts)
- **Eficiencia Materiales:** Donut chart + breakdown
- **Proyectos por Mes:** Bar chart 12 meses
- **Eficiencia por Operador:** Tabla con avatar, proyectos, barra calidad, rating

**Tareas:**
- [ ] Página `/dashboard/reportes`
- [ ] Integrar Recharts: `RevenueChart`, `MaterialDonut`, `MonthlyBar`
- [ ] `OperatorTable` con ratings
- [ ] Datos mock realistas
- [ ] Badge "PRO MODE" (solo visual en V1)

---

## 🗄️ Esquema de Base de Datos (Supabase)

```sql
-- Perfiles (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'Ingeniero Eléctrico',
  avatar_url TEXT,
  company TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'basic',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'empresa',
  nit TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'en_proceso',
  progress INTEGER DEFAULT 0,
  capacity_kw NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presupuestos
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  number TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pendiente',
  issue_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos / Citas
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

---

## 🎨 Design Tokens

```css
/* Colores */
--primary: #1DB954;          /* Verde principal */
--primary-dark: #17a348;     /* Hover */
--sidebar-bg: #0F172A;       /* Sidebar oscuro */
--bg: #F8FAFC;               /* Fondo dashboard */
--card: #FFFFFF;             /* Cards */
--text: #1E293B;             /* Texto principal */
--muted: #64748B;            /* Texto secundario */
--border: #E2E8F0;           /* Bordes */

/* Estados */
--success: #22C55E;          /* Completado */
--warning: #EAB308;          /* Pendiente */
--info: #3B82F6;             /* Enviado */
--danger: #EF4444;           /* Rechazado */

/* Fuentes */
--font-body: 'Inter', sans-serif;
--font-display: 'Outfit', sans-serif;
```

---

## 🐳 Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
```

---

## 🚀 Deploy (Dokploy + GitHub)

1. **GitHub:** Repo con ramas `main` (producción) y `develop`
2. **Dokploy:** Configurar en VPS Hostinger para escuchar pushes a `main`
3. **Auto-deploy:** Push → Build containers → Deploy Next.js + FastAPI
4. **Dominio:** Configurar reverse proxy en Dokploy para el dominio

---

## ✅ Checklist de Ejecución

| # | Fase | Qué incluye | Estado |
|---|------|-------------|--------|
| 0 | **Scaffold** | Next.js + FastAPI + Docker + env | ⬜ |
| 1 | **Landing** | 7 secciones públicas | ⬜ |
| 2 | **Auth** | Login, Register, Middleware | ⬜ |
| 3 | **Layout** | Sidebar + Header persistentes | ⬜ |
| 4 | **Dashboard** | KPIs, Calc rápida, Proyectos | ⬜ |
| 5 | **Calculadora** | 6 tabs + FastAPI endpoints | ⬜ |
| 6 | **Clientes** | Cards, búsqueda, CRUD | ⬜ |
| 7 | **Presupuestos** | Tabla, estados, paginación | ⬜ |
| 8 | **Agenda** | Calendario semanal, citas | ⬜ |
| 9 | **Reportes** | Charts Recharts, KPIs | ⬜ |

---

## 📝 Estrategia V1

- **Datos mock** en todas las secciones para tener UI funcional desde el día 1.
- **CRUD real** solo en Clientes (primera tabla conectada a Supabase).
- **FastAPI** operativo desde Fase 0: health check, y desde Fase 4-5: cálculos reales.
- **Calculadora:** Solo tab "Sección" funcional en V1; tabs 2-6 como placeholders.
- Las siguientes iteraciones agregarán: PDF export, CRUD completo en todas las tablas, Google Maps en agenda, y más tabs de cálculos.
