# 🚀 Plan de Implementación - El Inge: Smart Grids

## Resumen del Proyecto
- **Repositorio**: https://github.com/samu1606/elIngeSmartGrids
- **Supabase**: https://elingesmartgrids-supabase-8f71a9-148-230-90-171.traefik.me
- **Dokploy VPS**: 148.230.90.171
- **Proyecto en Dokploy**: elingesmartgrids / production

---

## ✅ Fase 1: GitHub (COMPLETADO)
- [x] Inicializar repositorio Git
- [x] Crear .gitignore
- [x] Crear .env.example
- [x] Crear Dockerfile y nginx.conf
- [x] Push inicial al repositorio

---

## ⏳ Fase 2: Supabase - Base de Datos

### Esquema Creado
Las tablas están definidas en `supabase/migrations/001_initial_schema.sql`:

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario (extiende auth.users) |
| `clients` | Clientes del usuario |
| `projects` | Proyectos de ingeniería |
| `calculations` | Cálculos eléctricos guardados |
| `budgets` | Presupuestos |
| `budget_items` | Partidas del presupuesto |
| `expenses` | Gastos de obra |
| `agenda_events` | Eventos y citas |
| `reports` | Reportes generados |
| `subscriptions` | Historial de suscripciones |

### Pasos para Ejecutar la Migración

1. **Accede al SQL Editor de Supabase**:
   - URL: https://elingesmartgrids-supabase-8f71a9-148-230-90-171.traefik.me
   - Usuario: `supabase`
   - Contraseña: `vodxiwgmt33ppp7tduzsi4fi0hrce0oz`

2. **Navega a**: SQL Editor → New Query

3. **Copia y pega** el contenido completo de:
   ```
   supabase/migrations/001_initial_schema.sql
   ```

4. **Ejecuta** el script (botón Run o Ctrl+Enter)

5. **Verifica** en Table Editor que todas las tablas se crearon correctamente

---

## ⏳ Fase 3: Supabase - Autenticación

### Configuración de Auth

1. **Accede a**: Authentication → Providers

2. **Habilita Email Auth**:
   - Enable Email Signup: ✅
   - Confirm Email: ✅ (recomendado) o ❌ (para desarrollo)
   - Enable Email OTP: Opcional

3. **Configuración de dominio** (para emails):
   - Site URL: `https://tu-dominio.com` (el dominio de Dokploy)
   - Redirect URLs: 
     - `https://tu-dominio.com/*`
     - `http://localhost:5173/*` (desarrollo)

### Proveedores Opcionales (OAuth)
Si quieres agregar login con Google/GitHub:
1. Authentication → Providers → Google/GitHub
2. Configura las credenciales OAuth del proveedor

---

## ⏳ Fase 4: Dokploy - Despliegue

### Configuración del Servicio

1. **Accede a Dokploy**: http://148.230.90.171
   
2. **Ve al proyecto**: elingesmartgrids → production

3. **Agrega un nuevo servicio** (Application):
   - Nombre: `frontend`
   - Tipo: `Docker`
   
4. **Conecta con GitHub**:
   - Repository: `samu1606/elIngeSmartGrids`
   - Branch: `main`
   - Dockerfile Path: `./Dockerfile`

5. **Variables de Entorno** (en Dokploy):
   ```
   VITE_SUPABASE_URL=https://elingesmartgrids-supabase-8f71a9-148-230-90-171.traefik.me
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA1NjEyMzEsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.Z5Z_d8p6R97IZI2Y07m5nNv5qZL2LfNnIVSCj94zP7I
   ```

6. **Configuración de Build** (Build Args):
   ```
   VITE_SUPABASE_URL=https://elingesmartgrids-supabase-8f71a9-148-230-90-171.traefik.me
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

7. **Dominio/Puerto**:
   - Puerto expuesto: `80`
   - Configura un dominio o subdomain en Traefik File System

8. **Deploy** el servicio

---

## ⏳ Fase 5: CI/CD Automático

### Webhook de GitHub (Opcional pero Recomendado)

1. En Dokploy, copia el **Webhook URL** del servicio frontend

2. En GitHub → Settings → Webhooks → Add webhook:
   - Payload URL: [URL de Dokploy]
   - Content type: `application/json`
   - Events: `Just the push event`

3. Ahora cada push a `main` desplegará automáticamente

---

## 📋 Checklist Final

### Antes del Despliegue
- [ ] Ejecutar migración SQL en Supabase
- [ ] Verificar tablas creadas
- [ ] Configurar autenticación en Supabase
- [ ] Crear servicio en Dokploy
- [ ] Configurar variables de entorno
- [ ] Configurar dominio/SSL

### Post-Despliegue
- [ ] Verificar que la app carga correctamente
- [ ] Probar registro de usuario
- [ ] Probar login
- [ ] Verificar conexión con base de datos
- [ ] Configurar webhook para CI/CD

---

## 🔐 Credenciales (Guardadas Seguramente)

| Servicio | Variable | Valor |
|----------|----------|-------|
| Supabase | URL | https://elingesmartgrids-supabase-8f71a9-148-230-90-171.traefik.me |
| Supabase | ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| Supabase Dashboard | Usuario | supabase |
| Supabase Dashboard | Password | vodxiwgmt33ppp7tduzsi4fi0hrce0oz |
| VPS SSH | IP | 148.230.90.171 |

---

## 📞 Soporte

Si encuentras errores durante el despliegue:
1. Revisa los logs en Dokploy → Monitoring
2. Verifica las variables de entorno
3. Comprueba que el Dockerfile construye correctamente

---

**Fecha de creación**: 2026-02-09
**Versión**: 1.0.0
